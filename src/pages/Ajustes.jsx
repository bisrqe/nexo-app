import React from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { CURRENT_USER, initials } from '../data/currentUser.js'

export default function Ajustes() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <DashboardLayout
      eyebrow="Mi cuenta"
      title="Perfil y ajustes"
      subtitle="Todavía no hay cuentas reales conectadas — el modo oscuro sí funciona y se recuerda en este navegador."
    >
      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-profile-head">
            <div className="person-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
              {initials(CURRENT_USER.name)}
            </div>
            <div>
              <h2 style={{ marginBottom: 2 }}>{CURRENT_USER.name}</h2>
              <p className="cat-org" style={{ marginTop: 0 }}>
                {CURRENT_USER.role} — {CURRENT_USER.location}
              </p>
            </div>
          </div>
          <p className="settings-card-desc">{CURRENT_USER.bio}</p>
          <div className="contact-block">
            <span className="kicker">Contacto</span>
            <a href={`mailto:${CURRENT_USER.email}`} className="btn btn-ghost">{CURRENT_USER.email}</a>
          </div>
        </div>

        <div className="settings-card">
          <h2>Preferencias</h2>
          <p className="settings-card-desc">Esto sí se guarda — queda en este navegador aunque cierres la pestaña.</p>

          <div className="settings-row">
            <div>
              <div className="settings-row-label">Modo oscuro</div>
              <div className="settings-row-desc">Cambia la paleta del panel a un fondo oscuro.</div>
            </div>
            <button
              type="button"
              className={`theme-toggle ${isDark ? 'on' : ''}`}
              onClick={toggleTheme}
              role="switch"
              aria-checked={isDark}
              aria-label="Activar modo oscuro"
            >
              <span className="theme-toggle-knob" />
            </button>
          </div>
        </div>

        <div className="auth-note">
          <p><b>Edición de perfil.</b> Cambiar nombre, correo o rol llega cuando conectemos cuentas reales — por ahora esta pantalla solo muestra cómo se va a ver.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
