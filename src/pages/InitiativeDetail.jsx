import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { getInitiativeBySlug } from '../data/initiatives.js'

export default function InitiativeDetail() {
  const { slug } = useParams()
  const initiative = getInitiativeBySlug(slug)
  const [wantsToCollaborate, setWantsToCollaborate] = useState(false)

  if (!initiative) {
    return (
      <>
        <Header />
        <section className="auth-section">
          <div className="auth-card">
            <span className="kicker">No encontrada</span>
            <h1 className="auth-title">Esa iniciativa no está en el mapa</h1>
            <p className="auth-sub">Puede que se haya movido de nombre, o que todavía no exista.</p>
            <Link to="/#iniciativas" className="btn btn-primary">Volver al catálogo</Link>
          </div>
        </section>
        <Footer />
      </>
    )
  }

  const { id, stage, title, org, location, odsLabel, need, desc, longDesc, contact } = initiative

  return (
    <>
      <Header />
      <section className="detail-section">
        <div className="in">
          <Link to="/#iniciativas" className="link-arrow back-link">← Volver al catálogo</Link>

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

            {wantsToCollaborate ? (
              <div className="auth-note">
                <p><b>Anotado.</b> Todavía no hay mensajería conectada — cuando la haya, esto le llegará directo a {org}. Por ahora, puedes escribir a <a href={`mailto:${contact}`}>{contact}</a>.</p>
              </div>
            ) : (
              <button className="btn btn-gold btn-lg" onClick={() => setWantsToCollaborate(true)}>
                Quiero colaborar →
              </button>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
