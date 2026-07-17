import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { ODS_FILTERS } from '../data/initiatives.js'

const STAGES = ['Idea', 'Prototipo', 'En marcha', 'Escalando']
const EMPTY = { title: '', org: '', location: '', ods: 'ods4', stage: 'Idea', desc: '', need: '' }

// Igual que InitiativeDetail: vive en /iniciativas/nueva (público) y en
// /app/iniciativas/nueva (dashboard) — mismo formulario, distinto chrome.
export default function NewInitiative({ variant = 'public' }) {
  const isApp = variant === 'app'
  const [form, setForm] = useState(EMPTY)
  const [preview, setPreview] = useState(null)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const odsLabel = ODS_FILTERS.find((f) => f.id === form.ods)?.label ?? ''
    setPreview({
      id: Math.floor(Math.random() * 900) + 100,
      slug: 'vista-previa',
      stage: form.stage,
      title: form.title || 'Tu iniciativa',
      org: form.org || 'Tu organización',
      desc: form.desc || 'Aquí aparecerá la descripción que escribas.',
      odsLabel,
      need: form.need || 'Por definir',
    })
  }

  const content = (
    <div className="auth-card auth-card-wide">
      <span className="kicker">Nueva iniciativa</span>
      <h1 className="auth-title">Súmala al mapa</h1>
      <p className="auth-sub">
        Todavía no hay base de datos conectada — al enviar el formulario verás una vista previa de cómo se vería
        tu tarjeta en el catálogo, no se publica nada de verdad.
      </p>

      {preview ? (
        <div className="preview-block">
          <p className="preview-label">Así se vería en el catálogo:</p>
          <div className="catalog-grid catalog-grid-single">
            <InitiativeCard initiative={preview} />
          </div>
          <div className="auth-note">
            <p>
              {isApp
                ? 'Cuando conectemos base de datos, esto quedará publicado de verdad en el catálogo.'
                : 'Para publicarla de verdad vas a necesitar una cuenta — eso llega en la siguiente etapa del proyecto.'}
            </p>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setPreview(null)}>Editar</button>
              {!isApp && <Link to="/register" className="btn btn-primary">Crear cuenta</Link>}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <label className="form-field">
              <span>Nombre de la iniciativa</span>
              <input type="text" name="title" required value={form.title} onChange={handleChange} placeholder="Ej. Huertos urbanos escolares" />
            </label>
            <label className="form-field">
              <span>Organización / colectivo</span>
              <input type="text" name="org" value={form.org} onChange={handleChange} placeholder="Ej. Colectivo Raíz" />
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              <span>Ubicación</span>
              <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Ciudad, estado" />
            </label>
            <label className="form-field">
              <span>Qué necesita ahora</span>
              <input type="text" name="need" value={form.need} onChange={handleChange} placeholder="Ej. Mentoría legal" />
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              <span>ODS principal</span>
              <select name="ods" value={form.ods} onChange={handleChange}>
                {ODS_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Etapa</span>
              <select name="stage" value={form.stage} onChange={handleChange}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-field">
            <span>Descripción breve</span>
            <textarea name="desc" rows={4} value={form.desc} onChange={handleChange} placeholder="¿Qué problema resuelve y a quién?" />
          </label>

          <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }}>Ver vista previa →</button>
        </form>
      )}
    </div>
  )

  if (isApp) {
    return (
      <DashboardLayout eyebrow="Iniciativas" title="Registrar nueva iniciativa">
        {content}
      </DashboardLayout>
    )
  }

  return (
    <>
      <Header />
      <section className="auth-section">{content}</section>
      <Footer />
    </>
  )
}
