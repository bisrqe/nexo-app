import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { ODS_FILTERS } from '../data/initiatives.js'
import { PROFILE_TYPES, GENDERS } from '../data/profileOptions.js'

const ODS_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')

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
  profileType: 'emprendedor',
  interests: [],
  bio: '',
}

export default function Register() {
  const [form, setForm] = useState(EMPTY)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const toggleInterest = (id) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(id) ? f.interests.filter((x) => x !== id) : [...f.interests, id],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card auth-card-wide">
          <span className="kicker">Registrarse</span>
          <h1 className="auth-title">Súmate al mapa</h1>
          <p className="auth-sub">Todavía no hay cuentas reales conectadas — esta pantalla muestra cómo se va a ver.</p>

          {submitted ? (
            <div className="auth-note">
              <p><b>Esto es una demo.</b> El registro real llega cuando conectemos autenticación — por ahora no se guarda nada en ningún lado.</p>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => setSubmitted(false)}>Volver al formulario</button>
                <Link to="/app/dashboard" className="btn btn-primary">Entrar a mi dashboard →</Link>
              </div>
            </div>
          ) : (
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
                <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
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
                <span>Cuéntanos brevemente qué buscas</span>
                <textarea name="bio" rows={3} value={form.bio} onChange={handleChange} placeholder="Ej. Busco mentoría legal para constituir mi asociación civil" />
              </label>

              <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }}>Crear cuenta →</button>
            </form>
          )}

          <p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Ingresa</Link></p>
        </div>
      </section>
      <Footer />
    </>
  )
}
