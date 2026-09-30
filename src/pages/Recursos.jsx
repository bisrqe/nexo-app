import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { RESOURCE_REGIONS, RESOURCES } from '../data/resources.js'
import { CITIES, getCityName } from '../data/cities.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { normalizeUrl } from '../lib/url.js'
import { db } from '../lib/firebase.js'
import { relevanceScore } from '../lib/resourceRelevance.js'

const CITY_TO_REGION = { mty: 'mty', cdmx: 'cdmx', gdl: 'gdl' }
const NAMED_REGION_IDS = RESOURCE_REGIONS.map((r) => r.id)
// Cualquier ciudad del catálogo que no tenga ya su propia pestaña (mty,
// cdmx, gdl) cae dentro de "Otras ciudades" — con su propio filtro por
// ciudad, en vez de llenar la barra de arriba con una pestaña por cada una.
const OTHER_CITIES = CITIES.filter((c) => !NAMED_REGION_IDS.includes(c.id) && c.id !== 'otra')

// El link se guarda sin protocolo (mismo formato que src/data/resources.js,
// que arma el href como `https://${item.link}`) para que ambas fuentes se
// vean idénticas en la tarjeta.
function stripProtocol(url) {
  return normalizeUrl(url).replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}

function regionLabel(id) {
  return RESOURCE_REGIONS.find((r) => r.id === id)?.name || getCityName(id) || id
}

const EMPTY_DRAFT = { title: '', category: '', desc: '', link: '', region: '' }

