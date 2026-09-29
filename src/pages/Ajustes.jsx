import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { initials, calculateAge } from '../data/currentUser.js'
import { ODS_FILTERS, INDUSTRY_FILTERS, CAUSE_FILTERS } from '../data/initiatives.js'
import { PROFILE_TYPES, GENDERS, STUDENT_SUBTYPES } from '../data/profileOptions.js'
import { CITIES } from '../data/cities.js'
import { labelFor } from '../lib/catalogLabel.js'
import { isStudentEntrepreneur } from '../lib/initiativeKind.js'

const ODS_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')
const INDUSTRY_OPTIONS = INDUSTRY_FILTERS.filter((f) => f.id !== 'todos')
const CAUSE_OPTIONS = CAUSE_FILTERS.filter((f) => f.id !== 'todos')
const PHOTO_SIZE = 200

// Redimensiona/recorta la foto a un cuadrado antes de guardarla — así una
// foto de varios MB no termina llenando el localStorage del navegador.
function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = PHOTO_SIZE
        canvas.height = PHOTO_SIZE
        const ctx = canvas.getContext('2d')
        const scale = Math.max(PHOTO_SIZE / img.width, PHOTO_SIZE / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (PHOTO_SIZE - w) / 2, (PHOTO_SIZE - h) / 2, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

const DELETE_ERROR_MESSAGES = {
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/invalid-credential': 'Contraseña incorrecta.',
  'auth/too-many-requests': 'Demasiados intentos — espera un momento e intenta de nuevo.',
}

export default function Ajustes() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { deleteAccount } = useAuth()
  const { profile, updateProfile } = useProfile()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    ...profile,
    industryOtra: profile.industry === 'otra' ? profile.industryLabel : '',
    industrySecondaryOtra: profile.industrySecondary === 'otra' ? profile.industrySecondaryLabel : '',
    causeOtra: profile.cause === 'otra' ? profile.causeLabel : '',
  })
  const [saved, setSaved] = useState(false)

  // Si el perfil cambia desde otro lado (poco probable, pero por si acaso
  // hay más de una pestaña abierta), refleja el valor guardado.
  useEffect(() => setForm({
    ...profile,
    industryOtra: profile.industry === 'otra' ? profile.industryLabel : '',
    industrySecondaryOtra: profile.industrySecondary === 'otra' ? profile.industrySecondaryLabel : '',
    causeOtra: profile.cause === 'otra' ? profile.causeLabel : '',
  }), [profile])

  const handleChange = (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleOdsChange = (e) => {
    setSaved(false)
    const value = e.target.value
    setForm((f) => ({ ...f, interests: value ? [value] : [] }))
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await resizePhoto(file)
    setSaved(false)
    setForm((f) => ({ ...f, photo: dataUrl }))
  }

  const removePhoto = () => {
    setSaved(false)
    setForm((f) => ({ ...f, photo: null }))
  }

  const toggleNotification = (key) => {
    setSaved(false)
    setForm((f) => ({
      ...f,
      notificationPrefs: { ...f.notificationPrefs, [key]: !f.notificationPrefs?.[key] },
    }))
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    setDeleteError('')
    setDeleting(true)
    try {
      await deleteAccount(deletePassword)
      navigate('/')
    } catch (err) {
      setDeleteError(DELETE_ERROR_MESSAGES[err.code] || 'No se pudo eliminar la cuenta — intenta de nuevo.')
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { industryOtra, industrySecondaryOtra, causeOtra, ...rest } = form
    const isEmprendedor = profile.profileType === 'emprendedor' || isStudentEntrepreneur(profile.profileType, form.subtype)
    const isOrganizacion = profile.profileType === 'organizacion'
    await updateProfile({
      ...rest,
      industry: isEmprendedor ? form.industry : '',
      industryLabel: isEmprendedor ? labelFor(INDUSTRY_OPTIONS, form.industry, industryOtra) : '',
      industrySecondary: isEmprendedor ? form.industrySecondary : '',
      industrySecondaryLabel: isEmprendedor && form.industrySecondary
        ? labelFor(INDUSTRY_OPTIONS, form.industrySecondary, industrySecondaryOtra)
        : '',
      cause: isOrganizacion ? form.cause : '',
      causeLabel: isOrganizacion ? labelFor(CAUSE_OPTIONS, form.cause, causeOtra) : '',
      subtype: profile.profileType === 'estudiante' ? form.subtype : '',
      profileType: profile.profileType,
    })
    setSaved(true)
  }

  const age = calculateAge(profile.birthDate)
  const genderLabel = GENDERS.find((g) => g.id === profile.gender)?.label ?? 'Sin especificar'

  return (
    <DashboardLayout
      eyebrow="Mi cuenta"
      title="Perfil y ajustes"
      subtitle="Tu perfil real — se guarda en tu cuenta y lo ve el resto del mapa."
    >
      <div className="settings-grid">
      <form onSubmit={handleSubmit} className="settings-grid">
        <div className="settings-card">
          <h2>Perfil</h2>
          <p className="settings-card-desc">Correo, causas, ubicación y foto — lo que se muestra de ti en el resto del sitio.</p>

          <div className="avatar-upload">
            <div className="person-avatar" style={{ width: 72, height: 72, fontSize: 22 }}>
              {form.photo ? <img src={form.photo} alt="" /> : initials(form.name)}
            </div>
            <div className="avatar-upload-actions">
              <label className="btn btn-ghost">
                Cambiar foto
                <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
              </label>
              {form.photo && (
                <button type="button" className="link-arrow" onClick={removePhoto}>Quitar foto</button>
              )}
            </div>
          </div>

          <div className="locked-fields">
            <div className="locked-field">
              <span className="locked-field-label">Nombre</span>
              <span className="locked-field-value">{profile.name}</span>
            </div>
            <div className="locked-field">
              <span className="locked-field-label">Edad</span>
              <span className="locked-field-value">{age !== null ? `${age} años` : 'Sin especificar'}</span>
            </div>
            <div className="locked-field">
              <span className="locked-field-label">Género</span>
              <span className="locked-field-value">{genderLabel}</span>
            </div>
            <div className="locked-field">
              <span className="locked-field-label">Tipo de perfil</span>
              <span className="locked-field-value">{PROFILE_TYPES.find((p) => p.id === profile.profileType)?.label ?? profile.profileType}</span>
            </div>
          </div>
          <p className="settings-card-desc" style={{ marginTop: -14 }}>
            Nombre, edad, género y tipo de perfil se definieron al registrarte y no se pueden cambiar aquí.
          </p>

          <label className="form-field">
            <span>Nombre de usuario</span>
            <div className="input-prefix">
              <span>@</span>
              <input
                type="text"
                name="username"
                required
                value={form.username}
                onChange={handleChange}
                pattern="[a-zA-Z0-9_.]{3,20}"
                title="3 a 20 caracteres: letras, números, punto o guión bajo"
              />
            </div>
          </label>

          <label className="form-field">
            <span>Correo electrónico</span>
            <input type="email" name="email" required value={form.email} onChange={handleChange} />
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Ocupación</span>
              <input type="text" name="occupation" value={form.occupation} onChange={handleChange} />
            </label>
            <label className="form-field">
              <span>Ubicación (texto libre)</span>
              <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Ciudad, estado" />
            </label>
          </div>

          <label className="form-field">
            <span>Ciudad / región</span>
            <select name="city" value={form.city} onChange={handleChange}>
              <option value="">Selecciona tu ciudad</option>
              {CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          {profile.profileType === 'estudiante' && (
            <label className="form-field">
              <span>Subcategoría (opcional)</span>
              <select name="subtype" value={form.subtype} onChange={handleChange}>
                {STUDENT_SUBTYPES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              {form.subtype === 'emprendedor' && (
                <span className="settings-card-desc" style={{ marginTop: 6 }}>
                  Si además de estudiar ya tienes un emprendimiento propio, esto hace que lo registres como emprendimiento (con industria) en vez de como iniciativa, y que el resto del sitio te recomiende como a cualquier otro emprendedor/a.
                </span>
              )}
            </label>
          )}

          {(profile.profileType === 'emprendedor' || isStudentEntrepreneur(profile.profileType, form.subtype)) && (
            <>
              <div className="form-row">
                <label className="form-field">
                  <span>Industria a la que perteneces</span>
                  <select name="industry" value={form.industry} onChange={handleChange}>
                    <option value="">Selecciona una industria</option>
                    {INDUSTRY_OPTIONS.map((i) => (
                      <option key={i.id} value={i.id}>{i.label}</option>
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
                    <span>Segunda industria (opcional)</span>
                    <select name="industrySecondary" value={form.industrySecondary} onChange={handleChange}>
                      <option value="">Ninguna</option>
                      {INDUSTRY_OPTIONS.filter((i) => i.id !== form.industry).map((i) => (
                        <option key={i.id} value={i.id}>{i.label}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              {form.industrySecondary === 'otra' && (
                <label className="form-field">
                  <span>Especifica la segunda industria</span>
                  <input type="text" name="industrySecondaryOtra" value={form.industrySecondaryOtra} onChange={handleChange} placeholder="Ej. Turismo comunitario" />
                </label>
              )}
            </>
          )}

          {(profile.profileType === 'estudiante' || profile.profileType === 'voluntario') && (
            <label className="form-field">
              <span>{profile.profileType === 'estudiante' ? 'ODS que ataca tu iniciativa' : 'ODS de tu interés'}</span>
              <select value={form.interests?.[0] || ''} onChange={handleOdsChange}>
                <option value="">Selecciona un ODS</option>
                {ODS_OPTIONS.filter((o) => o.id !== 'otra').map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
          )}

          {profile.profileType === 'mentor' && (
            <>
              <label className="form-field">
                <span>Área de expertise</span>
                <input type="text" name="expertise" value={form.expertise} onChange={handleChange} placeholder="Ej. Finanzas para startups, marketing digital" />
              </label>
              <label className="form-field">
                <span>¿En qué puedes brindar asesoría?</span>
                <textarea name="advisoryOffer" rows={3} value={form.advisoryOffer} onChange={handleChange} />
              </label>
            </>
          )}

          {profile.profileType === 'organizacion' && (
            <>
              <label className="form-field">
                <span>Causa que atiende tu institución/organización</span>
                <select name="cause" value={form.cause} onChange={handleChange}>
                  <option value="">Selecciona una causa</option>
                  {CAUSE_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </label>
              {form.cause === 'otra' && (
                <label className="form-field">
                  <span>Especifica la causa</span>
                  <input type="text" name="causeOtra" value={form.causeOtra} onChange={handleChange} placeholder="Ej. Educación financiera para jóvenes" />
                </label>
              )}
              <label className="form-field">
                <span>¿Qué hace tu institución/organización?</span>
                <textarea name="orgActivity" rows={3} value={form.orgActivity} onChange={handleChange} />
              </label>
              <label className="form-field">
                <span>¿A qué público atienden?</span>
                <input type="text" name="orgAudience" value={form.orgAudience} onChange={handleChange} placeholder="Ej. Estudiantes universitarios de últimos semestres" />
              </label>
            </>
          )}

          <label className="form-field">
            <span>LinkedIn u otra red</span>
            <input type="url" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/tu-usuario" />
          </label>

          <label className="form-field">
            <span>Biografía breve</span>
            <textarea name="bio" rows={3} value={form.bio} onChange={handleChange} />
          </label>

          <label className="form-field">
            <span>¿Qué buscas en Nexo?</span>
            <input type="text" name="lookingFor" value={form.lookingFor} onChange={handleChange} placeholder="Ej. Mentoría legal para constituir mi asociación civil" />
          </label>

          <div className="form-actions" style={{ marginTop: 4 }}>
            <button type="submit" className="btn btn-primary">Guardar cambios</button>
            {saved && <span className="settings-saved-note">✓ Guardado</span>}
          </div>
        </div>

        <div className="settings-card">
          <h2>Preferencias</h2>
          <p className="settings-card-desc">Esto también se guarda en este navegador.</p>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Modo oscuro</div>
              <div className="settings-row-desc">Cambia la paleta del panel a un fondo oscuro.</div>
            </div>
            <button
              type="button"
              className={`theme-toggle ${isDark ? 'on' : ''}`}
              onClick={toggleTheme}
              role="switch"
              aria-checked={isDark}
              aria-label="Activar modo oscuro"
            >
              <span className="theme-toggle-knob" />
            </button>
          </div>
        </div>

        <div className="settings-card">
          <h2>Notificaciones por correo</h2>
          <p className="settings-card-desc">Elige qué te avisamos por correo — se guarda con el resto de tu perfil.</p>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Alguien te escribe</div>
              <div className="settings-row-desc">Un mensaje directo nuevo de otra persona.</div>
            </div>
            <button
              type="button"
              className={`theme-toggle ${form.notificationPrefs?.onMessage ? 'on' : ''}`}
              onClick={() => toggleNotification('onMessage')}
              role="switch"
              aria-checked={Boolean(form.notificationPrefs?.onMessage)}
              aria-label="Avisarme cuando alguien me escribe"
            >
              <span className="theme-toggle-knob" />
            </button>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Actividad en tus mesas de trabajo</div>
              <div className="settings-row-desc">Alguien se une a una mesa que creaste.</div>
            </div>
            <button
              type="button"
              className={`theme-toggle ${form.notificationPrefs?.onGroupActivity ? 'on' : ''}`}
              onClick={() => toggleNotification('onGroupActivity')}
              role="switch"
              aria-checked={Boolean(form.notificationPrefs?.onGroupActivity)}
              aria-label="Avisarme de actividad en mis mesas de trabajo"
            >
              <span className="theme-toggle-knob" />
            </button>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Interés en tu emprendimiento</div>
              <div className="settings-row-desc">Alguien marca "Me interesa" en tu emprendimiento.</div>
            </div>
            <button
              type="button"
              className={`theme-toggle ${form.notificationPrefs?.onInterest ? 'on' : ''}`}
              onClick={() => toggleNotification('onInterest')}
              role="switch"
              aria-checked={Boolean(form.notificationPrefs?.onInterest)}
              aria-label="Avisarme cuando alguien muestra interés en mi emprendimiento"
            >
              <span className="theme-toggle-knob" />
            </button>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Publicidad y novedades</div>
              <div className="settings-row-desc">Convocatorias, recursos nuevos y noticias de la comunidad.</div>
            </div>
            <button
              type="button"
              className={`theme-toggle ${form.notificationPrefs?.marketing ? 'on' : ''}`}
              onClick={() => toggleNotification('marketing')}
              role="switch"
              aria-checked={Boolean(form.notificationPrefs?.marketing)}
              aria-label="Avisarme sobre publicidad y novedades"
            >
              <span className="theme-toggle-knob" />
            </button>
          </div>
        </div>

        <div className="auth-note">
          <p><b>Sobre esta cuenta.</b> Tu perfil vive en tu cuenta de Nexo — entra desde cualquier dispositivo con tu correo y contraseña y lo vas a encontrar igual.</p>
        </div>
      </form>

      <div className="settings-card settings-card-danger">
        <h2>Zona de peligro</h2>
        <p className="settings-card-desc">
          Elimina tu cuenta y tu perfil de Nexo de forma permanente. Esto no borra emprendimientos, eventos o mesas
          de trabajo que hayas creado — siguen en el mapa, solo que ligados a una cuenta ya eliminada. Esta acción no
          se puede deshacer.
        </p>

        {!deleteOpen ? (
          <button type="button" className="btn btn-ghost-danger" onClick={() => setDeleteOpen(true)}>
            Eliminar mi cuenta
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="delete-account-form">
            <label className="form-field">
              <span>Confirma tu contraseña para continuar</span>
              <input
                type="password"
                required
                value={deletePassword}
                onChange={(e) => { setDeletePassword(e.target.value); setDeleteError('') }}
                autoFocus
              />
            </label>
            {deleteError && <p className="delete-account-error">{deleteError}</p>}
            <div className="form-actions">
              <button type="submit" className="btn btn-danger" disabled={deleting || !deletePassword}>
                {deleting ? 'Eliminando…' : 'Eliminar cuenta definitivamente'}
              </button>
              <button
                type="button"
                className="link-arrow"
                onClick={() => { setDeleteOpen(false); setDeletePassword(''); setDeleteError('') }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
      </div>
    </DashboardLayout>
  )
}
