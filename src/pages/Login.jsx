import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // No hay backend todavía — esto solo simula el estado de la UI.
    setSubmitted(true)
  }

  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card">
          <span className="kicker">Ingresar</span>
          <h1 className="auth-title">Bienvenido de vuelta</h1>
          <p className="auth-sub">Todavía no hay cuentas reales conectadas — esta pantalla muestra cómo se va a ver.</p>

          {submitted ? (
            <div className="auth-note">
              <p><b>Esto es una demo.</b> El inicio de sesión real llega cuando conectemos autenticación — por ahora no hay ninguna base de datos detrás de este formulario.</p>
              <button className="btn btn-ghost" onClick={() => setSubmitted(false)}>Volver al formulario</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="form-field">
                <span>Correo electrónico</span>
                <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="tu@correo.com" />
              </label>
              <label className="form-field">
                <span>Contraseña</span>
                <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
              </label>
              <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>Ingresar →</button>
            </form>
          )}

          <p className="auth-switch">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
        </div>
      </section>
      <Footer />
    </>
  )
}
