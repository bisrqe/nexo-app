import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { RESOURCES } from '../data/resources.js'

export default function RecursosPublicos() {
  const items = RESOURCES.nacional || []

  return (
    <>
      <Header />

      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Aprovechar lo que ya existe</span>
            <h2>Recursos</h2>
            <p className="head-desc-below">Convocatorias, financiamiento, mentoría y aceleración de alcance nacional, sin filtrar todavía por tu ciudad.</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-state"><p>Todavía no tenemos recursos capturados para esta sección.</p></div>
        ) : (
          <div className="page-grid in">
            {items.map((item) => (
              <div className="resource-card" key={item.id}>
                <div className="resource-title">{item.title}</div>
                <div className="resource-org">{item.category}</div>
                <p className="resource-desc">{item.desc}</p>
                <a href={`https://${item.link}`} target="_blank" rel="noreferrer" className="resource-tag">
                  Visitar sitio →
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="full">
        <div className="cta-band">
          <div>
            <h2>¿Buscas recursos de <i>tu ciudad</i>?</h2>
            <p>Ingresa o regístrate para ver también lo exclusivo de Monterrey, CDMX y Guadalajara.</p>
          </div>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-gold btn-lg">Registrarse →</Link>
            <Link to="/login" className="btn btn-ghost-dark btn-lg">Ingresar</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
