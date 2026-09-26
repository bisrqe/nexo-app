import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { initials, calculateAge } from '../data/currentUser.js'
import { ODS_FILTERS } from '../data/initiatives.js'
import { PROFILE_TYPES, GENDERS } from '../data/profileOptions.js'

const ODS_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')
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

export default function Ajustes() {
  const { isDark, toggleTheme } = useTheme()
  const { profile, updateProfile } = useProfile()
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)

  // Si el perfil cambia desde otro lado (poco probable, pero por si acaso
  // hay más de una pestaña abierta), refleja el valor guardado.
  useEffect(() => setForm(profile), [profile])

  const handleChange = (e) => {
    setSaved(false)
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const toggleInterest = (id) => {
    setSaved(false)
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(id) ? f.interests.filter((x) => x !== id) : [...f.interests, id],
    }))
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

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfile(form)
    setSaved(true)
  }

  const age = calculateAge(profile.birthDate)
  const genderLabel = GENDERS.find((g) => g.id === profile.gender)?.label ?? 'Sin especificar'

  return (
    <DashboardLayout
      eyebrow="Mi cuenta"
      title="Perfil y ajustes"
      subtitle="Todavía no hay cuentas reales conectadas, pero esto sí se guarda de verdad en este navegador."
    >
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
          </div>
          <p className="settings-card-desc" style={{ marginTop: -14 }}>
            Nombre, edad y género se definieron al registrarte y no se pueden cambiar aquí.
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
              <span>Ubicación</span>
              <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Ciudad, estado" />
            </label>
          </div>

          <label className="form-field">
            <span>Tipo de perfil</span>
            <select name="profileType" value={form.profileType} onChange={handleChange}>
              {PROFILE_TYPES.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Causas / ODS de interés</span>
            <div className="checkbox-group">
              {ODS_OPTIONS.map((o) => (
                <label key={o.id} className={`checkbox-pill ${form.interests.includes(o.id) ? 'checked' : ''}`}>
                  <input type="checkbox" checked={form.interests.includes(o.id)} onChange={() => toggleInterest(o.id)} />
                  {o.label}
                </label>
              ))}
            </div>
          </label>

          <label className="form-field">
            <span>Biografía breve</span>
            <textarea name="bio" rows={3} value={form.bio} onChange={handleChange} />
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

        <div className="auth-note">
          <p><b>Sobre esta cuenta.</b> Todavía no hay autenticación real — estos cambios se guardan solo en este navegador, no en una cuenta que puedas usar en otro dispositivo.</p>
        </div>
      </form>
    </DashboardLayout>
  )
}
