import React from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const MISSION_VISION = [
  { key: 'mision', label: 'Misión', text: 'Permitir el intercambio de metodologías, procesos y recursos para co-crear soluciones compartidas ante retos comunes.' },
  { key: 'vision', label: 'Visión', text: 'Conectar al sector público, privado y académico para transformar ideas en emprendimientos que impulsen la economía mexicana.' },
]

const VALUES = [
  'Empatía',
  'Compromiso',
  'Colaboración',
  'Transparencia',
  'Sostenibilidad',
  'Diversidad e inclusión',
  'Innovación con propósito',
]

const ODS_LIST = [
  { num: 4, title: 'Educación de calidad' },
  { num: 5, title: 'Igualdad de género' },
  { num: 8, title: 'Trabajo decente y crecimiento económico' },
  { num: 9, title: 'Industria, innovación e infraestructura' },
  { num: 10, title: 'Reducción de las desigualdades' },
  { num: 11, title: 'Ciudades y comunidades sostenibles' },
  { num: 16, title: 'Paz, justicia e instituciones sólidas' },
  { num: 17, title: 'Alianzas para lograr los objetivos', featured: true },
]

const IMPACT_STATS = [
  { num: '+43,000', label: 'Organizaciones civiles operan aisladas, sin coordinación entre sí' },
  { num: '75–80%', label: 'De las startups fracasan en sus primeros 3 años por falta de redes y apoyo' },
  { num: '36%', label: 'De los emprendedores logran acceso a mentores o incubadoras estructuradas' },
  { num: '8', label: 'ODS de la ONU con los que alineamos nuestro trabajo' },
]

export default function Nosotros() {
  return (
    <>
      <Header />

      {/* ── QUIÉNES SOMOS ─────────────────────────── */}
      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Nuestra identidad</span>
            <h2>¿Quiénes somos?</h2>
          </div>
        </div>

        <div className="in">
          <div className="def-block">
            <b>N.E.X.O.</b><span className="cls">sigla</span><br />
            Núcleo de Emprendedores eXplorando Oportunidades.
          </div>
          <p className="head-desc-below" style={{ maxWidth: 'none' }}>
            Somos una comunidad multidisciplinaria de jóvenes líderes, investigadores y emprendedores comprometidos con
            construir un México más conectado, sostenible e inclusivo. Creemos que la colaboración intersectorial es la
            clave para pasar de las ideas a la acción — por eso trabajamos para reducir la fragmentación entre
            emprendimientos que buscan un mismo objetivo: impulsar el desarrollo social a través de la tecnología y la
            innovación.
          </p>
        </div>
      </section>

      {/* ── VISIÓN Y MISIÓN ───────────────────────── */}
      <section className="bg-alt">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Nuestra identidad</span>
            <h2>Visión y misión</h2>
          </div>
        </div>

        <div className="mv-grid">
          {MISSION_VISION.map((v) => (
            <div key={v.key}>
              <h3 className={`mv-heading mv-${v.key}`}>{v.label}</h3>
              <p className="mv-text">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────── */}
      <section className="section-dark">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker on-dark">Cómo trabajamos</span>
            <h2>Nuestros valores</h2>
          </div>
        </div>
        <div className="value-grid">
          {VALUES.map((name, i) => (
            <div className="value-tile" key={name}>
              <span className="value-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="value-name">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ODS ───────────────────────────────────── */}
      <section className="bg-alt">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Impacto</span>
            <h2>Los ODS que atacamos</h2>
          </div>
        </div>
        <div className="tile-grid">
          {ODS_LIST.map((o) => (
            <div className={`tile ${o.featured ? 'featured' : ''}`} key={o.num}>
              <span className="tile-eyebrow">ODS {o.num}{o.featured ? ' ★' : ''}</span>
              <span className="tile-title">{o.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY IT MATTERS / IMPACT ──────────────── */}
      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Por qué existimos</span>
            <h2>México tiene talento e iniciativa. Le falta conectividad.</h2>
          </div>
        </div>

        <div className="impact-card">
          <div className="impact-grid">
            {IMPACT_STATS.map((s) => (
              <div className="stat-item" key={s.label}>
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="impact-sources">
            Fuentes: INEGI 2021 · OCDE 2024 · GEM México 2022–23 · Registro Federal de Organizaciones de la Sociedad Civil
          </p>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────── */}
      <section className="bg-alt">
        <div className="in contact-section">
          <span className="kicker">Contacto</span>
          <h2>¿Quieres hablar con Nexo?</h2>
          <p className="head-desc-below" style={{ marginTop: 4, marginBottom: 24 }}>
            Dudas, alianzas institucionales o prensa — escríbenos directamente.
          </p>
          <a href="mailto:support@nexohub.mx" className="btn btn-gold btn-lg">support@nexohub.mx</a>

          <p className="founders-credit">
            Un proyecto fundado por Bismarck Sebastian Animas Roque · Regina Ramos Gil.
            <br />Conectemos el ecosistema. Transformemos México.
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
