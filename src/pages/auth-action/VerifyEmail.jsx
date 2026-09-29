import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { applyActionCode } from 'firebase/auth'
import { auth } from '../../lib/firebase.js'
import { authActionErrorMessage } from '../../lib/authAction.js'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const oobCode = params.get('oobCode')
  const [status, setStatus] = useState('loading') // loading | success | error
  const [error, setError] = useState('')

  useEffect(() => {
    if (!oobCode) {
      setStatus('error')
      setError('Este enlace no es válido o ya expiró.')
      return
    }
    applyActionCode(auth, oobCode)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setError(authActionErrorMessage(err))
      })
  }, [oobCode])

  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card">
          <span className="kicker">Verificación de correo</span>

          {status === 'loading' && (
            <>
              <h1 className="auth-title">Confirmando tu correo…</h1>
              <p className="auth-sub">Un momento, estamos validando el enlace.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="auth-title">¡Correo confirmado!</h1>
              <p className="auth-sub">Tu cuenta de Nexo ya quedó verificada. Puedes cerrar esta pestaña o continuar.</p>
              <Link to="/app/dashboard" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>Ir a mi cuenta →</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="auth-title">No pudimos confirmar tu correo</h1>
              <p className="auth-sub">{error}</p>
              <Link to="/app/ajustes" className="btn btn-ghost" style={{ justifyContent: 'center' }}>Pedir un nuevo enlace</Link>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
