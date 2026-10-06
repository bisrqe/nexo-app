import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import NavIcon from '../components/NavIcon.jsx'
import { ODS_FILTERS, INDUSTRY_FILTERS, CAUSE_FILTERS } from '../data/initiatives.js'
import { REGIONS, statesOfRegion, getRegionName, sedesOf, isRemoteItem } from '../data/cities.js'
import { useUserContent } from '../context/UserContentContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { uploadFile } from '../lib/uploads.js'
import { normalizeUrl } from '../lib/url.js'
import { labelFor } from '../lib/catalogLabel.js'
import {
  kindFor, projectTypeFor, stageOptionsFor, defaultStageFor, PROFILE_TYPES_WITHOUT_OWN_INITIATIVE,
} from '../lib/initiativeKind.js'

const MAX_METRICS = 4
const EMPTY_SEDE = { region: '', state: '', cityName: '' }
const EMPTY_METRIC = { label: '', value: '' }

// "Organización / colectivo" confundía: no es el nombre del proyecto, sino a
// qué grupo mayor pertenece (si pertenece a alguno) — la etiqueta y la
// explicación cambian según el tipo de proyecto.
const ORG_FIELD = {
  emprendimientos: {
    label: 'Empresa, organización o colectivo al que perteneces',
    placeholder: 'Ej. Colectivo Raíz, Incubadora Tec',
    hint: 'Solo si tu emprendimiento forma parte de una organización, colectivo, incubadora o universidad más grande. Si trabajas por tu cuenta, déjalo vacío.',
  },
  iniciativas: {
    label: 'Colectivo, grupo estudiantil o escuela',
    placeholder: 'Ej. Sociedad de Alumnos de Ingeniería, UANL',
    hint: 'El grupo, club o institución educativa desde la que impulsas esta iniciativa. Si la haces por tu cuenta, déjalo vacío.',
  },
  instituciones: {
    label: 'Red, consorcio o dependencia a la que pertenece',
    placeholder: 'Ej. Secretaría de Economía de Nuevo León',
    hint: 'Solo si tu institución forma parte de una red, consorcio, fundación o dependencia mayor. Si es independiente, déjalo vacío.',
  },
}
const ODS_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')
const INDUSTRY_OPTIONS = INDUSTRY_FILTERS.filter((f) => f.id !== 'todos')
const CAUSE_OPTIONS = CAUSE_FILTERS.filter((f) => f.id !== 'todos')

const EMPTY = {
  title: '', org: '', sedes: [EMPTY_SEDE], remote: false, link: '', logoUrl: '',
  ods: 'ods4', odsOtra: '', odsSecondary: '', odsSecondaryOtra: '',
  industry: '', industryOtra: '', industrySecondary: '', industrySecondaryOtra: '',
  cause: '', causeOtra: '',
  stage: '', desc: '', need: '',
  collaboratorsText: '', impact: '', foundedDate: '',
  metrics: [], womenFocus: false,
  resources: [],
}

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '') || 'emprendimiento'
}

function resourceTypeFor(url) {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url) ? 'video' : 'link'
}

