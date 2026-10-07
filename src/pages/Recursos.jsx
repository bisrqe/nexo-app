import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import DashboardLayout from '../components/DashboardLayout.jsx'
import RegionFilter, { useRegionFilter } from '../components/RegionFilter.jsx'
import { flattenResources, normalizeResource } from '../data/resources.js'
import { REGIONS, getRegionName, statesOfRegion, profileRegion } from '../data/cities.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { normalizeUrl } from '../lib/url.js'
import { db } from '../lib/firebase.js'
import { relevanceScore } from '../lib/resourceRelevance.js'

const BUILT_IN = flattenResources()

// El link se guarda sin protocolo (mismo formato que src/data/resources.js,
// que arma el href como `https://${item.link}`) para que ambas fuentes se
// vean idénticas en la tarjeta.
function stripProtocol(url) {
  return normalizeUrl(url).replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}

const SCOPE_LABEL = { nacional: 'Alcance nacional', internacional: 'Internacional' }

function placeLabel(r) {
  if (r.scope !== 'estatal') return SCOPE_LABEL[r.scope] || ''
  return [r.state, getRegionName(r.regionId)].filter(Boolean).join(' · ')
}

const EMPTY_DRAFT = { title: '', category: '', desc: '', link: '', scope: 'estatal', regionId: '', state: '', womenFocus: false, noOpenCall: false }

