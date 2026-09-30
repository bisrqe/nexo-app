import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import NetworkGraphic from '../components/NetworkGraphic.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { RESOURCES } from '../data/resources.js'

const WHY_STATS = [
  { num: '+43,000', label: 'Organizaciones civiles operan aisladas, sin coordinación entre sí' },
  { num: '75–80%', label: 'De las startups fracasan en sus primeros 3 años por falta de redes y apoyo' },
  { num: '36%', label: 'De los emprendedores logran acceso a mentores o incubadoras estructuradas' },
  { num: '8', label: 'ODS de la ONU con los que alineamos nuestro trabajo' },
]

function formatEventDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Home() {
  const [initiatives] = useFirestoreCollection('initiatives')
  const [events] = useFirestoreCollection('events')

  const today = new Date().toISOString().slice(0, 10)

  const stats = useMemo(() => {
    const cities = new Set(initiatives.map((i) => i.city).filter(Boolean))
    const ods = new Set(initiatives.flatMap((i) => i.ods || []).filter(Boolean))
    const upcoming = events.filter((e) => e.date >= today).length
    const realizedEvents = events.filter((e) => e.date < today).length
    return [
      { num: String(initiatives.length).padStart(2, '0'), label: 'Emprendimientos activos' },
      { num: String(cities.size).padStart(2, '0'), label: 'Ciudades con presencia' },
      { num: String(ods.size).padStart(2, '0'), label: 'ODS con actividad' },
      { num: String(upcoming).padStart(2, '0'), label: 'Eventos programados' },
      { num: String(realizedEvents).padStart(2, '0'), label: 'Eventos realizados' },
    ]
  }, [initiatives, events, today])

  const featuredInitiatives = useMemo(
    () => [...initiatives].sort((a, b) => (b.interestedBy?.length || 0) - (a.interestedBy?.length || 0)).slice(0, 10),
    [initiatives]
  )

  const upcomingEvents = useMemo(
    () => events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10),
    [events, today]
  )

  const featuredResources = useMemo(() => (RESOURCES.nacional || []).slice(0, 10), [])

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
              <hr style={{ border: 'none', borderTop: '1px solid rgba(16,27,38,.1)', margin: '18px 0' }} />
              <b>N.E.X.O.</b><span className="cls">sigla</span><br />
              Núcleo de Emprendedores eXplorando Oportunidades.
            </div>

            <h1>El punto donde tu proyecto<br />deja de estar <span className="mark">solo</span>.</h1>
            <p className="lede">Nexo reúne lo que ya existe en tu ecosistema — emprendimientos, personas y recursos — para que la próxima solución no la construyas desde cero, ni sin compañía.</p>

            <div className="hero-actions">
              <Link to="/iniciativas" className="btn btn-gold btn-lg">Explorar emprendimientos →</Link>
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
          {stats.map((s) => (
            <div className="stat-item" key={s.label}>
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">
                {s.label === 'ODS con actividad' ? (
                  <>ODS con actividad</>
                ) : s.label}
              </span>
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
            de México.
          </p>
          <p className="pivot-quote pivot-quote-muted">
            El problema nunca fue la falta de ideas — fue que nadie las encontraba a tiempo para sumarse.
          </p>
          <p className="pivot-attr">Por eso dejamos de ser un feed y empezamos a ser un mapa</p>

          <div className="why-stats-row">
            {WHY_STATS.map((s) => (
              <div className="why-stat" key={s.label}>
                <span className="stat-num" style={{ color: 'var(--gold)' }}>{s.num}</span>
                <span className="stat-label" style={{ color: '#AEBBD0' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <p className="pivot-attr" style={{ marginTop: 20 }}>
            Fuentes: INEGI 2021 · OCDE 2024 · GEM México 2022–23 · Registro Federal de Organizaciones de la Sociedad Civil
          </p>
        </div>
      </section>

      {/* ── FEATURED INITIATIVES ─────────────────── */}
      <section className="bg-alt" id="iniciativas">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Explorar</span>
            <h2>Emprendimientos destacados</h2>
          </div>
        </div>

        {featuredInitiatives.length > 0 ? (
          <div className="catalog-grid">
            {featuredInitiatives.map((i) => (
              <InitiativeCard key={i.docId} initiative={i} allowSave={false} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Este mapa cambia cada semana. Sé quien registre el primer emprendimiento.</p>
          </div>
        )}

        <div className="section-cta">
          <Link to="/iniciativas" className="link-arrow">Ver todos los emprendimientos →</Link>
        </div>
      </section>

      {/* ── FEATURED RESOURCES ───────────────────── */}
      <section className="bg-alt">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Aprovechar lo que ya existe</span>
            <h2>Recursos destacados</h2>
          </div>
        </div>

        {featuredResources.length > 0 ? (
          <div className="page-grid in">
            {featuredResources.map((item) => (
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
        ) : (
          <div className="empty-state in">
            <p>Todavía no tenemos recursos capturados.</p>
          </div>
        )}

        <div className="section-cta">
          <Link to="/recursos" className="link-arrow">Ver todos los recursos →</Link>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ──────────────────────── */}
      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Comunidad</span>
            <h2>Próximos eventos</h2>
          </div>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="page-grid in">
            {upcomingEvents.map((event) => (
              <div className="event-card" key={event.docId}>
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
        ) : (
          <div className="empty-state in">
            <p>Todavía no hay eventos programados.</p>
          </div>
        )}

        <div className="section-cta">
          <Link to="/eventos" className="link-arrow">Ver todos los eventos →</Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="full">
        <div className="cta-band">
          <div>
            <h2>¿Tu emprendimiento <i>todavía</i> no está en el mapa?</h2>
            <p>Créala en cinco minutos. La comunidad se encarga del resto.</p>
          </div>
          <Link to="/iniciativas/nueva" className="btn btn-gold btn-lg">Sumar mi emprendimiento →</Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
