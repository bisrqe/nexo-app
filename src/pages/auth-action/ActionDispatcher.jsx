import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import VerifyEmail from './VerifyEmail.jsx'
import ResetPassword from './ResetPassword.jsx'
import RecoverEmail from './RecoverEmail.jsx'
import RevertMfaEnrollment from './RevertMfaEnrollment.jsx'

// Punto de entrada único para los correos que Firebase manda por su cuenta
// (recoverEmail, revertSecondFactorAddition) — Firebase Console solo deja
// configurar UNA "action URL" para todo el proyecto (Authentication >
// Templates > personalizar URL de acción), y siempre le agrega
// ?mode=...&oobCode=... sin importar cuál de los 4 tipos sea. Esta página
// solo lee "mode" y delega en la página específica de cada flujo — los
// correos que sí mandamos nosotros (verificar-correo, restablecer-
// contraseña) usan handleCodeInApp y van directo a su propia página, sin
// pasar por aquí.
const PAGES_BY_MODE = {
  verifyEmail: VerifyEmail,
  resetPassword: ResetPassword,
  recoverEmail: RecoverEmail,
  revertSecondFactorAddition: RevertMfaEnrollment,
}

export default function ActionDispatcher() {
  const [params] = useSearchParams()
  const mode = params.get('mode')
  const Page = PAGES_BY_MODE[mode]

  if (Page) return <Page />

  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card">
          <span className="kicker">Enlace no reconocido</span>
          <h1 className="auth-title">No reconocemos este enlace</h1>
          <p className="auth-sub">Este enlace no es válido o ya expiró.</p>
          <Link to="/login" className="btn btn-ghost" style={{ justifyContent: 'center' }}>Volver a ingresar</Link>
        </div>
      </section>
      <Footer />
    </>
  )
}
