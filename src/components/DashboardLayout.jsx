import React, { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function DashboardLayout({ eyebrow, title, subtitle, children }) {
  const { theme } = useTheme()
  const { user, resendVerificationEmail } = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [sent, setSent] = useState(false)

  const showBanner = Boolean(user && !user.emailVerified && !dismissed)

  const handleResend = async () => {
    await resendVerificationEmail()
    setSent(true)
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <Sidebar />
      <div className="app-main">
        {showBanner && (
          <div className="verify-banner">
            <span>
              {sent
                ? 'Te reenviamos el correo de confirmación — revisa tu bandeja de entrada.'
                : 'Confirma tu correo electrónico para asegurar tu cuenta.'}
            </span>
            <div className="verify-banner-actions">
              {!sent && (
                <button type="button" className="link-arrow" onClick={handleResend}>Reenviar correo</button>
              )}
              <button type="button" className="verify-banner-close" onClick={() => setDismissed(true)} aria-label="Cerrar aviso">✕</button>
            </div>
          </div>
        )}
        <header className="app-topbar">
          <div>
            {eyebrow && <span className="kicker">{eyebrow}</span>}
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  )
}
