import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { ODS_FILTERS } from '../data/initiatives.js'
import { getCityName } from '../data/cities.js'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function profileToPerson(p, uid) {
  const odsLabel = ODS_FILTERS.find((f) => f.id === p.interests?.[0])?.label ?? ''
  return {
    uid,
    name: p.name,
    role: p.occupation,
    location: getCityName(p.city) || p.location,
    odsLabel,
    offers: [p.industryLabel].filter(Boolean),
    looking: p.bio,
    bio: p.bio,
    contact: p.email,
    linkedin: p.linkedin,
    photo: p.photo,
  }
}

export default function PersonProfile() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [remote, setRemote] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    getDocs(query(collection(db, 'profiles'), where('username', '==', slug))).then((snap) => {
      if (cancelled) return
      setRemote(snap.empty ? null : profileToPerson(snap.docs[0].data(), snap.docs[0].id))
    })
    return () => { cancelled = true }
  }, [slug])

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

  const { uid, name, role, location, odsLabel, offers, looking, bio, contact, linkedin, photo } = person
  const canMessage = Boolean(uid && user && uid !== user.uid)

  return (
    <DashboardLayout eyebrow="Personas" title="Perfil">
      <div className="in">
        <Link to="/app/personas" className="link-arrow back-link">← Volver al directorio</Link>

        <div className="detail-head">
          <div className="person-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
            {photo ? <img src={photo} alt="" /> : initials(name)}
          </div>
          <h1 className="detail-title">{name}</h1>
          <p className="cat-org">{role} — {location}</p>
          {odsLabel && <div className="cat-tags"><span>{odsLabel}</span></div>}
        </div>

        <div className="detail-body">
          <p className="detail-lede">{bio}</p>
        </div>

        <div className="detail-side">
          <div>
            <span className="kicker">Ofrece</span>
            <div className="person-offers">
              {(offers || []).map((o) => (
                <span className="tag-pill" key={o}>{o}</span>
              ))}
            </div>
            <p className="person-looking" style={{ marginTop: '14px', borderTop: 'none', paddingTop: 0 }}>
              <b>Busca:</b> {looking}
            </p>
          </div>

          <div className="contact-block">
            <span className="kicker">Contacto directo</span>
            <a href={`mailto:${contact}`} className="btn btn-gold btn-lg">{contact}</a>
            {canMessage && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 10 }}
                onClick={() => navigate(`/app/mensajes?to=${uid}`)}
              >
                Enviar mensaje →
              </button>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer" className="link-arrow" style={{ marginTop: 10 }}>
                Ver LinkedIn →
              </a>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
