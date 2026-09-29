import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { ODS_FILTERS } from '../data/initiatives.js'
import { getCityName } from '../data/cities.js'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { PROFILE_TYPES, STUDENT_SUBTYPES } from '../data/profileOptions.js'

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function profileToPerson(p, uid) {
  const odsLabel = ODS_FILTERS.find((f) => f.id === p.interests?.[0])?.label ?? ''
  const offers = p.profileType === 'mentor'
    ? [p.expertise].filter(Boolean)
    : p.profileType === 'organizacion'
      ? [p.causeLabel].filter(Boolean)
      : [p.industryLabel, p.industrySecondaryLabel].filter(Boolean)
  const baseTypeLabel = PROFILE_TYPES.find((t) => t.id === p.profileType)?.label
  const subtypeLabel = p.profileType === 'estudiante' ? STUDENT_SUBTYPES.find((s) => s.id === p.subtype)?.label : ''
  return {
    uid,
    name: p.name,
    username: p.username,
    role: p.occupation,
    location: getCityName(p.city) || p.location,
    odsLabel,
    profileTypeLabel: subtypeLabel ? `${baseTypeLabel} · ${subtypeLabel}` : baseTypeLabel,
    offers,
    advisoryOffer: p.advisoryOffer,
    orgActivity: p.orgActivity,
    orgAudience: p.orgAudience,
    // El esquema solo tiene un campo libre ("bio") que a la vez sirve como
    // presentación y como "qué busca" (ver el label del textarea en
    // Register.jsx: "Cuéntanos brevemente qué buscas") — se muestra en
    // ambos lugares del dossier a propósito, no es un error de copiado.
    bio: p.bio,
    contact: p.email,
    linkedin: p.linkedin,
    photo: p.photo,
  }
}

function CopyEmailButton({ email }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard bloqueado (permisos, http sin TLS) — el correo ya está
      // visible en texto para copiar a mano.
    }
  }
  return (
    <button type="button" className="btn btn-ghost" onClick={copy}>
      {copied ? '✓ Copiado' : 'Copiar correo'}
    </button>
  )
}

