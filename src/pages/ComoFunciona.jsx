import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useReveal } from '../hooks/useReveal.js'

const PILLARS = [
  { title: 'Emprendimientos', text: 'Un catálogo real de proyectos en curso, filtrable por ODS, sector y etapa, no publicaciones sueltas que se pierden en un scroll.' },
  { title: 'Personas', text: 'Quién sabe hacer qué, y qué está dispuesto a compartir. Sin currículums de relleno.' },
  { title: 'Recursos', text: 'Mentoría, fondeo, herramientas y aliados institucionales que ya existen, pero nadie sabía dónde buscar.' },
  { title: 'Eventos', text: 'Los espacios donde el mapa se vuelve conversación real, cara a cara.' },
]

const STEPS = [
  { verb: 'Explora', title: 'el mapa', text: 'Filtra por ODS, sector o por lo que tú puedes aportar.' },
  { verb: 'Conecta', title: 'directo', text: 'Sin mensajes perdidos en un feed. Hablas con quien lidera el emprendimiento.' },
  { verb: 'Construyan', title: 'juntos', text: 'Súmate a un emprendimiento existente o registra el tuyo para que te encuentren.' },
]

export default function ComoFunciona() {
  useReveal()
  return (
    <>
      <Header />

      {/* ── CÓMO FUNCIONA ────────────────────────── */}
      <section className="cf-steps">
        <h1 className="cf-title" data-reveal>Tres pasos, sin vueltas.</h1>
        <ol className="cf-step-list">
          {STEPS.map((s, i) => (
            <li className="cf-step" key={s.verb} data-reveal style={{ '--d': `${i * 80}ms` }}>
              <h2 className="cf-step-head">{s.verb} <span>{s.title}</span></h2>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── QUÉ HAY ADENTRO ──────────────────────── */}
      <section className="cf-inside">
        <h2 className="cf-inside-title" data-reveal>Cuatro maneras de dejar de empezar de cero</h2>
        <div className="cf-pillars">
          {PILLARS.map((p, i) => (
            <article className={`cf-pillar cf-pillar-${i + 1}`} key={p.title} data-reveal style={{ '--d': `${i * 70}ms` }}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
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
