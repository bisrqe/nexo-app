import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card">
          <span className="kicker">Registrarse</span>
          <h1 className="auth-title">Súmate al mapa</h1>
          <p className="auth-sub">Todavía no hay cuentas reales conectadas — esta pantalla muestra cómo se va a ver.</p>

          {submitted ? (
            <div className="auth-note">
              <p><b>Esto es una demo.</b> El registro real llega cuando conectemos autenticación — por ahora no se guarda nada en ningún lado.</p>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => setSubmitted(false)}>Volver al formulario</button>
                <Link to="/dashboard" className="btn btn-primary">Entrar a mi dashboard →</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="form-field">
                <span>Nombre completo</span>
                <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Tu nombre" />
              </label>
              <label className="form-field">
                <span>Correo electrónico</span>
                <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="tu@correo.com" />
              </label>
              <label className="form-field">
                <span>Contraseña</span>
                <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
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