export default function PersonProfile() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [remote, setRemote] = useState(undefined)
  const [initiatives, setInitiatives] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    setRemote(undefined)
    getDocs(query(collection(db, 'profiles'), where('username', '==', slug))).then((snap) => {
      if (cancelled) return
      setRemote(snap.empty ? null : profileToPerson(snap.docs[0].data(), snap.docs[0].id))
    })
    return () => { cancelled = true }
  }, [slug])

  useEffect(() => {
    let cancelled = false
    setInitiatives(undefined)
    if (!remote?.uid) return
    getDocs(query(collection(db, 'initiatives'), where('memberUids', 'array-contains', remote.uid))).then((snap) => {
      if (cancelled) return
      setInitiatives(snap.docs.map((d) => ({ ...d.data(), docId: d.id })))
    })
    return () => { cancelled = true }
  }, [remote?.uid])

  const person = remote
  const loading = remote === undefined

  if (loading) {
    return (
      <DashboardLayout eyebrow="Personas" title="Perfil">
        <p className="auth-sub">Cargando…</p>
      </DashboardLayout>
    )
  }

  if (!person) {
    return (
      <DashboardLayout eyebrow="Personas" title="No encontrada">
        <div className="auth-card">
          <span className="kicker">No encontrada</span>
          <h1 className="auth-title">Ese perfil no existe</h1>
          <Link to="/app/personas" className="btn btn-primary">Volver al directorio</Link>
        </div>
      </DashboardLayout>
    )
  }

  const {
    uid, name, username, role, location, odsLabel, profileTypeLabel, offers, advisoryOffer, orgActivity, orgAudience,
    bio, contact, linkedin, photo,
  } = person
  const canMessage = Boolean(uid && user && uid !== user.uid)

  return (
    <DashboardLayout eyebrow="Personas" title="Perfil">
      <div className="in">
        <div className="dossier-topbar">
          <Link to="/app/personas" className="link-arrow">← Volver al directorio</Link>
          <span className="dossier-topbar-label">PERFIL</span>
        </div>

        <div className="dossier-header">
          <div className="dossier-header-row">
            <div className="dossier-avatar">
              {photo ? <img src={photo} alt="" /> : initials(name)}
            </div>
            <div className="dossier-head-main">
              {profileTypeLabel && <div className="dossier-status-line">{profileTypeLabel.toUpperCase()}</div>}
              <h1 className="detail-title">{name}</h1>
              <p className="dossier-subtitle">{role}{role && location ? ' — ' : ''}{location}</p>
            </div>
          </div>
          {odsLabel && (
            <div className="dossier-tags">
              <span className="chip">{odsLabel}</span>
            </div>
          )}
        </div>

        <div className="dossier-grid">
          <div className="dossier-main">
            <p className="detail-lede">{bio}</p>

            <hr className="dossier-rule" />

            <div className="dossier-meta-row">
              {offers?.length > 0 && (
                <div className="dossier-section">
                  <span className="kicker">Ofrece</span>
                  <div className="person-offers" style={{ marginTop: 8 }}>
                    {offers.map((o) => <span className="tag-pill" key={o}>{o}</span>)}
                  </div>
                </div>
              )}
              {role && (
                <div className="dossier-section">
                  <span className="kicker">Formación</span>
                  <p className="dossier-meta-value">{role}</p>
                </div>
              )}
              {location && (
                <div className="dossier-section">
                  <span className="kicker">Ubicación</span>
                  <p className="dossier-meta-value">{location}</p>
                </div>
              )}
            </div>

            {advisoryOffer && (
              <div className="dossier-section">
                <span className="kicker">En qué puede asesorar</span>
                <p className="dossier-meta-value">{advisoryOffer}</p>
              </div>
            )}
            {orgActivity && (
              <div className="dossier-section">
                <span className="kicker">Qué hace</span>
                <p className="dossier-meta-value">{orgActivity}</p>
              </div>
            )}
            {orgAudience && (
              <div className="dossier-section">
                <span className="kicker">A quién atiende</span>
                <p className="dossier-meta-value">{orgAudience}</p>
              </div>
            )}

            <div className="dossier-section">
              <span className="kicker">Emprendimientos</span>
              {initiatives === undefined ? (
                <p className="dossier-meta-value" style={{ color: 'var(--text-faint)' }}>Cargando…</p>
              ) : initiatives.length > 0 ? (
                <div className="catalog-grid" style={{ marginTop: 10, marginLeft: 0, marginRight: 0 }}>
                  {initiatives.map((i) => (
                    <InitiativeCard key={i.docId} initiative={i} basePath="/app/iniciativas" allowSave={false} />
                  ))}
                </div>
              ) : (
                <div className="dossier-empty-box">Aún no hay emprendimientos ligados</div>
              )}
            </div>
          </div>

          <div className="dossier-sidebar">
            <div className="dossier-card">
              <span className="kicker">Busca ahora</span>
              <p className="dossier-need-value">{bio || 'Por definir'}</p>
            </div>

            <div className="dossier-card">
              <span className="kicker">Contacto</span>
              <div className="dossier-contact">
                <div className="dossier-contact-person">
                  <span className="dossier-avatar" style={{ width: 48, height: 48, fontSize: 15 }}>
                    {photo ? <img src={photo} alt="" /> : initials(name)}
                  </span>
                  <div>
                    <div className="dossier-contact-name">{name}</div>
                    <div className="dossier-contact-role">{profileTypeLabel}{username ? ` · @${username}` : ''}</div>
                  </div>
                </div>
                {contact && <span className="dossier-contact-email">{contact}</span>}
                <div className="dossier-contact-actions">
                  {canMessage && (
                    <button type="button" className="btn btn-primary" onClick={() => navigate(`/app/mensajes?to=${uid}`)}>
                      Enviar mensaje →
                    </button>
                  )}
                  {contact && <CopyEmailButton email={contact} />}
                  {linkedin && <a href={linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost">LinkedIn →</a>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
