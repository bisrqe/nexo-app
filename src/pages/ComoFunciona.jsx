import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useReveal } from '../hooks/useReveal.js'

const PILLARS = [
  { num: '01', title: 'Emprendimientos', text: 'Un catálogo real de proyectos en curso, filtrable por ODS, sector y etapa, no publicaciones sueltas que se pierden en un scroll.' },
  { num: '02', title: 'Personas', text: 'Quién sabe hacer qué, y qué está dispuesto a compartir. Sin currículums de relleno.' },
  { num: '03', title: 'Recursos', text: 'Mentoría, fondeo, herramientas y aliados institucionales que ya existen, pero nadie sabía dónde buscar.' },
  { num: '04', title: 'Eventos', text: 'Los espacios donde el mapa se vuelve conversación real, cara a cara.' },
]

const STEPS = [
  { num: '01', title: 'Explora el mapa', text: 'Filtra por ODS, sector o por lo que tú puedes aportar.' },
  { num: '02', title: 'Conecta directo', text: 'Sin mensajes perdidos en un feed. Hablas con quien lidera el emprendimiento.' },
  { num: '03', title: 'Construyan juntos', text: 'Súmate a un emprendimiento existente o registra el tuyo para que te encuentren.' },
]

export default function ComoFunciona() {
  useReveal()
  return (
    <>
      <Header />

      {/* ── CÓMO FUNCIONA ────────────────────────── */}
      <section className="page-hero">
        <span className="kicker" data-reveal>Cómo funciona</span>
        <h1 data-reveal style={{ '--d': '60ms' }}>Tres pasos, <span className="mark">sin vueltas</span>.</h1>
      </section>

      <section className="cf-dark" style={{ paddingTop: 72 }}>
        <ol className="cf-steps" style={{ listStyle: 'none' }}>
          {STEPS.map((s, i) => (
            <li className="cf-step" key={s.num} data-reveal style={{ '--d': `${i * 80}ms` }}>
              <span className="cf-step-num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── QUÉ HAY ADENTRO ──────────────────────── */}
      <section className="cf-pillars-wrap">
        <div className="section-head">
          <div className="head-title" data-reveal>
            <span className="kicker">Qué hay adentro</span>
            <h2>Cuatro maneras de dejar de empezar de cero</h2>
          </div>
        </div>
        <div className="pillars">
          {PILLARS.map((p, i) => (
            <div className="pillar" key={p.num} data-reveal style={{ '--d': `${i * 70}ms` }}>
              <div className="num">{p.num}</div>
              <div className="pillar-body">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="full">
        <div className="cta-band">
          <div>
            <h2>¿Listo para <i>dejar de empezar de cero</i>?</h2>
            <p>Regístrate en cinco minutos y empieza a conectar con el ecosistema.</p>
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