// Campos de ubicación y alcance, comunes al formulario de admin y al de
// sugerencias.
function ResourceFormFields({ draft, onChange, setDraft }) {
  return (
    <>
      <div className="form-row">
        <label className="form-field">
          <span>Nombre</span>
          <input type="text" name="title" required value={draft.title} onChange={onChange} placeholder="Ej. Fondo Semilla CDMX" />
        </label>
        <label className="form-field">
          <span>Categoría</span>
          <input type="text" name="category" value={draft.category} onChange={onChange} placeholder="Ej. Financiamiento" />
        </label>
      </div>
      <label className="form-field">
        <span>Alcance</span>
        <select name="scope" value={draft.scope} onChange={(e) => setDraft((d) => ({ ...d, scope: e.target.value, regionId: '', state: '' }))}>
          <option value="estatal">De un estado o región</option>
          <option value="nacional">Alcance nacional / remoto</option>
          <option value="internacional">Internacional</option>
        </select>
      </label>
      {draft.scope === 'estatal' && (
        <div className="form-row">
          <label className="form-field">
            <span>Región</span>
            <select name="regionId" required value={draft.regionId} onChange={(e) => setDraft((d) => ({ ...d, regionId: e.target.value, state: '' }))}>
              <option value="">Selecciona una región</option>
              {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Estado</span>
            <select name="state" required value={draft.state} onChange={onChange} disabled={!draft.regionId}>
              <option value="">{draft.regionId ? 'Selecciona el estado' : 'Primero elige la región'}</option>
              {statesOfRegion(draft.regionId).map((st) => <option key={st} value={st}>{st}</option>)}
            </select>
          </label>
        </div>
      )}
      <label className="form-field">
        <span>Descripción</span>
        <textarea name="desc" rows={3} value={draft.desc} onChange={onChange} placeholder="¿Qué ofrece y a quién aplica?" />
      </label>
      <label className="form-field">
        <span>Sitio web</span>
        <input type="text" name="link" required value={draft.link} onChange={onChange} placeholder="www.ejemplo.com" />
      </label>
      <label className="form-check-inline">
        <input type="checkbox" checked={draft.womenFocus} onChange={(e) => setDraft((d) => ({ ...d, womenFocus: e.target.checked }))} />
        <span>
          Dirigido a mujeres
          <span className="field-hint">Se le recomienda primero a quien se registró como mujer.</span>
        </span>
      </label>
      <label className="form-check-inline">
        <input type="checkbox" checked={draft.noOpenCall} onChange={(e) => setDraft((d) => ({ ...d, noOpenCall: e.target.checked }))} />
        <span>
          Sin convocatoria abierta por ahora
          <span className="field-hint">El programa existe pero no hay fechas vigentes; se muestra con esa etiqueta y no se recomienda en el inicio.</span>
        </span>
      </label>
    </>
  )
}

function draftToDoc(draft) {
  return {
    title: draft.title.trim(),
    category: draft.category.trim() || 'Recurso',
    desc: draft.desc.trim(),
    link: stripProtocol(draft.link),
    scope: draft.scope,
    regionId: draft.scope === 'estatal' ? draft.regionId : '',
    state: draft.scope === 'estatal' ? draft.state : '',
    genderFocus: draft.womenFocus ? 'mujeres' : '',
    noOpenCall: draft.noOpenCall,
  }
}

export default function Recursos() {
  const { profile } = useProfile()
  const { user, isAdmin, isResourceApprover } = useAuth()
  const myRegion = profileRegion(profile)

  // Región y estado activos viven en la URL (?region=, ?estado=) — así
  // refrescar la página o compartir el link no borra el filtro. "Remoto"
  // aquí es lo de alcance nacional e internacional.
  const [regionFilter, setRegionFilter] = useRegionFilter(myRegion)
  const [searchParams, setSearchParams] = useSearchParams()
  const stateFilter = searchParams.get('estado') || ''
  const setStateFilter = (value) => setSearchParams((prev) => {
    const next = new URLSearchParams(prev)
    if (value) next.set('estado', value)
    else next.delete('estado')
    return next
  })
  const changeRegion = (value) => {
    setRegionFilter(value)
    setStateFilter('')
  }

  const [customResources] = useFirestoreCollection('resources')
  const [showAdminForm, setShowAdminForm] = useState(false)
  const [showSuggestForm, setShowSuggestForm] = useState(false)
  const [adminDraft, setAdminDraft] = useState(EMPTY_DRAFT)
  const [suggestDraft, setSuggestDraft] = useState(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)

  const approvedCustom = useMemo(
    () => customResources.filter((r) => !r.status || r.status === 'approved').map(normalizeResource),
    [customResources]
  )
  const pendingCustom = customResources.filter((r) => r.status === 'pending').map(normalizeResource)

  const items = useMemo(() => {
    const all = [...BUILT_IN, ...approvedCustom]
    const filtered = all.filter((r) => {
      if (regionFilter === 'todas') return true
      if (regionFilter === 'remoto') return r.scope !== 'estatal'
      if (r.scope !== 'estatal' || r.regionId !== regionFilter) return false
      return !stateFilter || r.state === stateFilter
    })
    // Los que tienen convocatoria abierta primero, luego por relevancia para
    // tu perfil; sort es estable, así que el resto conserva su orden.
    return filtered.sort((a, b) => (Number(Boolean(a.noOpenCall)) - Number(Boolean(b.noOpenCall))) || (relevanceScore(b, profile) - relevanceScore(a, profile)))
  }, [regionFilter, stateFilter, approvedCustom, profile])

  const handleAdminChange = (e) => setAdminDraft((d) => ({ ...d, [e.target.name]: e.target.value }))
  const handleSuggestChange = (e) => setSuggestDraft((d) => ({ ...d, [e.target.name]: e.target.value }))

  const openForm = (setDraft, setShow) => {
    const regionId = REGIONS.some((r) => r.id === regionFilter) ? regionFilter : ''
    setDraft({ ...EMPTY_DRAFT, scope: regionFilter === 'remoto' ? 'nacional' : 'estatal', regionId, state: regionId ? stateFilter : '' })
    setShow(true)
  }

  const handleAddResource = async (e) => {
    e.preventDefault()
    if (!adminDraft.title.trim() || !adminDraft.link.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'resources'), { ...draftToDoc(adminDraft), status: 'approved', createdAt: serverTimestamp() })
      setAdminDraft(EMPTY_DRAFT)
      setShowAdminForm(false)
    } finally {
      setSaving(false)
    }
  }

  const handleSuggestResource = async (e) => {
    e.preventDefault()
    if (!suggestDraft.title.trim() || !suggestDraft.link.trim() || !user) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'resources'), {
        ...draftToDoc(suggestDraft),
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

  return (
    <DashboardLayout
      eyebrow="Aprovechar lo que ya existe"
      title="Recursos"
      subtitle="Convocatorias, financiamiento, mentoría y aceleración — por región y estado, más lo que aplica en todo el país."
    >
      <div className="filters" style={{ justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <RegionFilter value={regionFilter} onChange={changeRegion} myRegion={myRegion} remoteLabel="Nacional e internacional" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {isAdmin && (
            <button type="button" className="btn btn-primary" onClick={() => (showAdminForm ? setShowAdminForm(false) : openForm(setAdminDraft, setShowAdminForm))}>
              {showAdminForm ? 'Cancelar' : 'Agregar recurso +'}
            </button>
          )}
          {user && !isAdmin && (
            <button type="button" className="btn btn-ghost" onClick={() => (showSuggestForm ? setShowSuggestForm(false) : openForm(setSuggestDraft, setShowSuggestForm))}>
              {showSuggestForm ? 'Cancelar' : 'Sugerir recurso +'}
            </button>
          )}
        </div>
      </div>

      {REGIONS.some((r) => r.id === regionFilter) && (
        <div className="filters">
          <select className={`chip-select ${stateFilter ? 'active' : ''}`} value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} aria-label="Filtrar por estado">
            <option value="">Todos los estados de la región</option>
            {statesOfRegion(regionFilter).map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      )}

      {showAdminForm && (
        <div className="settings-card" style={{ marginBottom: 28 }}>
          <h2>Agregar recurso</h2>
          <p className="settings-card-desc">Solo las cuentas del equipo ven este formulario. Queda publicado de inmediato.</p>
          <form onSubmit={handleAddResource} className="auth-form">
            <ResourceFormFields draft={adminDraft} onChange={handleAdminChange} setDraft={setAdminDraft} />
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Agregar recurso +'}</button>
          </form>
        </div>
      )}

      {showSuggestForm && (
        <div className="settings-card" style={{ marginBottom: 28 }}>
          <h2>Sugerir recurso</h2>
          <p className="settings-card-desc">Lo revisa el equipo de Nexo antes de publicarlo.</p>
          <form onSubmit={handleSuggestResource} className="auth-form">
            <ResourceFormFields draft={suggestDraft} onChange={handleSuggestChange} setDraft={setSuggestDraft} />
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Enviando…' : 'Enviar para revisión →'}</button>
          </form>
        </div>
      )}

      {isResourceApprover && pendingCustom.length > 0 && (
        <div className="settings-card settings-card-danger" style={{ marginBottom: 28 }}>
          <h2>Pendientes de aprobación ({pendingCustom.length})</h2>
          <p className="settings-card-desc">Solo el equipo las ve así — nadie más en Recursos hasta que se aprueben.</p>
          <div className="page-grid" style={{ margin: 0 }}>
            {pendingCustom.map((item) => (
              <div className="resource-card" key={item.docId}>
                <div className="resource-title">{item.title}</div>
                <div className="resource-org">{item.category} · {placeLabel(item)}</div>
                <p className="resource-desc">{item.desc}</p>
                <p className="settings-card-desc" style={{ margin: 0 }}>Sugerido por {item.submittedByName || 'alguien'}{item.submittedByEmail ? ` (${item.submittedByEmail})` : ''}</p>
                {item.link && <a href={`https://${item.link}`} target="_blank" rel="noreferrer" className="resource-tag">Visitar sitio →</a>}
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
          <button type="button" className="link-arrow" onClick={() => changeRegion('remoto')}>Ver recursos de alcance nacional e internacional →</button>
        </div>
      ) : (
        <div className="page-grid">
          {items.map((item) => (
            <div className="resource-card" key={item.docId || item.id}>
              <div className="resource-title">
                {item.title}
                {item.noOpenCall ? (
                  <span className="need-badge need-badge-muted" style={{ marginLeft: 8, verticalAlign: 'middle' }}>Sin convocatoria abierta</span>
                ) : relevanceScore(item, profile) > 0 && (
                  <span className="need-badge" style={{ marginLeft: 8, verticalAlign: 'middle' }}>Recomendado para ti</span>
                )}
              </div>
              <div className="resource-org">{item.category}{placeLabel(item) ? ` · ${placeLabel(item)}` : ''}</div>
              <p className="resource-desc">{item.desc}</p>
              {item.link && (
                <a href={`https://${item.link}`} target="_blank" rel="noreferrer" className="resource-tag">
                  Visitar sitio →
                </a>
              )}
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
        siguiente ventana. Los marcados "Sin convocatoria abierta" son vías que existen pero no tenían fechas
        confirmadas en 2026. Confirma siempre montos, fechas y bases en el sitio oficial antes de aplicar, y
        desconfía de cualquiera que pida pagos por adelantado: ningún programa público cobra por aprobar un crédito.
      </p>
    </DashboardLayout>
  )
}
