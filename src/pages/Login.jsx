import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function firebaseErrorMessage(err) {
  switch (err?.code) {
    case 'auth/invalid-email':
      return 'Ese correo no parece válido.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.'
    case 'auth/too-many-requests':
      return 'Demasiados intentos — espera un momento y vuelve a intentar.'
    default:
      return 'No pudimos iniciar sesión. Intenta de nuevo.'
  }
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(form.email, form.password)
      const dest = location.state?.from?.pathname || '/app/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(firebaseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card">
          <span className="kicker">Ingresar</span>
          <h1 className="auth-title">Bienvenido de vuelta</h1>
          <p className="auth-sub">Ingresa con tu cuenta de Nexo.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="form-field">
              <span>Correo electrónico</span>
              <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="tu@correo.com" />
            </label>
            <label className="form-field">
              <span>Contraseña</span>
              <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
            </label>

            {error && <p style={{ color: '#c0392b', fontSize: 13.5 }}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Ingresando…' : 'Ingresar →'}
            </button>
          </form>

          <p className="auth-switch">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
        </div>
      </section>
      <Footer />
    </>
  )
}
