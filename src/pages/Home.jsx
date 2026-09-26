import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import NetworkGraphic from '../components/NetworkGraphic.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { INITIATIVES } from '../data/initiatives.js'
import { EVENTS } from '../data/events.js'

const STATS = [
  { num: '047', label: 'Iniciativas activas' },
  { num: '12', label: 'Estados de México' },
  { num: '06', label: 'ODS con actividad esta semana' },
  { num: '03', label: 'Recursos nuevos esta semana' },
]

const FEATURED_INITIATIVES = INITIATIVES.slice(0, 3)
const UPCOMING_EVENTS = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3)

function formatEventDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Home() {
  return (
    <>
      <Header />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero-flex">
          <div className="hero-text">
            <span className="kicker">Núcleo de Emprendimiento · México</span>

            <div className="def-block">
              <b>nexo</b><span className="cls">sust. m.</span><br />
              Punto donde convergen dos o más cosas; lo que las mantiene unidas.
            </div>

            <h1>El punto donde tu proyecto<br />deja de estar <span className="mark">solo</span>.</h1>
            <p className="lede">Nexo reúne lo que ya existe en tu ecosistema — iniciativas, personas y recursos — para que la próxima solución no la construyas desde cero, ni sin compañía.</p>

            <div className="hero-actions">
              <Link to="/iniciativas" className="btn btn-gold btn-lg">Explorar iniciativas →</Link>
              <Link to="/como-funciona" className="btn btn-ghost btn-lg">Ver cómo funciona</Link>
            </div>
          </div>

          <div className="hero-graphic">
            <NetworkGraphic />
          </div>
        </div>
      </section>

      {/* ── STAT STRIP ───────────────────────────── */}
      <section className="stat-section">
        <div className="stat-strip">
          {STATS.map((s) => (
            <div className="stat-item" key={s.label}>
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIVOT / MANIFESTO ────────────────────── */}
      <section className="pivot">
        <div className="wrap">
          <span className="kicker on-dark">Por qué existe Nexo</span>
          <p className="pivot-quote">
            Casi todos los problemas que <b>algún emprendimiento</b> quiere resolver, <b>alguien ya los está resolviendo</b> en algún lugar
            de México. El problema nunca fue la falta de ideas — fue que nadie las encontraba a tiempo para sumarse.
          </p>
          <p className="pivot-attr">Por eso dejamos de ser un feed y empezamos a ser un mapa</p>
        </div>
      </section>

      {/* ── FEATURED INITIATIVES ─────────────────── */}
      <section className="bg-alt" id="iniciativas">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Explorar</span>
            <h2>Iniciativas destacadas</h2>
          </div>
          <p className="head-desc">Un vistazo del mapa — filtra por industria y ve el catálogo completo en la página de iniciativas.</p>
        </div>

        <div className="catalog-grid">
          {FEATURED_INITIATIVES.map((i) => (
            <InitiativeCard key={i.id} initiative={i} allowSave={false} tagMode="industry" />
          ))}
        </div>

        <div className="section-cta">
          <Link to="/iniciativas" className="link-arrow">Ver todas las iniciativas →</Link>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ──────────────────────── */}
      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Comunidad</span>
            <h2>Próximos eventos</h2>
          </div>
          <p className="head-desc">Los espacios donde el mapa se vuelve conversación real, cara a cara.</p>
        </div>

        <div className="page-grid in">
          {UPCOMING_EVENTS.map((event) => (
            <div className="event-card" key={event.id}>
              <div className="event-stripe" />
              <div className="event-body">
                <div className="event-top">
                  <span className="event-cat">{event.category}</span>
                  <span className="event-date">{formatEventDate(event.date)}</span>
                </div>
                <div className="event-title">{event.title}</div>
                <p className="event-desc">{event.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="section-cta">
          <Link to="/eventos" className="link-arrow">Ver todos los eventos →</Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="full">
        <div className="cta-band">
          <div>
            <h2>¿Tu iniciativa <i>todavía</i> no está en el mapa?</h2>
            <p>Créala en cinco minutos. La comunidad se encarga del resto.</p>
          </div>
          <Link to="/iniciativas/nueva" className="btn btn-gold btn-lg">Sumar mi iniciativa →</Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
