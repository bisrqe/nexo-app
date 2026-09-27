import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { INDUSTRY_FILTERS, ODS_FILTERS } from '../data/initiatives.js'

const INDUSTRY_OPTIONS = INDUSTRY_FILTERS.filter((f) => f.id !== 'todos')
const ODS_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')

function labelFor(list, id) {
  return list.find((o) => o.id === id)?.label ?? ''
}

const EMPTY_GROUP = {
  name: '', industry: '', secondaryType: 'ods', secondaryOds: '', secondaryTopic: '',
  desc: '', about: '',
}

export default function Comunidad() {
  const { profile, toggleJoinedGroup } = useProfile()
  const { groups, createGroup } = useGroups()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_GROUP)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!form.name || !form.industry) return
    await createGroup({
      name: form.name,
      industry: form.industry,
      industryLabel: labelFor(INDUSTRY_OPTIONS, form.industry),
      secondaryType: form.secondaryType,
      secondaryOds: form.secondaryType === 'ods' ? form.secondaryOds : '',
      secondaryOdsLabel: form.secondaryType === 'ods' ? labelFor(ODS_OPTIONS, form.secondaryOds) : '',
      secondaryTopic: form.secondaryType === 'tema' ? form.secondaryTopic : '',
      desc: form.desc || 'Sin descripción todavía.',
      about: form.about || '',
    })
    setForm(EMPTY_GROUP)
    setShowForm(false)
  }

  return (
    <DashboardLayout
      eyebrow="Comunidad"
      title="Mesas de trabajo"
      subtitle="Espacios acotados por industria — no un timeline infinito. Únete a las que te interesan."
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Crear mesa de trabajo +'}
        </button>
      </div>

      {showForm && (
        <div className="settings-card" style={{ marginBottom: 32 }}>
          <h2>Nueva mesa de trabajo</h2>
          <p className="settings-card-desc">Queda guardada de verdad — cualquiera con cuenta puede verla y unirse.</p>
          <form onSubmit={handleCreateGroup} className="auth-form">
            <label className="form-field">
              <span>Nombre</span>
              <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Ej. Movilidad sustentable" />
            </label>

            <label className="form-field">
              <span>Industria principal</span>
              <select name="industry" required value={form.industry} onChange={handleChange}>
                <option value="">Selecciona una industria</option>
                {INDUSTRY_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </label>

            <div className="form-row">
              <label className="form-field">
                <span>Categoría secundaria</span>
                <select name="secondaryType" value={form.secondaryType} onChange={handleChange}>
                  <option value="ods">Un ODS</option>
                  <option value="tema">Tema libre</option>
                </select>
              </label>
              {form.secondaryType === 'ods' ? (
                <label className="form-field">
                  <span>ODS</span>
                  <select name="secondaryOds" value={form.secondaryOds} onChange={handleChange}>
                    <option value="">Ninguno</option>
                    {ODS_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="form-field">
                  <span>Tema</span>
                  <input type="text" name="secondaryTopic" value={form.secondaryTopic} onChange={handleChange} placeholder="Ej. Movilidad urbana" />
                </label>
              )}
            </div>

            <label className="form-field">
              <span>Descripción breve</span>
              <textarea name="desc" rows={2} value={form.desc} onChange={handleChange} placeholder="¿Para quién es esta mesa y de qué se habla ahí?" />
            </label>

            <label className="form-field">
              <span>Descripción detallada (opcional)</span>
              <textarea name="about" rows={4} value={form.about} onChange={handleChange} placeholder="De qué se habla en las sesiones, qué se ha logrado hasta ahora, quién debería sumarse…" />
            </label>

            <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }}>Crear mesa →</button>
          </form>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="empty-state">
          <p>Todavía no hay mesas de trabajo — sé quien abra la primera.</p>
        </div>
      ) : (
        <div className="page-grid">
          {groups.map((g) => {
            const joined = profile.joinedGroups?.includes(g.docId)
            return (
              <div className="group-card" key={g.docId}>
                <div className="group-top">
                  <div>
                    <div className="group-name">{g.name}</div>
                    <div className="cat-tags">
                      <span>{g.industryLabel}</span>
                      {g.secondaryOdsLabel && <span>{g.secondaryOdsLabel}</span>}
                      {g.secondaryTopic && <span>{g.secondaryTopic}</span>}
                    </div>
                  </div>
                </div>
                <p className="group-desc">{g.desc}</p>
                <div className="group-foot">
                  <button
                    className={joined ? 'btn btn-ghost' : 'btn btn-primary'}
                    onClick={() => toggleJoinedGroup(g.docId)}
                  >
                    {joined ? '✓ Ya eres parte' : 'Unirme →'}
                  </button>
                  <Link to={`/app/comunidad/${g.slug}`} className="link-arrow">Ver más →</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
