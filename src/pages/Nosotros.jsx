import React from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const VMV = [
  { roman: 'I — VISIÓN', title: 'Un punto de encuentro nacional', text: 'Conectar al sector público, privado y académico para transformar ideas en iniciativas que impulsen la economía mexicana.' },
  { roman: 'II — MISIÓN', title: 'De la idea a la acción conjunta', text: 'Permitir el intercambio de metodologías, procesos y recursos para co-crear soluciones compartidas ante retos comunes.' },
  { roman: 'III — VALORES', title: 'Empatía, transparencia, propósito', text: 'Colaboración, sostenibilidad, diversidad e inclusión, e innovación con un fin social claro.' },
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

      {/* ── CONTACT ──────────────────────────────── */}
      <section className="bg-alt">
        <div className="in contact-section">
          <span className="kicker">Contacto</span>
          <h2>¿Quieres hablar con Nexo?</h2>
          <p className="head-desc-below" style={{ marginTop: 4, marginBottom: 24 }}>
            Dudas, alianzas institucionales o prensa — escríbenos directamente.
          </p>
          <a href="mailto:join.nexo.mx@gmail.com" className="btn btn-gold btn-lg">join.nexo.mx@gmail.com</a>
        </div>
      </section>

      <Footer />
    </>
  )
}
