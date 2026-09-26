import React from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const PILLARS = [
  { num: '01', title: 'Iniciativas', text: 'Un catálogo real de proyectos en curso, filtrable por ODS, sector y etapa — no publicaciones sueltas que se pierden en un scroll.' },
  { num: '02', title: 'Personas', text: 'Quién sabe hacer qué, y qué está dispuesto a compartir. Sin currículums de relleno.' },
  { num: '03', title: 'Recursos', text: 'Mentoría, fondeo, herramientas y aliados institucionales que ya existen, pero nadie sabía dónde buscar.' },
  { num: '04', title: 'Eventos', text: 'Los espacios donde el mapa se vuelve conversación real, cara a cara.' },
]

const STEPS = [
  { num: '01', title: 'Explora el mapa', text: 'Filtra por ODS, sector o por lo que tú puedes aportar.' },
  { num: '02', title: 'Conecta directo', text: 'Sin mensajes perdidos en un feed. Hablas con quien lidera la iniciativa.' },
  { num: '03', title: 'Construyan juntos', text: 'Súmate a una iniciativa existente o registra la tuya para que te encuentren.' },
]

export default function ComoFunciona() {
  return (
    <>
      <Header />

      {/* ── PILLARS ──────────────────────────────── */}
      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Qué hay adentro</span>
            <h2>Cuatro maneras de dejar de empezar de cero</h2>
          </div>
        </div>

        <div className="pillars">
          {PILLARS.map((p) => (
            <div className="pillar" key={p.num}>
              <div className="num">{p.num}</div>
              <div className="pillar-body">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="head-desc-below in">Nexo no es un espacio para publicar. Es el inventario de lo que tu comunidad ya construyó, ya sabe hacer, o ya está dispuesta a prestar.</p>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="bg-alt">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Cómo funciona</span>
            <h2>Tres pasos, sin vueltas</h2>
          </div>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  )
}
