import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import MembersContacts from '../components/MembersContacts.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { INDUSTRY_FILTERS, ODS_FILTERS } from '../data/initiatives.js'

const INDUSTRY_OPTIONS = INDUSTRY_FILTERS.filter((f) => f.id !== 'todos')
const ODS_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')

function labelFor(list, id) {
  return list.find((o) => o.id === id)?.label ?? ''
}

function AddAdminForm({ onAdd }) {
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || busy) return
    setBusy(true)
    setStatus(null)
    const result = await onAdd(username)
    setBusy(false)
    if (result?.error) {
      setStatus({ type: 'error', text: result.error })
    } else {
      setStatus({ type: 'ok', text: 'Cuenta agregada como administradora de la mesa.' })
      setUsername('')
    }
  }

  return (
    <form onSubmit={submit} className="dossier-card">
      <label className="form-field">
        <span>+ Agregar colaborador/a (mismos permisos: editar, borrar, agregar/quitar gente)</span>
        <div className="resource-add-row">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@usuario"
            disabled={busy}
          />
          <button type="submit" className="btn btn-ghost" disabled={busy}>{busy ? 'Agregando…' : 'Agregar'}</button>
        </div>
      </label>
      {status && (
        <p style={{ color: status.type === 'error' ? '#c0392b' : 'inherit', fontSize: 13.5, marginTop: 6 }}>
          {status.text}
        </p>
      )}
    </form>
  )
}

export default function GroupDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, toggleJoinedGroup } = useProfile()
  const { groups, updateGroup, deleteGroup, addGroupAdmin, removeGroupAdmin } = useGroups()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)

  const group = groups.find((g) => g.slug === slug)

  if (!group) {
    return (
      <DashboardLayout eyebrow="Comunidad" title="No encontrada">
        <div className="auth-card">
          <span className="kicker">No encontrada</span>
          <h1 className="auth-title">Esa mesa de trabajo no existe</h1>
          <Link to="/app/comunidad" className="btn btn-primary">Volver a comunidad</Link>
        </div>
      </DashboardLayout>
    )
  }

  const joined = profile.joinedGroups?.includes(group.docId)
  const adminUids = group.adminUids || [group.ownerUid]
  const isAdmin = Boolean(user && adminUids.includes(user.uid))

  const startEditing = () => {
    setForm({
      name: group.name || '',
      industry: group.industry || '',
      secondaryType: group.secondaryOdsLabel ? 'ods' : group.secondaryTopic ? 'tema' : 'ods',
      secondaryOds: group.secondaryOds || '',
      secondaryTopic: group.secondaryTopic || '',
      desc: group.desc || '',
      about: group.about || '',
    })
    setEditing(true)
  }

  const handleFormChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.industry) return
    await updateGroup(group.docId, {
      name: form.name,
      industry: form.industry,
      industryLabel: labelFor(INDUSTRY_OPTIONS, form.industry),
      secondaryOds: form.secondaryType === 'ods' ? form.secondaryOds : '',
      secondaryOdsLabel: form.secondaryType === 'ods' ? labelFor(ODS_OPTIONS, form.secondaryOds) : '',
      secondaryTopic: form.secondaryType === 'tema' ? form.secondaryTopic : '',
      desc: form.desc || 'Sin descripción todavía.',
      about: form.about || '',
    })
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!window.confirm(`¿Seguro que quieres borrar la mesa "${group.name}"? Esto la borra para siempre, junto con su chat.`)) return
    await deleteGroup(group.docId)
    navigate('/app/comunidad')
  }

  return (
    <DashboardLayout eyebrow="Comunidad" title="Mesa de trabajo">
      <div className="in">
        <Link to="/app/comunidad" className="link-arrow back-link">← Volver a comunidad</Link>

        {editing ? (
          <div className="settings-card" style={{ marginTop: 20 }}>
            <h2>Editar mesa de trabajo</h2>
            <form onSubmit={handleSaveEdit} className="auth-form">
              <label className="form-field">
                <span>Nombre</span>
                <input type="text" name="name" required value={form.name} onChange={handleFormChange} />
              </label>
              <label className="form-field">
                <span>Industria principal</span>
                <select name="industry" required value={form.industry} onChange={handleFormChange}>
                  <option value="">Selecciona una industria</option>
                  {INDUSTRY_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </label>
              <div className="form-row">
                <label className="form-field">
                  <span>Categoría secundaria</span>
                  <select name="secondaryType" value={form.secondaryType} onChange={handleFormChange}>
                    <option value="ods">Un ODS</option>
                    <option value="tema">Tema libre</option>
                  </select>
                </label>
                {form.secondaryType === 'ods' ? (
                  <label className="form-field">
                    <span>ODS</span>
                    <select name="secondaryOds" value={form.secondaryOds} onChange={handleFormChange}>
                      <option value="">Ninguno</option>
                      {ODS_OPTIONS.map((f) => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="form-field">
                    <span>Tema</span>
                    <input type="text" name="secondaryTopic" value={form.secondaryTopic} onChange={handleFormChange} />
                  </label>
                )}
              </div>
              <label className="form-field">
                <span>Descripción breve</span>
                <textarea name="desc" rows={2} value={form.desc} onChange={handleFormChange} />
              </label>
              <label className="form-field">
                <span>Descripción detallada (opcional)</span>
                <textarea name="about" rows={4} value={form.about} onChange={handleFormChange} />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }}>Guardar cambios →</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="detail-head">
              <h1 className="detail-title">{group.name}</h1>
              <div className="cat-tags">
                <span>{group.industryLabel}</span>
                {group.secondaryOdsLabel && <span>{group.secondaryOdsLabel}</span>}
                {group.secondaryTopic && <span>{group.secondaryTopic}</span>}
              </div>
            </div>

            <div className="detail-body">
              <p className="detail-lede">{group.desc}</p>
              {group.about && <p>{group.about}</p>}
            </div>

            <div className="form-actions" style={{ marginTop: 24 }}>
              <button
                type="button"
                className={joined ? 'btn btn-ghost' : 'btn btn-primary'}
                onClick={() => toggleJoinedGroup(group.docId)}
              >
                {joined ? '✓ Ya eres parte' : 'Unirme →'}
              </button>
              {joined && (
                <button type="button" className="btn btn-gold" onClick={() => navigate(`/app/mensajes?group=${group.docId}`)}>
                  Ir al chat →
                </button>
              )}
              {isAdmin && (
                <button type="button" className="btn btn-ghost" onClick={startEditing}>Editar mesa</button>
              )}
              {isAdmin && (
                <button type="button" className="btn btn-ghost-danger" onClick={handleDelete}>Borrar mesa</button>
              )}
            </div>

            {isAdmin && (
              <div style={{ marginTop: 32 }}>
                <span className="kicker">Quién administra esta mesa</span>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <MembersContacts
                    ownerUid={group.ownerUid}
                    memberUids={adminUids}
                    onRemove={(uid) => removeGroupAdmin(group, uid)}
                    canManage
                    linkToProfiles
                    ownerLabel="Dueño/a"
                    memberLabel="Administrador/a"
                  />
                </div>
                <div style={{ marginTop: 16 }}>
                  <AddAdminForm onAdd={(username) => addGroupAdmin(group, username)} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
