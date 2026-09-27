import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { ODS_FILTERS, INDUSTRY_FILTERS } from '../data/initiatives.js'
import { CITIES } from '../data/cities.js'
import { useUserContent } from '../context/UserContentContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'

const STAGES = ['Idea', 'Prototipo', 'En marcha', 'Escalando']
const ODS_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')
const INDUSTRY_OPTIONS = INDUSTRY_FILTERS.filter((f) => f.id !== 'todos')

const EMPTY = {
  title: '', org: '', city: '', link: '',
  ods: 'ods4', odsSecondary: '',
  industry: '', industrySecondary: '',
  stage: 'Idea', desc: '', need: '',
  collaboratorsText: '', impact: '', foundedDate: '', contact: '',
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '') || 'iniciativa'
}

function labelFor(list, id) {
  return list.find((o) => o.id === id)?.label ?? ''
}

// Igual que InitiativeDetail: vive en /iniciativas/nueva (público) y en
// /app/iniciativas/nueva (dashboard) — mismo formulario, distinto chrome.
// En el dashboard, si ya existe "mi iniciativa" el formulario arranca
// precargado con esos datos (antes siempre arrancaba vacío, aunque dijera
// "editar").
export default function NewInitiative({ variant = 'public' }) {
  const isApp = variant === 'app'
  const { myInitiative, setMyInitiative } = useUserContent()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [preview, setPreview] = useState(null)
  const [prefilled, setPrefilled] = useState(false)

  useEffect(() => {
    if (isApp && myInitiative && !prefilled) {
      setForm({
        title: myInitiative.title || '',
        org: myInitiative.org || '',
        city: myInitiative.city || '',
        link: myInitiative.link || '',
        ods: myInitiative.ods?.[0] || 'ods4',
        odsSecondary: myInitiative.ods?.[1] || '',
        industry: myInitiative.industry || '',
        industrySecondary: myInitiative.industrySecondary || '',
        stage: myInitiative.stage || 'Idea',
        desc: myInitiative.desc || '',
        need: myInitiative.need || '',
        collaboratorsText: (myInitiative.collaborators || []).join(', '),
        impact: myInitiative.impact || '',
        foundedDate: myInitiative.foundedDate || '',
        contact: myInitiative.contact || '',
      })
      setPrefilled(true)
    }
  }, [isApp, myInitiative, prefilled])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const odsLabel = labelFor(ODS_OPTIONS, form.ods)
    const odsSecondaryLabel = labelFor(ODS_OPTIONS, form.odsSecondary)
    const industryLabel = labelFor(INDUSTRY_OPTIONS, form.industry)
    const industrySecondaryLabel = labelFor(INDUSTRY_OPTIONS, form.industrySecondary)
    const collaborators = form.collaboratorsText.split(',').map((s) => s.trim()).filter(Boolean)

    const built = {
      id: Math.floor(Math.random() * 900) + 100,
      slug: isApp ? (myInitiative?.slug || `${slugify(form.title)}-${Math.random().toString(36).slice(2, 6)}`) : 'vista-previa',
      stage: form.stage,
      title: form.title || 'Tu iniciativa',
      org: form.org || 'Tu organización',
      city: form.city,
      location: CITIES.find((c) => c.id === form.city)?.name || 'Por definir',
      link: form.link,
      ods: [form.ods, form.odsSecondary].filter(Boolean),
      odsLabel,
      odsSecondaryLabel,
      industry: form.industry,
      industryLabel,
      industrySecondary: form.industrySecondary,
      industrySecondaryLabel,
      desc: form.desc || 'Aquí aparecerá la descripción que escribas.',
      longDesc: form.desc || 'Aquí aparecerá la descripción que escribas.',
      need: form.need || 'Por definir',
      collaborators,
      impact: form.impact,
      foundedDate: form.foundedDate,
      contact: form.contact || profile.email,
    }
    setPreview(built)

    // Dentro del dashboard, esto sí "queda guardado" como la iniciativa
    // propia de quien usa el sitio — se puede ver luego en /app/mi-iniciativa.
    if (isApp) setMyInitiative(built)
  }

  const content = (
    <div className="auth-card auth-card-wide">
      <span className="kicker">Nueva iniciativa</span>
      <h1 className="auth-title">Súmala al mapa</h1>
      <p className="auth-sub">
        {isApp
          ? 'Este dossier queda guardado de verdad y es lo que otras personas ven cuando entran a tu iniciativa.'
          : 'Al enviar el formulario verás una vista previa de cómo se vería tu tarjeta en el catálogo — para publicarla de verdad necesitas una cuenta.'}
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
                ? 'Ya quedó guardada como tu iniciativa — puedes verla y editarla desde "Mi iniciativa" en el sidebar.'
                : 'Para publicarla de verdad vas a necesitar una cuenta — eso llega en la siguiente etapa del proyecto.'}
            </p>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setPreview(null)}>Editar</button>
              {isApp && <button className="btn btn-primary" onClick={() => navigate('/app/mi-iniciativa')}>Ver mi iniciativa →</button>}
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
              <span>Ciudad / región</span>
              <select name="city" required value={form.city} onChange={handleChange}>
                <option value="">Selecciona una ciudad</option>
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Sitio web / liga</span>
              <input type="url" name="link" value={form.link} onChange={handleChange} placeholder="https://..." />
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              <span>Qué necesita ahora</span>
              <input type="text" name="need" value={form.need} onChange={handleChange} placeholder="Ej. Mentoría legal" />
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

          <div className="form-row">
            <label className="form-field">
              <span>ODS principal</span>
              <select name="ods" value={form.ods} onChange={handleChange}>
                {ODS_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>ODS secundario (opcional)</span>
              <select name="odsSecondary" value={form.odsSecondary} onChange={handleChange}>
                <option value="">Ninguno</option>
                {ODS_OPTIONS.filter((f) => f.id !== form.ods).map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              <span>Industria principal</span>
              <select name="industry" required value={form.industry} onChange={handleChange}>
                <option value="">Selecciona una industria</option>
                {INDUSTRY_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Industria secundaria (opcional)</span>
              <select name="industrySecondary" value={form.industrySecondary} onChange={handleChange}>
                <option value="">Ninguna</option>
                {INDUSTRY_OPTIONS.filter((f) => f.id !== form.industry).map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="form-field">
            <span>Descripción breve</span>
            <textarea name="desc" rows={4} value={form.desc} onChange={handleChange} placeholder="¿Qué problema resuelve y a quién?" />
          </label>

          <label className="form-field">
            <span>Impacto hasta ahora</span>
            <textarea name="impact" rows={2} value={form.impact} onChange={handleChange} placeholder="Ej. 140 personas graduadas, 2 escuelas con convenio firmado…" />
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Colaboradores (separados por coma)</span>
              <input type="text" name="collaboratorsText" value={form.collaboratorsText} onChange={handleChange} placeholder="Ej. Ana Ruiz, Luis Peña" />
            </label>
            <label className="form-field">
              <span>En marcha desde</span>
              <input type="date" name="foundedDate" value={form.foundedDate} onChange={handleChange} />
            </label>
          </div>

          <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }}>Ver vista previa →</button>
        </form>
      )}
    </div>
  )

  if (isApp) {
    return (
      <DashboardLayout eyebrow="Iniciativas" title={myInitiative ? 'Editar mi iniciativa' : 'Registrar nueva iniciativa'}>
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
