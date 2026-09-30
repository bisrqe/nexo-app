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

export default function Nosotros() {
  return (
    <>
      <Header />

      {/* ── NUESTRA IDENTIDAD ─────────────────────── */}
      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Nuestra identidad</span>
            <h2>¿Quiénes somos?</h2>
          </div>
        </div>

        <div className="in">
          <p className="head-desc-below" style={{ maxWidth: 'none' }}>
            Somos una comunidad multidisciplinaria de jóvenes líderes, investigadores y emprendedores comprometidos con
            construir un México más conectado, sostenible e inclusivo. Creemos que la colaboración intersectorial es la
            clave para pasar de las ideas a la acción — por eso trabajamos para reducir la fragmentación entre
            emprendimientos que buscan un mismo objetivo: impulsar el desarrollo social a través de la tecnología y la
            innovación.
          </p>

          <div className="mv-grid" style={{ marginTop: 32 }}>
            {MISSION_VISION.map((v) => (
              <div key={v.key}>
                <h3 className={`mv-heading mv-${v.key}`}>{v.label}</h3>
                <p className="mv-text">{v.text}</p>
              </div>
            ))}
          </div>
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
