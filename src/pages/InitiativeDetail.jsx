import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import MembersContacts from '../components/MembersContacts.jsx'
import { getCityName } from '../data/cities.js'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'
import { useProfilesByUids } from '../lib/useProfilesByUids.js'
import { initials } from '../data/currentUser.js'
import { kindFor, projectTypeFor } from '../lib/initiativeKind.js'

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
    <form onSubmit={submit} style={{ marginTop: 16 }}>
      <label className="form-field">
        <span>Ligar otra cuenta a {noun === 'institución/organización' ? 'esta' : 'este'} {noun} (ej. un cofundador)</span>
        <div className="resource-add-row">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@usuario"
            disabled={busy}
          />
          <button type="submit" className="btn btn-ghost" disabled={busy}>{busy ? 'Ligando…' : 'Ligar cuenta'}</button>
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
    ownerUid, ownerProfileType, ownerProfileSubtype, memberUids, resources,
  } = initiative
  const kind = kindFor(ownerProfileType, ownerProfileSubtype)
  const projectType = projectTypeFor(ownerProfileType, ownerProfileSubtype)

  const body = (
    <div className="in">
      <Link to={backTo} className="link-arrow back-link">← Volver al catálogo</Link>

      <div className="detail-head">
        <div className="cat-id">
          N° {String(id).padStart(3, '0')} — {stage.toUpperCase()}
          {projectType !== 'emprendimientos' && ` · ${kind.Noun.toUpperCase()}`}
        </div>
        <h1 className="detail-title">{title}</h1>
        <p className="cat-org">{org} — {getCityName(city) || location}</p>
        <div className="cat-tags">
          <span>{odsLabel}</span>
          {odsSecondaryLabel && <span>{odsSecondaryLabel}</span>}
          {industryLabel && <span>{industryLabel}</span>}
          {industrySecondaryLabel && <span>{industrySecondaryLabel}</span>}
          {causeLabel && <span>{causeLabel}</span>}
        </div>
      </div>

      <div className="detail-body">
        <p className="detail-lede">{desc}</p>
        {longDesc && longDesc !== desc && <p>{longDesc}</p>}
        {impact && <p><b>Impacto: </b>{impact}</p>}
        {collaborators?.length > 0 && <p><b>Colaboradores: </b>{collaborators.join(', ')}</p>}
        {link && <p><a href={link} target="_blank" rel="noreferrer" className="link-arrow">Visitar sitio →</a></p>}
        {resources?.length > 0 && (
          <div className="resource-group" style={{ marginTop: 20 }}>
            <span className="kicker">Documentos y ligas</span>
            <ul className="resource-link-list" style={{ marginTop: 10 }}>
              {resources.map((r, i) => (
                <li key={`${r.url}-${i}`}>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.type === 'video' ? '▶' : r.type === 'file' ? '📎' : '🔗'} {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="detail-side">
        <div className="need-block">
          <span className="kicker">Busca ahora</span>
          <p className="need-big">{need}</p>
        </div>

        <MembersContacts
          ownerUid={ownerUid}
          memberUids={memberUids}
          onRemove={isOwner ? handleRemoveMember : undefined}
          canManage={isApp && isOwner}
          linkToProfiles={isApp}
        />

        {isApp && user && !isMember && initiative.docId && (
          <button type="button" className={`btn ${interested ? 'btn-ghost' : 'btn-primary'}`} onClick={toggleInterest} style={{ marginTop: 16 }}>
            {interested ? '✓ Ya no me interesa' : 'Me interesa →'}
          </button>
        )}
      </div>

      {isApp && isOwner && <AddMemberForm onAdd={handleAddMember} noun={kind.noun} />}

      {isApp && isMember && <InterestedPeople uids={initiative.interestedBy} />}

      {isApp && isMember && (
        <div className="form-actions" style={{ marginTop: 32 }}>
          <Link to={`/app/iniciativas/${slug}/editar`} className="btn btn-ghost">Editar {kind.noun}</Link>
        </div>
      )}
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
