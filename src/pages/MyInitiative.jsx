import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'

export default function MyInitiative() {
  const { myInitiative } = useUserContent()

  if (!myInitiative) {
    return (
      <DashboardLayout eyebrow="Iniciativas" title="Mi iniciativa" subtitle="Todavía no has registrado una iniciativa propia.">
        <div className="empty-state">
          <p>Cuando registres una iniciativa, va a vivir aquí — con su propio dossier y contacto.</p>
          <Link to="/app/iniciativas/nueva" className="btn btn-primary" style={{ marginTop: 16 }}>Registrar mi iniciativa →</Link>
        </div>
      </DashboardLayout>
    )
  }

  const { stage, title, org, location, odsLabel, need, desc, longDesc, contact } = myInitiative

  return (
    <DashboardLayout eyebrow="Iniciativas" title="Mi iniciativa">
      <div className="in">
        <div className="detail-head">
          <div className="cat-id">{stage?.toUpperCase()}</div>
          <h1 className="detail-title">{title}</h1>
          <p className="cat-org">{org} — {location}</p>
          <div className="cat-tags"><span>{odsLabel}</span></div>
        </div>

        <div className="detail-body">
          <p className="detail-lede">{desc}</p>
          {longDesc && longDesc !== desc && <p>{longDesc}</p>}
        </div>

        <div className="detail-side">
          <div className="need-block">
            <span className="kicker">Busca ahora</span>
            <p className="need-big">{need}</p>
          </div>

          <div className="contact-block">
            <span className="kicker">Contacto</span>
            <a href={`mailto:${contact}`} className="btn btn-gold btn-lg">{contact}</a>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: 32 }}>
          <Link to="/app/iniciativas/nueva" className="btn btn-ghost">Editar mi iniciativa</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
