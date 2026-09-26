import React from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const VMV = [
  { roman: 'I — VISIÓN', title: 'Un punto de encuentro nacional', text: 'Conectar al sector público, privado y académico para transformar ideas en iniciativas que impulsen la economía mexicana.' },
  { roman: 'II — MISIÓN', title: 'De la idea a la acción conjunta', text: 'Permitir el intercambio de metodologías, procesos y recursos para co-crear soluciones compartidas ante retos comunes.' },
]

const VALUES = [
  { name: 'Empatía', text: 'Escuchar y comprender a otros.' },
  { name: 'Compromiso', text: 'Cumplir con propósito y acción.' },
  { name: 'Colaboración', text: 'Construir juntos soluciones efectivas.' },
  { name: 'Transparencia', text: 'Actuar con claridad y confianza.' },
  { name: 'Sostenibilidad', text: 'Equilibrar progreso y entorno.' },
  { name: 'Diversidad e inclusión', text: 'Valorar todas las perspectivas.' },
  { name: 'Innovación con propósito', text: 'Crear impacto positivo real.' },
]

const IMPACT_STATS = [
  { num: '+43,000', label: 'Organizaciones civiles operan aisladas, sin coordinación entre sí' },
  { num: '75–80%', label: 'De las startups fracasan en sus primeros 3 años por falta de redes y apoyo' },
  { num: '36%', label: 'De los emprendedores logran acceso a mentores o incubadoras estructuradas' },
  { num: '8', label: 'ODS de la ONU con los que alineamos nuestro trabajo' },
]

const ALLIES = [
  'Distrito Tec · Tec de Monterrey',
  'BID Lab / CONACYT',
  'ONGs y fondos sociales',
  'Cámaras empresariales',
  'Gobiernos municipales',
  'Plataformas de IA y pagos',
]

export default function Nosotros() {
  return (
    <>
      <Header />

      {/* ── IDENTITY / VMV ───────────────────────── */}
      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Nuestra identidad</span>
            <h2>Visión, misión y valores</h2>
          </div>
        </div>

        <div className="in" style={{ marginBottom: 40 }}>
          <div className="def-block">
            <b>N.E.X.O.</b><span className="cls">sigla</span><br />
            Núcleo de Emprendedores eXplorando Oportunidades.
          </div>
          <p className="head-desc-below" style={{ marginTop: 0 }}>
            Somos una comunidad multidisciplinaria de jóvenes líderes, investigadores y emprendedores comprometidos con
            construir un México más conectado, sostenible e inclusivo. Creemos que la colaboración intersectorial es la
            clave para pasar de las ideas a la acción — por eso trabajamos para reducir la fragmentación entre
            iniciativas que buscan un mismo objetivo: impulsar el desarrollo social a través de la tecnología y la
            innovación.
          </p>
        </div>

        <div className="vmv">
          {VMV.map((v) => (
            <div className="vmv-card" key={v.roman}>
              <div className="roman">{v.roman}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
          <div className="vmv-card">
            <div className="roman">III — VALORES</div>
            <h3>Empatía, transparencia, propósito</h3>
            <ul className="value-list">
              {VALUES.map((v) => (
                <li key={v.name}><b>{v.name}</b> — {v.text}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── WHY IT MATTERS / IMPACT ──────────────── */}
      <section className="bg-alt">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Por qué existimos</span>
            <h2>México tiene talento e iniciativa. Le falta conectividad.</h2>
          </div>
        </div>

        <div className="stat-strip">
          {IMPACT_STATS.map((s) => (
            <div className="stat-item" key={s.label}>
              <span className="stat-num">{s.num}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <p className="head-desc-below in" style={{ marginTop: 20 }}>
          Fuentes: INEGI 2021, OCDE 2024, GEM México 2022–23, Registro Federal de Organizaciones de la Sociedad Civil.
          Alineamos nuestro trabajo a los ODS 4, 5, 8, 9, 10, 11, 16 y 17 — con especial énfasis en el ODS 17,
          alianzas para lograr los objetivos.
        </p>
      </section>

      {/* ── CONTACT ──────────────────────────────── */}
      <section className="bg-alt">
        <div className="in contact-section">
          <span className="kicker">Contacto</span>
          <h2>¿Quieres hablar con Nexo?</h2>
          <p className="head-desc-below" style={{ marginTop: 4, marginBottom: 24 }}>
            Dudas, alianzas institucionales o prensa — escríbenos directamente.
          </p>
          <a href="mailto:join.nexo.mx@gmail.com" className="btn btn-gold btn-lg">join.nexo.mx@gmail.com</a>

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