export default function Recursos() {
  const { profile } = useProfile()
  const { user, isAdmin, isResourceApprover } = useAuth()
  const myRegion = CITY_TO_REGION[profile.city] || (OTHER_CITIES.some((c) => c.id === profile.city) ? profile.city : '')

  // Ciudad/región activa vive en la URL (?zona=, ?ciudad=) en vez de solo
  // en estado local — así refrescar la página o compartir el link no
  // borra el filtro que ya elegiste.
  const [searchParams, setSearchParams] = useSearchParams()
  const topTab = searchParams.get('zona') || (myRegion ? 'mine' : 'nacional')
  const otherCity = searchParams.get('ciudad') || ''
  const setTopTab = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('zona', value)
      next.delete('ciudad')
      return next
    })
  }
  const setOtherCity = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set('ciudad', value)
      else next.delete('ciudad')
      return next
    })
  }
  const [customResources] = useFirestoreCollection('resources')
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [showSuggestForm, setShowSuggestForm] = useState(false)
  const [adminDraft, setAdminDraft] = useState(EMPTY_DRAFT)
  const [suggestDraft, setSuggestDraft] = useState(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)

  const region = topTab === 'mine' ? myRegion : topTab === 'nacional' ? 'nacional' : otherCity

  // Todas las regiones que no son "mi ciudad" ni "alcance nacional" — es lo
  // que se muestra junto cuando entras a "Otras ciudades" sin elegir
  // todavía una específica en el desplegable, en vez de dejar la lista
  // vacía hasta que escojas una.
  const otherRegionIds = useMemo(
    () => [...RESOURCE_REGIONS.filter((r) => r.id !== 'nacional' && r.id !== myRegion), ...OTHER_CITIES.filter((c) => c.id !== myRegion)].map((r) => r.id),
    [myRegion]
  )

  const approvedCustom = customResources.filter((r) => !r.status || r.status === 'approved')
  const pendingCustom = customResources.filter((r) => r.status === 'pending')

  const items = useMemo(() => {
    const regionIds = topTab === 'mine'
      ? (myRegion ? [myRegion] : [])
      : topTab === 'nacional'
        ? ['nacional']
        : (otherCity ? [otherCity] : otherRegionIds)

    const all = regionIds.flatMap((r) => [
      ...(RESOURCES[r] || []),
      ...approvedCustom.filter((res) => res.region === r),
    ])
    return [...all].sort((a, b) => relevanceScore(b, profile.profileType) - relevanceScore(a, profile.profileType))
  }, [topTab, myRegion, otherCity, otherRegionIds, approvedCustom, profile.profileType])

  const handleAdminChange = (e) => setAdminDraft((d) => ({ ...d, [e.target.name]: e.target.value }))
  const handleSuggestChange = (e) => setSuggestDraft((d) => ({ ...d, [e.target.name]: e.target.value }))

  const openAdminForm = () => {
    setAdminDraft({ ...EMPTY_DRAFT, region: region || 'nacional' })
    setShowAdminForm(true)
  }
  const openSuggestForm = () => {
    setSuggestDraft({ ...EMPTY_DRAFT, region: region || 'nacional' })
    setShowSuggestForm(true)
  }

  const handleAddResource = async (e) => {
    e.preventDefault()
    if (!adminDraft.title.trim() || !adminDraft.link.trim() || !adminDraft.region) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'resources'), {
        title: adminDraft.title.trim(),
        category: adminDraft.category.trim() || 'Recurso',
        desc: adminDraft.desc.trim(),
        link: stripProtocol(adminDraft.link),
        region: adminDraft.region,
        status: 'approved',
        createdAt: serverTimestamp(),
      })
      setAdminDraft(EMPTY_DRAFT)
      setShowAdminForm(false)
    } finally {
      setSaving(false)
    }
  }

  const handleSuggestResource = async (e) => {
    e.preventDefault()
    if (!suggestDraft.title.trim() || !suggestDraft.link.trim() || !suggestDraft.region || !user) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'resources'), {
        title: suggestDraft.title.trim(),
        category: suggestDraft.category.trim() || 'Recurso',
        desc: suggestDraft.desc.trim(),
        link: stripProtocol(suggestDraft.link),
        region: suggestDraft.region,
        status: 'pending',
        submittedByUid: user.uid,
        submittedByName: profile.name || '',
        submittedByEmail: profile.email || user.email || '',
        createdAt: serverTimestamp(),
      })
      setSuggestDraft(EMPTY_DRAFT)
      setShowSuggestForm(false)
      alert('Gracias — tu recurso queda pendiente de aprobación, le avisamos al equipo de Nexo.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteResource = async (docId) => {
    if (!window.confirm('¿Borrar este recurso?')) return
    await deleteDoc(doc(db, 'resources', docId))
  }

  const handleApproveResource = async (docId) => {
    await updateDoc(doc(db, 'resources', docId), { status: 'approved' })
  }

  const regionOptions = useMemo(
    () => [...RESOURCE_REGIONS.filter((r) => r.id !== 'nacional'), ...OTHER_CITIES.map((c) => ({ id: c.id, name: c.name })), { id: 'nacional', name: 'Alcance nacional' }],
    []
  )

  return (
    <DashboardLayout
      eyebrow="Aprovechar lo que ya existe"
      title="Recursos"
      subtitle="Convocatorias, financiamiento, mentoría y aceleración — por ciudad, más lo que aplica en todo el país."
    >
      <div className="filters" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="filters" style={{ marginBottom: 0 }}>
          {myRegion && (
            <button className={`chip ${topTab === 'mine' ? 'active' : ''}`} onClick={() => setTopTab('mine')}>
              {regionLabel(myRegion)}
            </button>
          )}
          <button className={`chip ${topTab === 'nacional' ? 'active' : ''}`} onClick={() => setTopTab('nacional')}>
            Alcance nacional
          </button>
          <button className={`chip ${topTab === 'otras' ? 'active' : ''}`} onClick={() => setTopTab('otras')}>
            Otras ciudades
          </button>
          {topTab === 'otras' && (
            <select
              className="chip-select"
              value={otherCity}
              onChange={(e) => setOtherCity(e.target.value)}
            >
              <option value="">Todas las otras ciudades</option>
              {(myRegion ? RESOURCE_REGIONS.filter((r) => r.id !== 'nacional' && r.id !== myRegion) : RESOURCE_REGIONS.filter((r) => r.id !== 'nacional'))
                .concat(OTHER_CITIES.filter((c) => c.id !== myRegion))
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <button type="button" className="btn btn-primary" onClick={() => (showAdminForm ? setShowAdminForm(false) : openAdminForm())}>
              {showAdminForm ? 'Cancelar' : 'Agregar recurso +'}
            </button>
          )}
          {user && !isAdmin && (
            <button type="button" className="btn btn-ghost" onClick={() => (showSuggestForm ? setShowSuggestForm(false) : openSuggestForm())}>
              {showSuggestForm ? 'Cancelar' : 'Sugerir recurso +'}
            </button>
          )}
        </div>
      </div>

      {showAdminForm && (
        <div className="settings-card" style={{ marginBottom: 28 }}>
          <h2>Agregar recurso</h2>
          <p className="settings-card-desc">Solo tu cuenta admin ve este formulario. Queda publicado de inmediato en la zona que elijas.</p>
          <form onSubmit={handleAddResource} className="auth-form">
            <div className="form-row">
              <label className="form-field">
                <span>Nombre</span>
                <input type="text" name="title" required value={adminDraft.title} onChange={handleAdminChange} placeholder="Ej. Fondo Semilla CDMX" />
              </label>
              <label className="form-field">
                <span>Categoría</span>
                <input type="text" name="category" value={adminDraft.category} onChange={handleAdminChange} placeholder="Ej. Financiamiento" />
              </label>
            </div>
            <label className="form-field">
              <span>Ciudad / alcance</span>
              <select name="region" required value={adminDraft.region} onChange={handleAdminChange}>
                {regionOptions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Descripción</span>
              <textarea name="desc" rows={3} value={adminDraft.desc} onChange={handleAdminChange} placeholder="¿Qué ofrece y a quién aplica?" />
            </label>
            <label className="form-field">
              <span>Sitio web</span>
              <input type="text" name="link" required value={adminDraft.link} onChange={handleAdminChange} placeholder="www.ejemplo.com" />
            </label>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Agregar recurso +'}
            </button>
          </form>
        </div>
      )}

      {showSuggestForm && (
        <div className="settings-card" style={{ marginBottom: 28 }}>
          <h2>Sugerir recurso</h2>
          <p className="settings-card-desc">Lo revisa el equipo de Nexo antes de publicarlo — le avisamos a support@nexohub.mx en cuanto lo mandes.</p>
          <form onSubmit={handleSuggestResource} className="auth-form">
            <div className="form-row">
              <label className="form-field">
                <span>Nombre</span>
                <input type="text" name="title" required value={suggestDraft.title} onChange={handleSuggestChange} placeholder="Ej. Fondo Semilla CDMX" />
              </label>
              <label className="form-field">
                <span>Categoría</span>
                <input type="text" name="category" value={suggestDraft.category} onChange={handleSuggestChange} placeholder="Ej. Financiamiento" />
              </label>
            </div>
            <label className="form-field">
              <span>Ciudad / alcance</span>
              <select name="region" required value={suggestDraft.region} onChange={handleSuggestChange}>
                {regionOptions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Descripción</span>
              <textarea name="desc" rows={3} value={suggestDraft.desc} onChange={handleSuggestChange} placeholder="¿Qué ofrece y a quién aplica?" />
            </label>
            <label className="form-field">
              <span>Sitio web</span>
              <input type="text" name="link" required value={suggestDraft.link} onChange={handleSuggestChange} placeholder="www.ejemplo.com" />
            </label>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enviando…' : 'Enviar para revisión →'}
            </button>
          </form>
        </div>
      )}

      {isResourceApprover && pendingCustom.length > 0 && (
        <div className="settings-card settings-card-danger" style={{ marginBottom: 28 }}>
          <h2>Pendientes de aprobación ({pendingCustom.length})</h2>
          <p className="settings-card-desc">Solo tú las ves así — nadie más en Recursos hasta que las apruebes.</p>
          <div className="page-grid" style={{ margin: 0 }}>
            {pendingCustom.map((item) => (
              <div className="resource-card" key={item.docId}>
                <div className="resource-title">{item.title}</div>
                <div className="resource-org">{item.category} · {regionLabel(item.region)}</div>
                <p className="resource-desc">{item.desc}</p>
                <p className="settings-card-desc" style={{ margin: 0 }}>Sugerido por {item.submittedByName || 'alguien'}{item.submittedByEmail ? ` (${item.submittedByEmail})` : ''}</p>
                <a href={`https://${item.link}`} target="_blank" rel="noreferrer" className="resource-tag">Visitar sitio →</a>
                <div className="form-actions">
                  <button type="button" className="btn btn-primary" onClick={() => handleApproveResource(item.docId)}>Aprobar</button>
                  <button type="button" className="btn btn-ghost-danger" onClick={() => handleDeleteResource(item.docId)}>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
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
              <div className="resource-title">
                {item.title}
                {relevanceScore(item, profile.profileType) > 0 && (
                  <span className="need-badge" style={{ marginLeft: 8, verticalAlign: 'middle' }}>Recomendado para ti</span>
                )}
              </div>
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
