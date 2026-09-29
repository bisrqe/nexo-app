import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth'
import { auth } from '../../lib/firebase.js'
import { authActionErrorMessage } from '../../lib/authAction.js'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const oobCode = params.get('oobCode')
  const [status, setStatus] = useState('loading') // loading | form | success | error
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!oobCode) {
      setStatus('error')
      setError('Este enlace no es válido o ya expiró.')
      return
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((accountEmail) => {
        setEmail(accountEmail)
        setStatus('form')
      })
      .catch((err) => {
        setStatus('error')
        setError(authActionErrorMessage(err))
      })
  }, [oobCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setSubmitting(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setStatus('success')
    } catch (err) {
      setError(authActionErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card">
          <span className="kicker">Restablecer contraseña</span>

          {status === 'loading' && (
            <>
              <h1 className="auth-title">Verificando el enlace…</h1>
              <p className="auth-sub">Un momento.</p>
            </>
          )}

          {status === 'form' && (
            <>
              <h1 className="auth-title">Elige una nueva contraseña</h1>
              <p className="auth-sub">Para la cuenta <b>{email}</b>.</p>
              <form onSubmit={handleSubmit} className="auth-form">
                <label className="form-field">
                  <span>Nueva contraseña</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="••••••••"
                    autoFocus
                  />
                </label>
                <label className="form-field">
                  <span>Confirma la contraseña</span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                    placeholder="••••••••"
                  />
                </label>
                {error && <p style={{ color: '#c0392b', fontSize: 13.5 }}>{error}</p>}
                <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={submitting}>
                  {submitting ? 'Guardando…' : 'Guardar nueva contraseña →'}
                </button>
              </form>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="auth-title">Contraseña actualizada</h1>
              <p className="auth-sub">Ya puedes ingresar con tu nueva contraseña.</p>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>Ingresar →</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="auth-title">No pudimos procesar tu solicitud</h1>
              <p className="auth-sub">{error}</p>
              <Link to="/login" className="btn btn-ghost" style={{ justifyContent: 'center' }}>Volver a ingresar</Link>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
