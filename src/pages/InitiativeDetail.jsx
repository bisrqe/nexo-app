import React from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { getInitiativeBySlug } from '../data/initiatives.js'

// Vive en dos rutas distintas según de dónde vengas:
//  - /iniciativas/:slug        (variant="public") — parte de la landing, con Header/Footer.
//  - /app/iniciativas/:slug    (variant="app")    — parte del dashboard, nunca te saca a la landing.
// El contenido del dossier es el mismo en ambos casos; solo cambia el
// "chrome" alrededor y a dónde regresa el link de "volver".
export default function InitiativeDetail({ variant = 'public' }) {
  const { slug } = useParams()
  const initiative = getInitiativeBySlug(slug)
  const isApp = variant === 'app'
  const backTo = isApp ? '/app/iniciativas' : '/iniciativas'

  if (!initiative) {
    const notFound = (
      <div className="auth-card">
        <span className="kicker">No encontrada</span>
        <h1 className="auth-title">Esa iniciativa no está en el mapa</h1>
        <p className="auth-sub">Puede que se haya movido de nombre, o que todavía no exista.</p>
        <Link to={backTo} className="btn btn-primary">Volver al catálogo</Link>
      </div>
    )
    if (isApp) {
      return (
        <DashboardLayout eyebrow="Iniciativas" title="No encontrada">
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

  const { id, stage, title, org, location, odsLabel, need, desc, longDesc, contact } = initiative

  const body = (
    <div className="in">
      <Link to={backTo} className="link-arrow back-link">← Volver al catálogo</Link>

      <div className="detail-head">
        <div className="cat-id">N° {String(id).padStart(3, '0')} — {stage.toUpperCase()}</div>
        <h1 className="detail-title">{title}</h1>
        <p className="cat-org">{org} — {location}</p>
        <div className="cat-tags"><span>{odsLabel}</span></div>
      </div>

      <div className="detail-body">
        <p className="detail-lede">{desc}</p>
        <p>{longDesc}</p>
      </div>

      <div className="detail-side">
        <div className="need-block">
          <span className="kicker">Busca ahora</span>
          <p className="need-big">{need}</p>
        </div>

        <div className="contact-block">
          <span className="kicker">Contacto directo</span>
          <a href={`mailto:${contact}`} className="btn btn-gold btn-lg">{contact}</a>
        </div>
      </div>
    </div>
  )

  if (isApp) {
    return (
      <DashboardLayout eyebrow="Iniciativas" title="Dossier">
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
