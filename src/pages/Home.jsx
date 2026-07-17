import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import Divider from '../components/Divider.jsx'
import NetworkGraphic from '../components/NetworkGraphic.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { INITIATIVES, ODS_FILTERS, NEED_FILTERS } from '../data/initiatives.js'

const STATS = [
  { num: '047', label: 'Iniciativas activas' },
  { num: '12', label: 'Estados de México' },
  { num: '06', label: 'ODS con actividad esta semana' },
  { num: '03', label: 'Recursos nuevos esta semana' },
]

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

const VMV = [
  { roman: 'I — VISIÓN', title: 'Un punto de encuentro nacional', text: 'Conectar al sector público, privado y académico para transformar ideas en iniciativas que impulsen la economía mexicana.' },
  { roman: 'II — MISIÓN', title: 'De la idea a la acción conjunta', text: 'Permitir el intercambio de metodologías, procesos y recursos para co-crear soluciones compartidas ante retos comunes.' },
  { roman: 'III — VALORES', title: 'Empatía, transparencia, propósito', text: 'Colaboración, sostenibilidad, diversidad e inclusión, e innovación con un fin social claro.' },
]

export default function Home() {
  const [odsFilter, setOdsFilter] = useState('todos')
  const [needFilter, setNeedFilter] = useState(null)

  const filtered = useMemo(() => {
    return INITIATIVES.filter((i) => {
      const matchesOds = odsFilter === 'todos' || i.ods.includes(odsFilter)
      const matchesNeed = !needFilter || i.needTag === needFilter
      return matchesOds && matchesNeed
    })
  }, [odsFilter, needFilter])

  const toggleNeed = (id) => setNeedFilter((prev) => (prev === id ? null : id))

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
              <Link to="/#iniciativas" className="btn btn-gold btn-lg">Explorar iniciativas →</Link>
              <Link to="/#como-funciona" className="btn btn-ghost btn-lg">Ver cómo funciona</Link>
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
            Casi todos los problemas que Nexo quiere resolver, <b>alguien ya los está resolviendo</b> en algún lugar
            de México. El problema nunca fue la falta de ideas — fue que nadie las encontraba a tiempo para sumarse.
          </p>
          <p className="pivot-attr">Por eso dejamos de ser un feed y empezamos a ser un mapa</p>
        </div>
      </section>

      <Divider />

      {/* ── PILLARS ──────────────────────────────── */}
      <section id="pilares">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Qué hay adentro</span>
            <h2>Cuatro maneras de dejar de empezar de cero</h2>
          </div>
          <p className="head-desc">Nexo no es un espacio para publicar. Es el inventario de lo que tu comunidad ya construyó, ya sabe hacer, o ya está dispuesta a prestar.</p>
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
      </section>

      {/* ── CATALOG ──────────────────────────────── */}
      <section className="bg-alt" id="iniciativas">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Explorar</span>
            <h2>Iniciativas, no publicaciones</h2>
          </div>
          <p className="head-desc">Filtra por Objetivo de Desarrollo Sostenible, sector o lo que la iniciativa necesita ahora mismo.</p>
        </div>

        <div className="filters">
          <button
            className={`chip ${odsFilter === 'todos' ? 'active' : ''}`}
            onClick={() => setOdsFilter('todos')}
          >
            Todos
          </button>
          {ODS_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
            <button
              key={f.id}
              className={`chip ${odsFilter === f.id ? 'active' : ''}`}
              onClick={() => setOdsFilter(odsFilter === f.id ? 'todos' : f.id)}
            >
              {f.label}
            </button>
          ))}
          {NEED_FILTERS.map((f) => (
            <button
              key={f.id}
              className={`chip ${needFilter === f.id ? 'active' : ''}`}
              onClick={() => toggleNeed(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="catalog-grid">
            {filtered.map((i) => (
              <InitiativeCard key={i.id} initiative={i} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Todavía no hay iniciativas registradas con ese filtro.</p>
            <Link to="/iniciativas/nueva" className="link-arrow">Sé la primera en registrarla →</Link>
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section id="como-funciona">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Cómo funciona</span>
            <h2>Tres pasos, sin vueltas</h2>
          </div>
          <p className="head-desc">De explorar el mapa a construir algo juntos — sin intermediarios ni mensajes que se pierden.</p>
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

      {/* ── IDENTITY / VMV ───────────────────────── */}
      <section className="bg-alt" id="identidad">
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Nuestra identidad</span>
            <h2>Visión, misión y valores</h2>
          </div>
          <p className="head-desc">Lo que no cambia aunque la plataforma sí lo haga.</p>
        </div>
        <div className="vmv">
          {VMV.map((v) => (
            <div className="vmv-card" key={v.roman}>
              <div className="roman">{v.roman}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="full" id="eventos">
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
