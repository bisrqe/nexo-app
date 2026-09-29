import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { checkActionCode, applyActionCode } from 'firebase/auth'
import { auth } from '../../lib/firebase.js'
import { authActionErrorMessage } from '../../lib/authAction.js'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'

export default function RecoverEmail() {
  const [params] = useSearchParams()
  const oobCode = params.get('oobCode')
  const [status, setStatus] = useState('loading') // loading | success | error
  const [restoredEmail, setRestoredEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!oobCode) {
      setStatus('error')
      setError('Este enlace no es válido o ya expiró.')
      return
    }
    checkActionCode(auth, oobCode)
      .then((info) => applyActionCode(auth, oobCode).then(() => info))
      .then((info) => {
        setRestoredEmail(info.data.email || '')
        setStatus('success')
      })
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
          <span className="kicker">Cambio de correo</span>

          {status === 'loading' && (
            <>
              <h1 className="auth-title">Revirtiendo el cambio de correo…</h1>
              <p className="auth-sub">Un momento.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="auth-title">Tu correo fue restaurado</h1>
              <p className="auth-sub">
                {restoredEmail
                  ? <>Tu cuenta vuelve a usar <b>{restoredEmail}</b> como correo principal.</>
                  : 'Tu cuenta volvió a su correo original.'}
                {' '}Si tú no hiciste este cambio, te recomendamos actualizar tu contraseña de inmediato.
              </p>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>Ingresar →</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="auth-title">No pudimos revertir el cambio</h1>
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
