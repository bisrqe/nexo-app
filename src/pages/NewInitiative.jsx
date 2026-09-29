import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import NavIcon from '../components/NavIcon.jsx'
import { ODS_FILTERS, INDUSTRY_FILTERS, CAUSE_FILTERS } from '../data/initiatives.js'
import { CITIES } from '../data/cities.js'
import { useUserContent } from '../context/UserContentContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { uploadFile } from '../lib/uploads.js'
import { labelFor } from '../lib/catalogLabel.js'
import { kindFor, PROFILE_TYPES_WITHOUT_OWN_INITIATIVE } from '../lib/initiativeKind.js'

const STAGES = ['Idea', 'Prototipo', 'En marcha', 'Escalando']
const ODS_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')
const INDUSTRY_OPTIONS = INDUSTRY_FILTERS.filter((f) => f.id !== 'todos')
const CAUSE_OPTIONS = CAUSE_FILTERS.filter((f) => f.id !== 'todos')

const EMPTY = {
  title: '', org: '', city: '', link: '', logoUrl: '',
  ods: 'ods4', odsOtra: '', odsSecondary: '', odsSecondaryOtra: '',
  industry: '', industryOtra: '', industrySecondary: '', industrySecondaryOtra: '',
  cause: '', causeOtra: '',
  stage: 'Idea', desc: '', need: '',
  collaboratorsText: '', impact: '', foundedDate: '',
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
  const kind = kindFor(profile.profileType, profile.subtype)
  const isOrg = profile.profileType === 'organizacion'
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [preview, setPreview] = useState(null)
  const [prefilled, setPrefilled] = useState(false)
  const [resourceDraft, setResourceDraft] = useState({ label: '', url: '' })
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    if (isApp && editingInitiative && !prefilled) {
      const ods = editingInitiative.ods?.[0] || 'ods4'
      const odsSecondary = editingInitiative.ods?.[1] || ''
      setForm({
        title: editingInitiative.title || '',
        org: editingInitiative.org || '',
        city: editingInitiative.city || '',
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
        stage: editingInitiative.stage || 'Idea',
        desc: editingInitiative.desc || '',
        need: editingInitiative.need || '',
        collaboratorsText: (editingInitiative.collaborators || []).join(', '),
        impact: editingInitiative.impact || '',
        foundedDate: editingInitiative.foundedDate || '',
        resources: editingInitiative.resources || [],
      })
      setPrefilled(true)
    }
  }, [isApp, editingInitiative, prefilled])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const addResource = () => {
    const url = resourceDraft.url.trim()
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

    const built = {
      id: Math.floor(Math.random() * 900) + 100,
      slug: isApp ? (editingInitiative?.slug || `${slugify(form.title)}-${Math.random().toString(36).slice(2, 6)}`) : 'vista-previa',
      stage: form.stage,
      title: form.title || 'Tu emprendimiento',
      org: form.org || 'Tu organización',
      city: form.city,
      location: CITIES.find((c) => c.id === form.city)?.name || 'Por definir',
      link: form.link,
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
      resources: form.resources,
    }
    setPreview(built)

    // Dentro del dashboard, esto sí "queda guardado" de verdad — editingInitiative
    // decide si actualiza uno existente o crea otro nuevo.
    if (isApp) {
      if (editingInitiative) updateInitiative(editingInitiative.docId, built)
      else createInitiative(built)
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
            <InitiativeCard initiative={{ ...preview, ownerProfileType: profile.profileType, ownerProfileSubtype: profile.subtype }} />
          </div>
          <div className="auth-note">
            <p>
              {isApp
                ? `Ya quedó guardado como ${kind.un} ${kind.noun} tuy${kind.un === 'una' ? 'a' : 'o'} — puedes verlo y editarlo desde "${kind.myPlural}" en el sidebar.`
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
                type="url"
                value={resourceDraft.url}
                onChange={(e) => setResourceDraft((d) => ({ ...d, url: e.target.value }))}
                placeholder="https://..."
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

          <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }}>Ver vista previa →</button>
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
