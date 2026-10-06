import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import NetworkGraphic from '../components/NetworkGraphic.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import SkeletonCards from '../components/SkeletonCards.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { sedesOf } from '../data/cities.js'

const WHY_STATS = [
  { num: '+43,000', label: 'Organizaciones civiles operan aisladas, sin coordinación entre sí' },
  { num: '75–80%', label: 'De las startups fracasan en sus primeros 3 años por falta de redes y apoyo' },
  { num: '36%', label: 'De los emprendedores logran acceso a mentores o incubadoras estructuradas' },
  { num: '4', label: 'ODS de la ONU con los que alineamos nuestro trabajo' },
]

export default function Home() {
  const [initiatives, initiativesLoading] = useFirestoreCollection('initiatives')
  const [events] = useFirestoreCollection('events')

  const today = new Date().toISOString().slice(0, 10)

  const stats = useMemo(() => {
    const cities = new Set(
      initiatives
        .flatMap((i) => sedesOf(i).map((x) => (x.cityName || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()))
        .filter(Boolean)
    )
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
    () => [...initiatives].sort((a, b) => (b.interestedBy?.length || 0) - (a.interestedBy?.length || 0)).slice(0, 3),
    [initiatives]
  )

  return (
    <>
      <Header />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero-flex">
          <div className="hero-text">
            <span className="kicker">Núcleo de Emprendimiento · México</span>

            {/* El bloque de definiciones va después del CTA en el orden
                del documento a propósito — en escritorio se reubica
                visualmente antes con CSS (order), pero un lector de
                pantalla siempre debe llegar primero a la propuesta de
                valor real, no a la definición del nombre. */}
            <h1>El punto donde tu proyecto<br />deja de estar <span className="mark">solo</span>.</h1>
            <p className="lede">Nexo reúne lo que ya existe en tu ecosistema (emprendimientos, personas y recursos) para que la próxima solución no la construyas desde cero, ni sin compañía.</p>

            <div className="hero-actions">
              <Link to="/iniciativas" className="btn btn-gold btn-lg">Explorar emprendimientos →</Link>
              <Link to="/como-funciona" className="btn btn-ghost btn-lg">Ver cómo funciona</Link>
            </div>

            <div className="def-block">
              <b>nexo</b><span className="cls">sust. m.</span><br />
              Punto donde convergen dos o más cosas; lo que las mantiene unidas.
              <hr style={{ border: 'none', borderTop: '1px solid rgba(16,27,38,.1)', margin: '18px 0' }} />
              <b>N.E.X.O.</b><span className="cls">sigla</span><br />
              Núcleo de Emprendedores eXplorando Oportunidades.
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
            El problema nunca fue la falta de ideas, sino que nadie las encontraba a tiempo para sumarse.
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
          <p className="pivot-attr pivot-sources" style={{ marginTop: 20 }}>
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

        {initiativesLoading ? (
          <SkeletonCards />
        ) : featuredInitiatives.length > 0 ? (
          <div className="catalog-grid">
            {featuredInitiatives.map((i) => (
              <InitiativeCard key={i.docId} initiative={i} allowSave={false} />
            ))}
            <div className="explore-more-cell">
              <Link to="/iniciativas" className="btn btn-ghost">Explorar los demás →</Link>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Este mapa cambia cada semana. Sé quien registre el primer emprendimiento.</p>
          </div>
        )}
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="full">
        <div className="cta-band">
          <div>
            <h2>¿Te unes a un emprendimiento, o <i>arrancas</i> el tuyo?</h2>
            <p>Conecta con uno que ya existe, o créalo en cinco minutos sin crear cuenta, la comunidad se encarga del resto.</p>
          </div>
          <div className="hero-actions">
            <Link to="/iniciativas" className="btn btn-ghost-dark btn-lg">Explorar emprendimientos →</Link>
            <Link to="/iniciativas/nueva" className="btn btn-gold btn-lg">Sumar el mío al mapa →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
