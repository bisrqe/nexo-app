import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { GROUPS } from '../data/groups.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'
import { ODS_FILTERS } from '../data/initiatives.js'

const ODS_LABELS = ODS_FILTERS.filter((f) => f.id !== 'todos').map((f) => f.label)

const EMPTY_GROUP = { name: '', odsLabel: ODS_LABELS[0], desc: '' }

export default function Comunidad() {
  const { profile, toggleJoinedGroup } = useProfile()
  const { myGroups, addGroup } = useUserContent()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_GROUP)

  const allGroups = useMemo(() => [...GROUPS, ...myGroups], [myGroups])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleCreateGroup = (e) => {
    e.preventDefault()
    if (!form.name) return
    const slug = form.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    addGroup({
      id: `local-${Date.now()}`,
      slug: slug || `mesa-${Date.now()}`,
      name: form.name,
      odsLabel: form.odsLabel,
      members: 1,
      desc: form.desc || 'Sin descripción todavía.',
      recent: 'Recién creada — sé la primera persona en compartir algo aquí.',
    })
    setForm(EMPTY_GROUP)
    setShowForm(false)
  }

  return (
    <DashboardLayout
      eyebrow="Comunidad"
      title="Mesas de trabajo"
      subtitle="Espacios acotados por ODS o sector — no un timeline infinito. Únete a las que te interesan."
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Crear mesa de trabajo +'}
        </button>
      </div>

      {showForm && (
        <div className="settings-card" style={{ marginBottom: 32 }}>
          <h2>Nueva mesa de trabajo</h2>
          <p className="settings-card-desc">Se agrega solo en este navegador — no hay backend detrás todavía.</p>
          <form onSubmit={handleCreateGroup} className="auth-form">
            <label className="form-field">
              <span>Nombre</span>
              <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Ej. Movilidad sustentable" />
            </label>
            <label className="form-field">
              <span>ODS principal</span>
              <select name="odsLabel" value={form.odsLabel} onChange={handleChange}>
                {ODS_LABELS.map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Descripción</span>
              <textarea name="desc" rows={3} value={form.desc} onChange={handleChange} placeholder="¿Para quién es esta mesa y de qué se habla ahí?" />
            </label>
            <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }}>Crear mesa →</button>
          </form>
        </div>
      )}

      <div className="page-grid">
        {allGroups.map((g) => {
          const joined = profile.joinedGroups?.includes(g.id)
          return (
            <div className="group-card" key={g.id}>
              <div className="group-top">
                <div>
                  <div className="group-name">{g.name}</div>
                  <div className="group-meta">{g.odsLabel} — {g.members} miembros</div>
                </div>
              </div>
              <p className="group-desc">{g.desc}</p>
              <p className="group-recent">"{g.recent}"</p>
              <div className="group-foot">
                <button
                  className={joined ? 'btn btn-ghost' : 'btn btn-primary'}
                  onClick={() => toggleJoinedGroup(g.id)}
                >
                  {joined ? '✓ Ya eres parte' : 'Unirme →'}
                </button>
                {joined && <Link to="/app/mensajes" className="link-arrow">Ir al chat →</Link>}
              </div>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
