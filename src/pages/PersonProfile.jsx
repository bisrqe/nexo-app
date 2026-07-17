import React from 'react'
import { Link, useParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { getPersonBySlug } from '../data/people.js'

function initials(name) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function PersonProfile() {
  const { slug } = useParams()
  const person = getPersonBySlug(slug)

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

  const { name, role, location, odsLabel, offers, looking, bio, contact } = person

  return (
    <DashboardLayout eyebrow="Personas" title="Perfil">
      <div className="in">
        <Link to="/app/personas" className="link-arrow back-link">← Volver al directorio</Link>

        <div className="detail-head">
          <div className="person-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{initials(name)}</div>
          <h1 className="detail-title">{name}</h1>
          <p className="cat-org">{role} — {location}</p>
          <div className="cat-tags"><span>{odsLabel}</span></div>
        </div>

        <div className="detail-body">
          <p className="detail-lede">{bio}</p>
        </div>

        <div className="detail-side">
          <div>
            <span className="kicker">Ofrece</span>
            <div className="person-offers">
              {offers.map((o) => (
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