// Igual que InitiativeDetail: vive en /iniciativas/nueva (público) y en
// /app/iniciativas/nueva (dashboard) — mismo formulario, distinto chrome.
// Dentro del dashboard, una cuenta puede tener varios emprendimientos/
// iniciativas (ver UserContentContext), así que esta página SIEMPRE crea
// uno nuevo — salvo que venga con :slug (ruta /app/iniciativas/:slug/editar,
// enlazada desde el dossier), en cuyo caso precarga y edita ESE existente.
export default function NewInitiative({ variant = 'public' }) {
  const isApp = variant === 'app'
  const { slug: editSlug } = useParams()
  const { myInitiatives, createInitiative, updateInitiative } = useUserContent()
  const { profile } = useProfile()
  const editingInitiative = isApp && editSlug ? myInitiatives.find((i) => i.slug === editSlug) : null
  const isStudent = profile.profileType === 'estudiante'
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [preview, setPreview] = useState(null)
  const [prefilled, setPrefilled] = useState(false)
  const [resourceDraft, setResourceDraft] = useState({ label: '', url: '' })
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  // Solo importa al CREAR (no se puede cambiar después de editar, igual
  // que el resto de ownerProfileType/Subtype) — deja que una cuenta
  // estudiante registre tanto emprendimientos ya constituidos como
  // iniciativas/proyectos escolares, sin tocar su subtipo de perfil real.
  const [studentKind, setStudentKind] = useState('iniciativa')
  const effectiveSubtypeForKind = isStudent && !editingInitiative
    ? (studentKind === 'emprendimiento' ? 'emprendedor' : '')
    : profile.subtype
  // Al editar, el tipo lo manda quien registró el proyecto (no el perfil de
  // quien edita — un estudiante puede tener una iniciativa y un
  // emprendimiento a la vez, y un cofundador no es necesariamente del mismo
  // tipo que el dueño).
  const ownerType = editingInitiative ? editingInitiative.ownerProfileType : profile.profileType
  const ownerSubtype = editingInitiative ? (editingInitiative.ownerProfileSubtype || '') : effectiveSubtypeForKind
  const kind = kindFor(ownerType, ownerSubtype)
  const projectType = projectTypeFor(ownerType, ownerSubtype)
  const isOrg = ownerType === 'organizacion'
  const stageOptions = stageOptionsFor(projectType, editingInitiative?.stage)
  const selectedStage = stageOptions.find((o) => o.id === form.stage)

  // Si todavía no hay etapa (formulario nuevo) o la que había no existe para
  // este tipo de proyecto (se cambió entre iniciativa/emprendimiento), se
  // pone la primera de la lista de ese tipo.
  useEffect(() => {
    if (editingInitiative) return
    setForm((f) => (stageOptionsFor(projectType).some((o) => o.id === f.stage) ? f : { ...f, stage: defaultStageFor(projectType) }))
  }, [projectType, editingInitiative])

  useEffect(() => {
    if (isApp && editingInitiative && !prefilled) {
      const ods = editingInitiative.ods?.[0] || 'ods4'
      const odsSecondary = editingInitiative.ods?.[1] || ''
      setForm({
        title: editingInitiative.title || '',
        org: editingInitiative.org || '',
        sedes: sedesOf(editingInitiative).length > 0
          ? sedesOf(editingInitiative).map((x) => ({ region: x.region || '', state: x.state || '', cityName: x.cityName || '' }))
          : [EMPTY_SEDE],
        remote: isRemoteItem(editingInitiative),
        link: editingInitiative.link || '',
        logoUrl: editingInitiative.logoUrl || '',
        ods,
        odsOtra: ods === 'otra' ? editingInitiative.odsLabel || '' : '',
        odsSecondary,
        odsSecondaryOtra: odsSecondary === 'otra' ? editingInitiative.odsSecondaryLabel || '' : '',
        industry: editingInitiative.industry || '',
        industryOtra: editingInitiative.industry === 'otra' ? editingInitiative.industryLabel || '' : '',
        industrySecondary: editingInitiative.industrySecondary || '',
        industrySecondaryOtra: editingInitiative.industrySecondary === 'otra' ? editingInitiative.industrySecondaryLabel || '' : '',
        cause: editingInitiative.cause || '',
        causeOtra: editingInitiative.cause === 'otra' ? editingInitiative.causeLabel || '' : '',
        stage: editingInitiative.stage || defaultStageFor(projectTypeFor(editingInitiative.ownerProfileType, editingInitiative.ownerProfileSubtype)),
        desc: editingInitiative.desc || '',
        need: editingInitiative.need || '',
        collaboratorsText: (editingInitiative.collaborators || []).join(', '),
        impact: editingInitiative.impact || '',
        foundedDate: editingInitiative.foundedDate || '',
        metrics: editingInitiative.metrics || [],
        womenFocus: editingInitiative.genderFocus === 'mujeres',
        resources: editingInitiative.resources || [],
      })
      setPrefilled(true)
    }
  }, [isApp, editingInitiative, prefilled])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const updateSede = (index, patch) => setForm((f) => ({
    ...f,
    sedes: f.sedes.map((sede, i) => (i === index ? { ...sede, ...patch } : sede)),
  }))
  const addSede = () => setForm((f) => ({ ...f, sedes: [...f.sedes, EMPTY_SEDE] }))
  const removeSede = (index) => setForm((f) => ({ ...f, sedes: f.sedes.filter((_, i) => i !== index) }))

  const updateMetric = (index, patch) => setForm((f) => ({
    ...f,
    metrics: f.metrics.map((m, i) => (i === index ? { ...m, ...patch } : m)),
  }))
  const addMetric = () => setForm((f) => (f.metrics.length >= MAX_METRICS ? f : { ...f, metrics: [...f.metrics, EMPTY_METRIC] }))
  const removeMetric = (index) => setForm((f) => ({ ...f, metrics: f.metrics.filter((_, i) => i !== index) }))

  const handleUrlBlur = (e) => {
    const { name, value } = e.target
    const normalized = normalizeUrl(value)
    if (normalized !== value) setForm((f) => ({ ...f, [name]: normalized }))
  }

  const addResource = () => {
    const url = normalizeUrl(resourceDraft.url)
    if (!url) return
    setForm((f) => ({
      ...f,
      resources: [
        ...f.resources,
        { type: resourceTypeFor(url), label: resourceDraft.label.trim() || url, url },
      ],
    }))
    setResourceDraft({ label: '', url: '' })
  }

  const removeResource = (index) => {
    setForm((f) => ({ ...f, resources: f.resources.filter((_, i) => i !== index) }))
  }

  // A diferencia de handleFileUpload (documentos), el logo se puede subir
  // ANTES de guardar por primera vez — usa una carpeta "pending" temporal
  // cuando todavía no hay docId, así no hay que guardar dos veces solo
  // para poder ponerle logo.
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadingLogo(true)
    try {
      const folder = editingInitiative?.docId ? `initiatives/${editingInitiative.docId}` : `initiatives/pending-${Date.now()}`
      const uploaded = await uploadFile(folder, file)
      setForm((f) => ({ ...f, logoUrl: uploaded.url }))
    } catch (err) {
      alert(err.message || 'No se pudo subir el logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const removeLogo = () => setForm((f) => ({ ...f, logoUrl: '' }))

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editingInitiative?.docId) return
    setUploadingFile(true)
    try {
      const uploaded = await uploadFile(`initiatives/${editingInitiative.docId}`, file)
      setForm((f) => ({
        ...f,
        resources: [...f.resources, { type: 'file', label: uploaded.name, url: uploaded.url }],
      }))
    } catch (err) {
      alert(err.message || 'No se pudo subir el archivo.')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const odsLabel = labelFor(ODS_OPTIONS, form.ods, form.odsOtra)
    const odsSecondaryLabel = form.odsSecondary ? labelFor(ODS_OPTIONS, form.odsSecondary, form.odsSecondaryOtra) : ''
    const industryLabel = isOrg ? '' : labelFor(INDUSTRY_OPTIONS, form.industry, form.industryOtra)
    const industrySecondaryLabel = !isOrg && form.industrySecondary
      ? labelFor(INDUSTRY_OPTIONS, form.industrySecondary, form.industrySecondaryOtra)
      : ''
    const causeLabel = isOrg ? labelFor(CAUSE_OPTIONS, form.cause, form.causeOtra) : ''
    const collaborators = form.collaboratorsText.split(',').map((s) => s.trim()).filter(Boolean)
    const sedes = form.sedes
      .map((x) => ({ region: x.region, state: x.state || '', cityName: x.cityName.trim() }))
      .filter((x) => x.region || x.cityName)
    const regions = [...new Set(sedes.map((x) => x.region).filter(Boolean))]
    const metrics = form.metrics
      .map((m) => ({ label: m.label.trim(), value: m.value.trim() }))
      .filter((m) => m.label && m.value)
      .slice(0, MAX_METRICS)
    const locationText = sedes.map((x) => [x.cityName, x.state, getRegionName(x.region)].filter(Boolean).join(' · ')).join(' · ')

    const built = {
      id: editingInitiative?.id ?? (Math.floor(Math.random() * 900) + 100),
      slug: isApp ? (editingInitiative?.slug || `${slugify(form.title)}-${Math.random().toString(36).slice(2, 6)}`) : 'vista-previa',
      stage: form.stage,
      title: form.title || `Tu ${kind.noun}`,
      org: form.org || '',
      // Un proyecto puede tener varias sedes — region/cityName son la
      // principal (la primera), regions es la lista de todas las regiones
      // donde tiene sede, y remote marca que también opera a distancia.
      sedes,
      regions,
      region: sedes[0]?.region || '',
      state: sedes[0]?.state || '',
      cityName: sedes[0]?.cityName || '',
      remote: form.remote,
      location: locationText || (form.remote ? 'Remoto' : 'Por definir'),
      link: normalizeUrl(form.link),
      logoUrl: form.logoUrl,
      ods: [form.ods, form.odsSecondary].filter(Boolean),
      odsLabel,
      odsSecondaryLabel,
      industry: isOrg ? '' : form.industry,
      industryLabel,
      industrySecondary: isOrg ? '' : form.industrySecondary,
      industrySecondaryLabel,
      cause: isOrg ? form.cause : '',
      causeLabel,
      desc: form.desc || 'Aquí aparecerá la descripción que escribas.',
      longDesc: form.desc || 'Aquí aparecerá la descripción que escribas.',
      need: form.need || 'Por definir',
      collaborators,
      impact: form.impact,
      foundedDate: form.foundedDate,
      metrics,
      genderFocus: form.womenFocus ? 'mujeres' : '',
      resources: form.resources,
    }
    setPreview(built)

    // Dentro del dashboard, esto sí "queda guardado" de verdad — editingInitiative
    // decide si actualiza uno existente o crea otro nuevo.
    if (isApp) {
      if (editingInitiative) updateInitiative(editingInitiative.docId, built)
      else createInitiative(built, isStudent ? { ownerProfileType: 'estudiante', ownerProfileSubtype: effectiveSubtypeForKind } : undefined)
    }
  }

  // Si se acaba de crear (no editingInitiative) y desde la vista previa se
  // pide "Editar", se manda a la ruta de edición de ESE nuevo registro en
  // vez de solo reabrir el formulario local — así, si vuelve a guardar,
  // actualiza el que ya se creó en vez de crear otro más.
  const handleEditAgain = () => {
    if (isApp && !editingInitiative && preview) {
      navigate(`/app/iniciativas/${preview.slug}/editar`, { replace: true })
      return
    }
    setPreview(null)
  }

  if (isApp && PROFILE_TYPES_WITHOUT_OWN_INITIATIVE.includes(profile.profileType)) {
    return (
      <DashboardLayout eyebrow="Emprendimientos" title="No aplica para tu tipo de perfil">
        <div className="empty-state">
          <p>
            {profile.profileType === 'mentor'
              ? 'Como mentor/a no registras un emprendimiento propio — tu área de expertise ya está en tu perfil, para que otros te encuentren.'
              : 'Como voluntario/a no registras un emprendimiento propio — puedes explorar el catálogo y contactar a quienes sí tienen uno.'}
          </p>
          <Link to="/app/iniciativas" className="btn btn-primary" style={{ marginTop: 16 }}>Explorar emprendimientos →</Link>
        </div>
      </DashboardLayout>
    )
  }

  // editSlug viene en la URL pero todavía no aparece en myInitiatives — o
  // no existe, o esta cuenta no es miembro (Firestore ya lo filtra así).
  if (isApp && editSlug && !editingInitiative && !preview) {
    return (
      <DashboardLayout eyebrow={kind.eyebrow} title="No encontrado">
        <div className="empty-state">
          <p>No encontramos ese registro, o todavía se está cargando.</p>
          <Link to="/app/mi-iniciativa" className="link-arrow">Volver a {kind.myPlural.toLowerCase()} →</Link>
        </div>
      </DashboardLayout>
    )
  }

  const content = (
    <div className="auth-card auth-card-wide">
      <span className="kicker">{kind.nuevo} {kind.noun}</span>
      <h1 className="auth-title">Súmala al mapa</h1>
      <p className="auth-sub">
        {isApp
          ? `Este dossier queda guardado de verdad y es lo que otras personas ven cuando entran a tu ${kind.noun}.`
          : 'Al enviar el formulario verás una vista previa de cómo se vería tu tarjeta en el catálogo — para publicarla de verdad necesitas una cuenta.'}
      </p>

      {preview ? (
        <div className="preview-block">
          <p className="preview-label">Así se vería en el catálogo:</p>
          <div className="catalog-grid catalog-grid-single">
            <InitiativeCard initiative={{ ...preview, ownerProfileType: ownerType, ownerProfileSubtype: ownerSubtype }} />
          </div>
          <div className="auth-note">
            <p>
              {isApp
                ? `Ya quedó guardado como ${kind.un} ${kind.noun} tuy${kind.un === 'una' ? 'a' : 'o'} — puedes verlo y editarlo desde "${kind.my}" en el menú lateral.`
                : 'Para publicarla de verdad vas a necesitar una cuenta — eso llega en la siguiente etapa del proyecto.'}
            </p>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={handleEditAgain}>Editar</button>
              {isApp && <button className="btn btn-primary" onClick={() => navigate(`/app/iniciativas/${preview.slug}`)}>Ver {kind.noun} →</button>}
              {!isApp && <Link to="/register" className="btn btn-primary">Crear cuenta</Link>}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          {isStudent && !editingInitiative && (
            <label className="form-field">
              <span>¿Qué estás registrando?</span>
              <select value={studentKind} onChange={(e) => setStudentKind(e.target.value)}>
                <option value="iniciativa">Iniciativa — proyecto escolar, todavía no está constituido</option>
                <option value="emprendimiento">Emprendimiento — ya está constituido como negocio</option>
              </select>
            </label>
          )}
          {isApp && (
            <div className="avatar-upload">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="" className="dossier-logo" style={{ width: 72, height: 72 }} />
              ) : (
                <div className="dossier-logo-placeholder" style={{ width: 72, height: 72 }}>
                  <NavIcon name="box" size={28} />
                </div>
              )}
              <div className="avatar-upload-actions">
                <label className="btn btn-ghost">
                  {uploadingLogo ? 'Subiendo…' : `Subir logo de${kind.el === 'la' ? ' la' : 'l'} ${kind.noun}`}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} hidden disabled={uploadingLogo} />
                </label>
                {form.logoUrl && (
                  <button type="button" className="link-arrow" onClick={removeLogo}>Quitar logo</button>
                )}
              </div>
            </div>
          )}

          <div className="form-row">
            <label className="form-field">
              <span>Nombre de{kind.el === 'la' ? ' la' : 'l'} {kind.noun}</span>
              <input type="text" name="title" required value={form.title} onChange={handleChange} placeholder="Ej. Huertos urbanos escolares" />
              <span className="field-hint">Con este nombre aparece en el catálogo y en el dossier.</span>
            </label>
            <label className="form-field">
              <span>{ORG_FIELD[projectType].label} (opcional)</span>
              <input type="text" name="org" value={form.org} onChange={handleChange} placeholder={ORG_FIELD[projectType].placeholder} />
              <span className="field-hint">{ORG_FIELD[projectType].hint}</span>
            </label>
          </div>

          <fieldset className="form-fieldset">
            <legend>¿Dónde está?</legend>
            <p className="field-hint">
              {kind.un === 'una' ? 'Una' : 'Un'} {kind.noun} puede tener varias sedes. Para cada una elige la región, el estado y escribe la ciudad.
              {' '}La región es lo que usamos para filtrar y recomendar{kind.el === 'la' ? 'la' : 'lo'} a quien está cerca.
            </p>
            {form.sedes.map((sede, i) => (
              <div className="sede-row" key={i}>
                <label className="form-field">
                  <span>{i === 0 ? 'Sede principal — región' : `Sede ${i + 1} — región`}</span>
                  <select value={sede.region} required={!form.remote} onChange={(e) => updateSede(i, { region: e.target.value, state: '' })}>
                    <option value="">Selecciona una región</option>
                    {REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Estado</span>
                  <select value={sede.state} required={!form.remote} disabled={!sede.region} onChange={(e) => updateSede(i, { state: e.target.value })}>
                    <option value="">{sede.region ? 'Selecciona el estado' : 'Primero elige la región'}</option>
                    {statesOfRegion(sede.region).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Ciudad</span>
                  <input
                    type="text"
                    value={sede.cityName}
                    required={!form.remote}
                    onChange={(e) => updateSede(i, { cityName: e.target.value })}
                    placeholder="Escribe la ciudad"
                  />
                </label>
                {form.sedes.length > 1 && (
                  <button type="button" className="link-arrow sede-remove" onClick={() => removeSede(i)}>Quitar sede</button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={addSede}>+ Agregar otra sede</button>
            <label className="form-check-inline">
              <input type="checkbox" checked={form.remote} onChange={(e) => setForm((f) => ({ ...f, remote: e.target.checked }))} />
              <span>
                También opera de forma remota o en línea
                <span className="field-hint">Si lo marcas, {kind.el === 'la' ? 'la' : 'lo'} recomendamos a quien busque algo afín aunque viva en otra región. Si es 100% remoto, puedes dejar las sedes vacías.</span>
              </span>
            </label>
          </fieldset>

          <div className="form-row">
            <label className="form-field">
              <span>Sitio web / liga (opcional)</span>
              <input type="text" name="link" value={form.link} onChange={handleChange} onBlur={handleUrlBlur} placeholder="www.ejemplo.com" />
              <span className="field-hint">Aparece como botón "Visitar sitio" en el dossier. No necesitas escribir https://.</span>
            </label>
            <label className="form-field">
              <span>Qué necesita ahora</span>
              <input type="text" name="need" value={form.need} onChange={handleChange} placeholder="Ej. Mentoría legal" />
              <span className="field-hint">Lo más urgente que buscas (mentoría, financiamiento, voluntarios, aliados…). Se muestra como "Busca:" en la tarjeta.</span>
            </label>
          </div>

          <label className="form-field">
            <span>Etapa</span>
            <select name="stage" value={form.stage} onChange={handleChange}>
              {stageOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.id}</option>
              ))}
            </select>
            {selectedStage && <span className="field-hint">{selectedStage.hint}</span>}
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>ODS principal</span>
              <select name="ods" value={form.ods} onChange={handleChange}>
                {ODS_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <span className="field-hint">El Objetivo de Desarrollo Sostenible de la ONU al que más contribuye.</span>
            </label>
            {form.ods === 'otra' ? (
              <label className="form-field">
                <span>Especifica el ODS</span>
                <input type="text" name="odsOtra" value={form.odsOtra} onChange={handleChange} placeholder="Ej. Movilidad sustentable" />
              </label>
            ) : (
              <label className="form-field">
                <span>ODS secundario (opcional)</span>
                <select name="odsSecondary" value={form.odsSecondary} onChange={handleChange}>
                  <option value="">Ninguno</option>
                  {ODS_OPTIONS.filter((f) => f.id !== form.ods).map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {form.odsSecondary === 'otra' && (
            <label className="form-field">
              <span>Especifica el ODS secundario</span>
              <input type="text" name="odsSecondaryOtra" value={form.odsSecondaryOtra} onChange={handleChange} placeholder="Ej. Movilidad sustentable" />
            </label>
          )}

          {isOrg ? (
            <div className="form-row">
              <label className="form-field">
                <span>Causa que atiende</span>
                <select name="cause" required value={form.cause} onChange={handleChange}>
                  <option value="">Selecciona una causa</option>
                  {CAUSE_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <span className="field-hint">La problemática social principal que atiende tu institución.</span>
              </label>
              {form.cause === 'otra' && (
                <label className="form-field">
                  <span>Especifica la causa</span>
                  <input type="text" name="causeOtra" value={form.causeOtra} onChange={handleChange} placeholder="Ej. Educación financiera para jóvenes" />
                </label>
              )}
            </div>
          ) : (
            <>
              <div className="form-row">
                <label className="form-field">
                  <span>Industria principal</span>
                  <select name="industry" required value={form.industry} onChange={handleChange}>
                    <option value="">Selecciona una industria</option>
                    {INDUSTRY_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                  <span className="field-hint">El sector en el que opera. Es lo que más pesa para recomendarlo a otras personas.</span>
                </label>
                {form.industry === 'otra' ? (
                  <label className="form-field">
                    <span>Especifica la industria</span>
                    <input type="text" name="industryOtra" value={form.industryOtra} onChange={handleChange} placeholder="Ej. Turismo comunitario" />
                  </label>
                ) : (
                  <label className="form-field">
                    <span>Industria secundaria (opcional)</span>
                    <select name="industrySecondary" value={form.industrySecondary} onChange={handleChange}>
                      <option value="">Ninguna</option>
                      {INDUSTRY_OPTIONS.filter((f) => f.id !== form.industry).map((f) => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              {form.industrySecondary === 'otra' && (
                <label className="form-field">
                  <span>Especifica la industria secundaria</span>
                  <input type="text" name="industrySecondaryOtra" value={form.industrySecondaryOtra} onChange={handleChange} placeholder="Ej. Turismo comunitario" />
                </label>
              )}
            </>
          )}

          <label className="form-field">
            <span>Descripción breve</span>
            <textarea name="desc" rows={4} value={form.desc} onChange={handleChange} placeholder="¿Qué problema resuelve y a quién?" />
            <span className="field-hint">Lo primero que se lee en el dossier: qué problema atiende, para quién y cómo.</span>
          </label>

          <label className="form-field">
            <span>Impacto hasta ahora</span>
            <textarea name="impact" rows={2} value={form.impact} onChange={handleChange} placeholder="Ej. 140 personas graduadas, 2 escuelas con convenio firmado…" />
            <span className="field-hint">Resultados concretos en texto. Para cifras clave usa las métricas de abajo, que se muestran en grande.</span>
          </label>

          <fieldset className="form-fieldset">
            <legend>Métricas destacadas (opcional)</legend>
            <p className="field-hint">
              Hasta {MAX_METRICS} cifras que quieras que se vean primero en el dossier. Ejemplo: métrica "Engagement en redes" → cantidad "4,000 personas".
            </p>
            {form.metrics.map((m, i) => (
              <div className="metric-row" key={i}>
                <label className="form-field">
                  <span>Métrica</span>
                  <input type="text" value={m.label} onChange={(e) => updateMetric(i, { label: e.target.value })} placeholder="Ej. Engagement en redes" />
                </label>
                <label className="form-field">
                  <span>Cantidad</span>
                  <input type="text" value={m.value} onChange={(e) => updateMetric(i, { value: e.target.value })} placeholder="Ej. 4,000 personas" />
                </label>
                <button type="button" className="link-arrow sede-remove" onClick={() => removeMetric(i)}>Quitar</button>
              </div>
            ))}
            {form.metrics.length < MAX_METRICS && (
              <button type="button" className="btn btn-ghost" style={{ alignSelf: 'flex-start' }} onClick={addMetric}>+ Agregar métrica</button>
            )}
          </fieldset>

          <label className="form-check-inline">
            <input type="checkbox" checked={form.womenFocus} onChange={(e) => setForm((f) => ({ ...f, womenFocus: e.target.checked }))} />
            <span>
              Enfocad{kind.el === 'la' ? 'a' : 'o'} en mujeres (opcional)
              <span className="field-hint">Márcalo si {kind.el === 'la' ? 'la' : 'lo'} lideran mujeres o atiende principalmente a mujeres — así les aparece primero a quienes buscan eso.</span>
            </span>
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Colaboradores (separados por coma)</span>
              <input type="text" name="collaboratorsText" value={form.collaboratorsText} onChange={handleChange} placeholder="Ej. Ana Ruiz, Luis Peña" />
              <span className="field-hint">Nombres de quienes participan. Para darles acceso con su cuenta, usa "Ligar otra cuenta" desde el dossier.</span>
            </label>
            <label className="form-field">
              <span>En marcha desde</span>
              <input type="date" name="foundedDate" value={form.foundedDate} onChange={handleChange} />
              <span className="field-hint">Fecha en que {kind.el === 'la' ? 'la' : 'lo'} empezaste a operar o trabajar.</span>
            </label>
          </div>

          <label className="form-field">
            <span>Documentos, videos o ligas (opcional)</span>
            <div className="resource-add-row">
              <input
                type="text"
                value={resourceDraft.label}
                onChange={(e) => setResourceDraft((d) => ({ ...d, label: e.target.value }))}
                placeholder="Nombre (ej. Video de presentación)"
              />
              <input
                type="text"
                value={resourceDraft.url}
                onChange={(e) => setResourceDraft((d) => ({ ...d, url: e.target.value }))}
                placeholder="www.ejemplo.com"
              />
              <button type="button" className="btn btn-ghost" onClick={addResource}>Agregar +</button>
            </div>
            {isApp && editingInitiative?.docId && (
              <label className="btn btn-ghost" style={{ marginTop: 10, display: 'inline-flex' }}>
                {uploadingFile ? 'Subiendo…' : 'Subir documento o imagen 📎'}
                <input type="file" onChange={handleFileUpload} hidden disabled={uploadingFile} />
              </label>
            )}
            {isApp && !editingInitiative?.docId && (
              <p className="settings-card-desc" style={{ marginTop: 6 }}>
                Guarda primero tu {kind.noun} para poder subir documentos o imágenes — mientras tanto puedes agregar ligas.
              </p>
            )}
            {form.resources.length > 0 && (
              <ul className="resource-link-list">
                {form.resources.map((r, i) => (
                  <li key={`${r.url}-${i}`}>
                    <span>{r.type === 'video' ? '▶' : r.type === 'file' ? '📎' : '🔗'} {r.label}</span>
                    <button type="button" className="link-arrow" onClick={() => removeResource(i)}>Quitar</button>
                  </li>
                ))}
              </ul>
            )}
          </label>

          <div className="form-actions">
            <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }}>Ver vista previa →</button>
            {isApp && (
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/app/mi-iniciativa')}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )

  if (isApp) {
    return (
      <DashboardLayout eyebrow={kind.eyebrow} title={editingInitiative ? `Editar ${kind.my.toLowerCase()}` : `Registrar ${kind.un} ${kind.noun}`}>
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
