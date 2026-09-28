import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { sendEmailVerification } from 'firebase/auth'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ODS_FILTERS, INDUSTRY_FILTERS } from '../data/initiatives.js'
import { PROFILE_TYPES, GENDERS } from '../data/profileOptions.js'
import { CITIES } from '../data/cities.js'

const ODS_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')
const INDUSTRY_OPTIONS = INDUSTRY_FILTERS.filter((f) => f.id !== 'todos')

// Tope del selector de fecha de nacimiento: hoy mismo, calculado en vez
// de quedar fijo en el código.
const TODAY = new Date().toISOString().slice(0, 10)

const EMPTY = {
  name: '',
  username: '',
  email: '',
  password: '',
  birthDate: '',
  gender: '',
  occupation: '',
  location: '',
  city: '',
  profileType: 'emprendedor',
  industry: '',
  interests: [],
  linkedin: '',
  bio: '',
}

function firebaseErrorMessage(err) {
  switch (err?.code) {
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.'
    case 'auth/invalid-email':
      return 'Ese correo no parece válido.'
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.'
    default:
      return 'No pudimos crear tu cuenta. Intenta de nuevo.'
  }
}

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const toggleInterest = (id) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(id) ? f.interests.filter((x) => x !== id) : [...f.interests, id],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signUp(form.email, form.password)
      const industryLabel = INDUSTRY_OPTIONS.find((i) => i.id === form.industry)?.label ?? ''
      await setDoc(doc(db, 'profiles', cred.user.uid), {
        name: form.name,
        username: form.username,
        email: form.email,
        birthDate: form.birthDate,
        gender: form.gender,
        occupation: form.occupation,
        location: form.location,
        city: form.city,
        profileType: form.profileType,
        industry: form.industry,
        industryLabel,
        interests: form.interests,
        linkedin: form.linkedin,
        bio: form.bio,
        photo: null,
      })
      sendEmailVerification(cred.user).catch(() => {})
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      setError(firebaseErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card auth-card-wide">
          <span className="kicker">Registrarse</span>
          <h1 className="auth-title">Súmate al mapa</h1>
          <p className="auth-sub">Crea tu cuenta real de Nexo — tu perfil queda guardado en la nube.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <label className="form-field">
                <span>Nombre completo</span>
                <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Tu nombre" />
              </label>
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
                    placeholder="tu.usuario"
                    pattern="[a-zA-Z0-9_.]{3,20}"
                    title="3 a 20 caracteres: letras, números, punto o guión bajo"
                  />
                </div>
              </label>
            </div>

            <label className="form-field">
              <span>Correo electrónico</span>
              <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="tu@correo.com" />
            </label>

            <label className="form-field">
              <span>Contraseña</span>
              <input type="password" name="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="••••••••" />
            </label>

            <div className="form-row">
              <label className="form-field">
                <span>Fecha de nacimiento</span>
                <input type="date" name="birthDate" required max={TODAY} value={form.birthDate} onChange={handleChange} />
              </label>
              <label className="form-field">
                <span>Género</span>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Selecciona una opción</option>
                  {GENDERS.map((g) => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="settings-card-desc" style={{ margin: '-10px 0 0' }}>
              Nombre, fecha de nacimiento y género no se podrán cambiar después de registrarte.
            </p>

            <div className="form-row">
              <label className="form-field">
                <span>Ocupación</span>
                <input type="text" name="occupation" value={form.occupation} onChange={handleChange} placeholder="Ej. Ingeniera agrónoma" />
              </label>
              <label className="form-field">
                <span>Ubicación (texto libre)</span>
                <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Ciudad, estado" />
              </label>
            </div>

            <div className="form-row">
              <label className="form-field">
                <span>Ciudad / región</span>
                <select name="city" required value={form.city} onChange={handleChange}>
                  <option value="">Selecciona tu ciudad</option>
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Tipo de perfil</span>
                <select name="profileType" value={form.profileType} onChange={handleChange}>
                  {PROFILE_TYPES.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="form-field">
              <span>Industria a la que perteneces</span>
              <select name="industry" value={form.industry} onChange={handleChange}>
                <option value="">Selecciona una industria</option>
                {INDUSTRY_OPTIONS.map((i) => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>ODS de interés</span>
              <div className="checkbox-group">
                {ODS_OPTIONS.map((o) => (
                  <label key={o.id} className={`checkbox-pill ${form.interests.includes(o.id) ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.interests.includes(o.id)}
                      onChange={() => toggleInterest(o.id)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </label>

            <label className="form-field">
              <span>LinkedIn u otra red (opcional)</span>
              <input type="url" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/tu-usuario" />
            </label>

            <label className="form-field">
              <span>Cuéntanos brevemente qué buscas</span>
              <textarea name="bio" rows={3} value={form.bio} onChange={handleChange} placeholder="Ej. Busco mentoría legal para constituir mi asociación civil" />
            </label>

            {error && <p style={{ color: '#c0392b', fontSize: 13.5 }}>{error}</p>}

            <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta →'}
            </button>
          </form>

          <p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Ingresa</Link></p>
        </div>
      </section>
      <Footer />
    </>
  )
}
