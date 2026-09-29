import React, { useEffect, useState } from 'react'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { RESOURCE_REGIONS, RESOURCES } from '../data/resources.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { db } from '../lib/firebase.js'

const CITY_TO_REGION = { mty: 'mty', cdmx: 'cdmx', gdl: 'gdl' }

// El link se guarda sin protocolo (mismo formato que src/data/resources.js,
// que arma el href como `https://${item.link}`) para que ambas fuentes se
// vean idénticas en la tarjeta.
function stripProtocol(url) {
  return (url || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}

const EMPTY_DRAFT = { title: '', category: '', desc: '', link: '' }

export default function Recursos() {
  const { profile } = useProfile()
  const { isAdmin } = useAuth()
  const [region, setRegion] = useState('nacional')
  const [touched, setTouched] = useState(false)
  const [customResources] = useFirestoreCollection('resources')
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)

  // Si el perfil ya cargó y tiene una de las tres ciudades con recursos
  // propios, arranca ahí en vez de en "Nacional" — mismo criterio que el
  // resto del dashboard. Deja de aplicar en cuanto la persona elige una
  // pestaña por su cuenta.
  useEffect(() => {
    if (touched) return
    const match = CITY_TO_REGION[profile.city]
    if (match) setRegion(match)
  }, [profile.city, touched])

  const handleSelect = (id) => {
    setTouched(true)
    setRegion(id)
  }

  const items = [
    ...(RESOURCES[region] || []),
    ...customResources.filter((r) => r.region === region),
  ]

  const handleDraftChange = (e) => setDraft((d) => ({ ...d, [e.target.name]: e.target.value }))

  const handleAddResource = async (e) => {
    e.preventDefault()
    if (!draft.title.trim() || !draft.link.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'resources'), {
        title: draft.title.trim(),
        category: draft.category.trim() || 'Recurso',
        desc: draft.desc.trim(),
        link: stripProtocol(draft.link),
        region,
        createdAt: serverTimestamp(),
      })
      setDraft(EMPTY_DRAFT)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteResource = async (docId) => {
    if (!window.confirm('¿Borrar este recurso?')) return
    await deleteDoc(doc(db, 'resources', docId))
  }

  return (
    <DashboardLayout
      eyebrow="Aprovechar lo que ya existe"
      title="Recursos"
      subtitle="Convocatorias, financiamiento, mentoría y aceleración — por ciudad, más lo que aplica en todo el país."
    >
      <div className="filters">
        {RESOURCE_REGIONS.map((r) => (
          <button
            key={r.id}
            className={`chip ${region === r.id ? 'active' : ''}`}
            onClick={() => handleSelect(r.id)}
          >
            {r.name}
          </button>
        ))}
      </div>

      {isAdmin && (
        <div className="settings-card" style={{ marginBottom: 28 }}>
          <h2>Agregar recurso — {RESOURCE_REGIONS.find((r) => r.id === region)?.name}</h2>
          <p className="settings-card-desc">Solo tu cuenta admin ve este formulario. Queda publicado para todos en esta pestaña.</p>
          <form onSubmit={handleAddResource} className="auth-form">
            <div className="form-row">
              <label className="form-field">
                <span>Nombre</span>
                <input type="text" name="title" required value={draft.title} onChange={handleDraftChange} placeholder="Ej. Fondo Semilla CDMX" />
              </label>
              <label className="form-field">
                <span>Categoría</span>
                <input type="text" name="category" value={draft.category} onChange={handleDraftChange} placeholder="Ej. Financiamiento" />
              </label>
            </div>
            <label className="form-field">
              <span>Descripción</span>
              <textarea name="desc" rows={3} value={draft.desc} onChange={handleDraftChange} placeholder="¿Qué ofrece y a quién aplica?" />
            </label>
            <label className="form-field">
              <span>Sitio web</span>
              <input type="url" name="link" required value={draft.link} onChange={handleDraftChange} placeholder="https://..." />
            </label>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Agregar recurso +'}
            </button>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Todavía no tenemos recursos capturados para esta zona.</p>
        </div>
      ) : (
        <div className="page-grid">
          {items.map((item) => (
            <div className="resource-card" key={item.docId || item.id}>
              <div className="resource-title">{item.title}</div>
              <div className="resource-org">{item.category}</div>
              <p className="resource-desc">{item.desc}</p>
              <a
                href={`https://${item.link}`}
                target="_blank"
                rel="noreferrer"
                className="resource-tag"
              >
                Visitar sitio →
              </a>
              {isAdmin && item.docId && (
                <button type="button" className="link-arrow" onClick={() => handleDeleteResource(item.docId)} style={{ alignSelf: 'flex-start' }}>
                  Borrar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="kpi-footnote" style={{ marginTop: 28 }}>
        Varias convocatorias son anuales; las que ya cerraron su edición 2026 quedan como referencia para la
        siguiente ventana. Confirma siempre montos, fechas y bases en el sitio oficial antes de aplicar, y
        desconfía de cualquiera que pida pagos por adelantado.
      </p>
    </DashboardLayout>
  )
}
