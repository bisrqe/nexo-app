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
  const { signIn, sendPasswordReset } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

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

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotLoading(true)
    try {
      await sendPasswordReset(forgotEmail)
      setForgotSent(true)
    } catch (err) {
      // No revelamos si el correo existe o no — mismo mensaje de éxito,
      // para no dejar enumerar cuentas registradas.
      if (err.code === 'auth/user-not-found') {
        setForgotSent(true)
      } else {
        setForgotError(firebaseErrorMessage(err))
      }
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card">
          {!forgotOpen ? (
            <>
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

              <p className="auth-switch">
                <button
                  type="button"
                  className="link-arrow"
                  onClick={() => { setForgotOpen(true); setForgotEmail(form.email); setForgotSent(false); setForgotError('') }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </p>
              <p className="auth-switch">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
            </>
          ) : (
            <>
              <span className="kicker">Restablecer contraseña</span>
              {!forgotSent ? (
                <>
                  <h1 className="auth-title">¿Olvidaste tu contraseña?</h1>
                  <p className="auth-sub">Te mandamos un enlace para elegir una nueva.</p>
                  <form onSubmit={handleForgotSubmit} className="auth-form">
                    <label className="form-field">
                      <span>Correo electrónico</span>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => { setForgotEmail(e.target.value); setForgotError('') }}
                        placeholder="tu@correo.com"
                        autoFocus
                      />
                    </label>
                    {forgotError && <p style={{ color: '#c0392b', fontSize: 13.5 }}>{forgotError}</p>}
                    <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={forgotLoading}>
                      {forgotLoading ? 'Enviando…' : 'Enviar enlace →'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h1 className="auth-title">Revisa tu correo</h1>
                  <p className="auth-sub">Si <b>{forgotEmail}</b> tiene una cuenta con nosotros, te llegará un enlace para restablecer tu contraseña.</p>
                </>
              )}
              <p className="auth-switch">
                <button type="button" className="link-arrow" onClick={() => setForgotOpen(false)}>← Volver a ingresar</button>
              </p>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
