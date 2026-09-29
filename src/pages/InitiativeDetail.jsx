import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import MembersContacts from '../components/MembersContacts.jsx'
import NavIcon from '../components/NavIcon.jsx'
import { getCityName } from '../data/cities.js'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'
import { useProfilesByUids } from '../lib/useProfilesByUids.js'
import { initials } from '../data/currentUser.js'
import { kindFor, projectTypeFor } from '../lib/initiativeKind.js'

// Los recursos subidos no traen guardado si son imagen (uploadFile sí
// regresa el mime type, pero se descarta al guardarse en el arreglo de
// resources — ver handleFileUpload en NewInitiative.jsx) — se detecta por
// extensión en vez de eso, para que también funcione con ligas externas
// (ej. una imagen pegada desde otro sitio, no solo lo subido aquí).
const IMAGE_URL_RE = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i
function isImageResource(r) {
  return IMAGE_URL_RE.test(r.url || '') || IMAGE_URL_RE.test(r.label || '')
}

function InterestedPeople({ uids }) {
  const people = useProfilesByUids(uids)
  if (!uids || uids.length === 0) return null

  return (
    <div style={{ marginTop: 40 }}>
      <span className="kicker">Personas interesadas</span>
      <div className="tile-grid" style={{ margin: '16px 0 0' }}>
        {people.map((p) => (
          <div className="tile" key={p.uid}>
            <span className="app-profile-avatar" style={{ marginBottom: 8 }}>
              {p.photo ? <img src={p.photo} alt="" /> : initials(p.name)}
            </span>
            <span className="tile-title">{p.name || 'Sin nombre'}</span>
            <p className="tile-text">{p.occupation}{p.city ? ` — ${getCityName(p.city)}` : ''}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddMemberForm({ onAdd, noun }) {
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || busy) return
    setBusy(true)
    setStatus(null)
    const result = await onAdd(username)
    setBusy(false)
    if (result?.error) {
      setStatus({ type: 'error', text: result.error })
    } else {
      setStatus({ type: 'ok', text: 'Cuenta ligada correctamente.' })
      setUsername('')
    }
  }

  return (
    <form onSubmit={submit} className="dossier-card">
      <label className="form-field">
        <span>+ Ligar otra cuenta a {noun === 'institución/organización' ? 'esta' : 'este'} {noun} (ej. un cofundador)</span>
        <div className="resource-add-row">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@usuario"
            disabled={busy}
          />
          <button type="submit" className="btn btn-ghost" disabled={busy}>{busy ? 'Ligando…' : 'Ligar'}</button>
        </div>
      </label>
      {status && (
        <p style={{ color: status.type === 'error' ? '#c0392b' : 'inherit', fontSize: 13.5, marginTop: 6 }}>
          {status.text}
        </p>
      )}
    </form>
  )
}

// Vive en dos rutas distintas según de dónde vengas:
//  - /iniciativas/:slug        (variant="public") — parte de la landing, con Header/Footer.
//  - /app/iniciativas/:slug    (variant="app")    — parte del dashboard, nunca te saca a la landing.
// El contenido del dossier es el mismo en ambos casos; solo cambia el
// "chrome" alrededor, a dónde regresa el link de "volver", y si se ven los
// controles de dueño/cofundador (agregar/quitar gente, editar) — esos solo
// aparecen dentro del dashboard y solo para quien sea miembro de verdad.
export default function InitiativeDetail({ variant = 'public' }) {
  const { slug } = useParams()
  const isApp = variant === 'app'
  const backTo = isApp ? '/app/iniciativas' : '/iniciativas'
  const { user } = useAuth()
  const { addInitiativeMember, removeInitiativeMember } = useUserContent()

  const [remote, setRemote] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    setRemote(undefined)
    getDocs(query(collection(db, 'initiatives'), where('slug', '==', slug))).then((snap) => {
      if (cancelled) return
      setRemote(snap.empty ? null : { ...snap.docs[0].data(), docId: snap.docs[0].id })
    })
    return () => { cancelled = true }
  }, [slug])

  const initiative = remote
  const loading = remote === undefined
  const isMember = Boolean(user && initiative?.memberUids?.includes(user.uid))
  const isOwner = Boolean(user && initiative?.ownerUid === user.uid)
  const interested = Boolean(user && initiative?.interestedBy?.includes(user.uid))

  const toggleInterest = async () => {
    if (!initiative?.docId || !user) return
    const ref = doc(db, 'initiatives', initiative.docId)
    if (interested) {
      await updateDoc(ref, { interestedBy: arrayRemove(user.uid) })
      setRemote((r) => ({ ...r, interestedBy: (r.interestedBy || []).filter((id) => id !== user.uid) }))
    } else {
      await updateDoc(ref, { interestedBy: arrayUnion(user.uid) })
      setRemote((r) => ({ ...r, interestedBy: [...(r.interestedBy || []), user.uid] }))
    }
  }

  const handleAddMember = async (username) => {
    const result = await addInitiativeMember(initiative, username)
    if (result?.ok) {
      const snap = await getDocs(query(collection(db, 'initiatives'), where('slug', '==', slug)))
      if (!snap.empty) setRemote({ ...snap.docs[0].data(), docId: snap.docs[0].id })
    }
    return result
  }

  const handleRemoveMember = async (uid) => {
    await removeInitiativeMember(initiative, uid)
    setRemote((r) => ({ ...r, memberUids: (r.memberUids || []).filter((id) => id !== uid) }))
  }

  if (loading) {
    const loadingBody = <p className="auth-sub">Cargando…</p>
    return isApp ? (
      <DashboardLayout eyebrow="Emprendimientos" title="Dossier">{loadingBody}</DashboardLayout>
    ) : (
      <>
        <Header />
        <section className="auth-section">{loadingBody}</section>
        <Footer />
      </>
    )
  }

  if (!initiative) {
    const notFound = (
      <div className="auth-card">
        <span className="kicker">No encontrada</span>
        <h1 className="auth-title">Ese emprendimiento no está en el mapa</h1>
        <p className="auth-sub">Puede que se haya movido de nombre, o que todavía no exista.</p>
        <Link to={backTo} className="btn btn-primary">Volver al catálogo</Link>
      </div>
    )
    if (isApp) {
      return (
        <DashboardLayout eyebrow="Emprendimientos" title="No encontrada">
          {notFound}
        </DashboardLayout>
      )
    }
    return (
      <>
        <Header />
        <section className="auth-section">{notFound}</section>
        <Footer />
      </>
    )
  }

  const {
    id, stage, title, org, location, city, link, odsLabel, odsSecondaryLabel,
    industryLabel, industrySecondaryLabel, causeLabel, need, desc, longDesc, collaborators, impact,
    ownerUid, ownerProfileType, ownerProfileSubtype, memberUids, resources, logoUrl,
  } = initiative
  const kind = kindFor(ownerProfileType, ownerProfileSubtype)
  const projectType = projectTypeFor(ownerProfileType, ownerProfileSubtype)
  const imageResources = (resources || []).filter(isImageResource)
  const otherResources = (resources || []).filter((r) => !isImageResource(r))
  const isRemote = city === 'remoto'

  const body = (
    <div className="in">
      <div className="dossier-topbar">
        <Link to={backTo} className="link-arrow">← Volver al catálogo</Link>
        <span className="dossier-topbar-label">DOSSIER</span>
      </div>

      <div className="dossier-header">
        <div className="dossier-header-row">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="dossier-logo" />
          ) : (
            <div className="dossier-logo-placeholder"><NavIcon name="box" size={34} /></div>
          )}
          <div className="dossier-head-main">
            <div className="dossier-status-line">
              N° {String(id).padStart(3, '0')} · {stage.toUpperCase()}
              {projectType !== 'emprendimientos' && ` · ${kind.Noun.toUpperCase()}`}
            </div>
            <h1 className="detail-title">{title}</h1>
            <p className="dossier-subtitle">{org} — {getCityName(city) || location}</p>
          </div>
        </div>
        <div className="dossier-tags">
          {odsLabel && <span className="chip">{odsLabel}</span>}
          {odsSecondaryLabel && <span className="chip">{odsSecondaryLabel}</span>}
          {industryLabel && <span className="chip">{industryLabel}</span>}
          {industrySecondaryLabel && <span className="chip">{industrySecondaryLabel}</span>}
          {causeLabel && <span className="chip">{causeLabel}</span>}
        </div>
      </div>

      <div className="dossier-grid">
        <div className="dossier-main">
          <p className="detail-lede">{desc}</p>
          {longDesc && longDesc !== desc && <p style={{ color: 'var(--text-soft)', fontSize: 15.5, lineHeight: 1.65 }}>{longDesc}</p>}

          <hr className="dossier-rule" />

          <div className="dossier-meta-row">
            {impact && (
              <div className="dossier-section">
                <span className="kicker">Impacto</span>
                <p className="dossier-meta-value">{impact}</p>
              </div>
            )}
            {collaborators?.length > 0 && (
              <div className="dossier-section">
                <span className="kicker">Colaboradores</span>
                <p className="dossier-meta-value">{collaborators.join(', ')}</p>
              </div>
            )}
            {!impact && isRemote && (
              <div className="dossier-section">
                <span className="kicker">Modalidad</span>
                <p className="dossier-meta-value">Remoto</p>
              </div>
            )}
            {link && (
              <div className="dossier-section">
                <span className="kicker">Sitio</span>
                <p className="dossier-meta-value"><a href={link} target="_blank" rel="noreferrer" className="link-arrow">Visitar sitio →</a></p>
              </div>
            )}
          </div>

          <div className="dossier-section">
            <span className="kicker">Documentos y ligas</span>
            {resources?.length > 0 ? (
              <>
                {imageResources.length > 0 && (
                  <div className="dossier-gallery">
                    {imageResources.map((r, i) => (
                      <a href={r.url} target="_blank" rel="noreferrer" key={`${r.url}-${i}`} className="dossier-gallery-item">
                        <img src={r.url} alt={r.label} />
                      </a>
                    ))}
                  </div>
                )}
                {otherResources.length > 0 && (
                  <ul className="resource-link-list" style={{ marginTop: imageResources.length > 0 ? 14 : 10 }}>
                    {otherResources.map((r, i) => (
                      <li key={`${r.url}-${i}`}>
                        <a href={r.url} target="_blank" rel="noreferrer">
                          {r.type === 'video' ? '▶' : '🔗'} {r.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="dossier-empty-box">Aún no hay documentos</div>
            )}
          </div>
        </div>

        <div className="dossier-sidebar">
          <div className="dossier-card">
            <span className="kicker">Busca ahora</span>
            <p className="dossier-need-value">{need || 'Por definir'}</p>
          </div>

          <div className="dossier-card">
            <span className="kicker">Contacto</span>
            <MembersContacts
              ownerUid={ownerUid}
              memberUids={memberUids}
              onRemove={isOwner ? handleRemoveMember : undefined}
              canManage={isApp && isOwner}
              linkToProfiles={isApp}
            />
          </div>

          {isApp && isOwner && <AddMemberForm onAdd={handleAddMember} noun={kind.noun} />}

          {isApp && isMember && (
            <Link to={`/app/iniciativas/${slug}/editar`} className="btn btn-ghost dossier-action">Editar {kind.noun}</Link>
          )}

          {isApp && user && !isMember && initiative.docId && (
            <button type="button" className={`btn dossier-action ${interested ? 'btn-ghost' : 'btn-primary'}`} onClick={toggleInterest}>
              {interested ? '✓ Ya no me interesa' : 'Me interesa →'}
            </button>
          )}
        </div>
      </div>

      {isApp && isMember && <InterestedPeople uids={initiative.interestedBy} />}
    </div>
  )

  if (isApp) {
    return (
      <DashboardLayout eyebrow="Emprendimientos" title="Dossier">
        {body}
      </DashboardLayout>
    )
  }

  return (
    <>
      <Header />
      <section className="detail-section">{body}</section>
      <Footer />
    </>
  )
}
