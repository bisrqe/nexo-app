import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { checkActionCode, applyActionCode } from 'firebase/auth'
import { auth } from '../../lib/firebase.js'
import { authActionErrorMessage } from '../../lib/authAction.js'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'

// mode=revertSecondFactorAddition — Firebase manda este correo cuando se
// agrega un segundo factor (ej. verificación por SMS) a una cuenta, como
// aviso de seguridad. Este enlace deshace esa alta si la persona no fue
// quien la hizo.
export default function RevertMfaEnrollment() {
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
    checkActionCode(auth, oobCode)
      .then(() => applyActionCode(auth, oobCode))
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
          <span className="kicker">Verificación en dos pasos</span>

          {status === 'loading' && (
            <>
              <h1 className="auth-title">Revisando el aviso de seguridad…</h1>
              <p className="auth-sub">Un momento.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="auth-title">Verificación en dos pasos revertida</h1>
              <p className="auth-sub">
                Se quitó el segundo factor que se había agregado a tu cuenta. Si tú no hiciste este cambio, te
                recomendamos actualizar tu contraseña de inmediato.
              </p>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>Ingresar →</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="auth-title">No pudimos procesar este aviso</h1>
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
