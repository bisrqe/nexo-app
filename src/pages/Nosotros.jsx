import React from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useReveal } from '../hooks/useReveal.js'

const MISSION_VISION = [
  { key: 'mision', label: 'Misión', text: 'Permitir el intercambio de metodologías, procesos y recursos para co-crear soluciones compartidas ante retos comunes.' },
  { key: 'vision', label: 'Visión', text: 'Conectar al sector público, privado y académico para transformar ideas en emprendimientos que impulsen la economía mexicana.' },
]

const VALUES = [
  'Empatía',
  'Confianza',
  'Colaboración',
  'Sostenibilidad',
  'Diversidad e inclusión',
  'Innovación con propósito',
]

const ODS_LIST = [
  { num: 8, title: 'Trabajo decente y crecimiento económico' },
  { num: 9, title: 'Industria, innovación e infraestructura' },
  { num: 11, title: 'Ciudades y comunidades sostenibles' },
  { num: 17, title: 'Alianzas para lograr los objetivos', featured: true },
]

export default function Nosotros() {
  useReveal()
  return (
    <>
      <Header />

      {/* ── QUIÉNES SOMOS ─────────────────────────── */}
      <section className="nos-who">
        <h1 className="nos-title" data-reveal>Un México más conectado, sostenible e inclusivo.</h1>
        <p className="nos-lede" data-reveal style={{ '--d': '80ms' }}>
          Somos una comunidad multidisciplinaria de jóvenes líderes, investigadores y emprendedores. Creemos que la
          colaboración intersectorial es la clave para pasar de las ideas a la acción, por eso reducimos la fragmentación
          entre emprendimientos que buscan un mismo objetivo: impulsar el desarrollo social a través de la tecnología y la
          innovación.
        </p>
      </section>

      <section className="nos-mv">
        {MISSION_VISION.map((v, i) => (
          <article className={`nos-mv-card nos-mv-${v.key}`} key={v.key} data-reveal style={{ '--d': `${i * 80}ms` }}>
            <h2>{v.label}</h2>
            <p>{v.text}</p>
          </article>
        ))}
      </section>

      {/* ── VALORES ───────────────────────────────── */}
      <section className="nos-values">
        <h2 className="nos-values-title" data-reveal>Cómo trabajamos</h2>
        <ul className="nos-values-list">
          {VALUES.map((name, i) => (
            <li key={name} data-reveal style={{ '--d': `${i * 50}ms` }}>{name}</li>
          ))}
        </ul>
      </section>

      {/* ── ODS ───────────────────────────────────── */}
      <section className="nos-ods">
        <h2 className="nos-ods-title" data-reveal>Los objetivos de desarrollo sostenible que atacamos</h2>
        <div className="nos-ods-grid">
          {ODS_LIST.map((o, i) => (
            <article className={`nos-ods-tile ${o.featured ? 'is-featured' : ''}`} key={o.num} data-reveal style={{ '--d': `${i * 60}ms` }}>
              <span className="nos-ods-num">{o.num}</span>
              <h3>{o.title}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* ── CONTACTO ──────────────────────────────── */}
      <section className="nos-contact">
        <h2 data-reveal>¿Quieres hablar con Nexo?</h2>
        <p data-reveal style={{ '--d': '60ms' }}>Dudas, alianzas institucionales o prensa, escríbenos directamente.</p>
        <a href="mailto:support@nexohub.mx" className="btn btn-gold btn-lg" data-reveal style={{ '--d': '120ms' }}>support@nexohub.mx</a>
        <p className="nos-credit">
          Un proyecto fundado por Bismarck Sebastian Animas Roque y Regina Ramos Gil. Conectemos el ecosistema. Transformemos México.
        </p>
      </section>

      <Footer />
    </>
  )
}
