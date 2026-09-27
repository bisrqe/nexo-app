import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import NodeMark from './NodeMark.jsx'
import NavIcon from './NavIcon.jsx'
import { initials } from '../data/currentUser.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/app/dashboard', label: 'Inicio', icon: 'home' },
  { to: '/app/iniciativas', label: 'Iniciativas', icon: 'compass' },
  { to: '/app/mi-iniciativa', label: 'Mi iniciativa', icon: 'flag' },
  { to: '/app/personas', label: 'Personas', icon: 'users' },
  { to: '/app/recursos', label: 'Recursos', icon: 'box' },
  { to: '/app/comunidad', label: 'Comunidad', icon: 'chat' },
  { to: '/app/mensajes', label: 'Mensajes', icon: 'mail' },
  { to: '/app/eventos', label: 'Eventos', icon: 'calendar' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useProfile()
  const { signOutUser } = useAuth()
  const [open, setOpen] = useState(false)

  const isActive = (to) => location.pathname === to

  const handleLogout = async () => {
    setOpen(false)
    await signOutUser()
    navigate('/login')
  }

  return (
    <>
      <button className="app-topbar-toggle" onClick={() => setOpen((v) => !v)} aria-label="Abrir menú">
        <NavIcon name="chat" />
      </button>

      <aside className={`app-sidebar ${open ? 'open' : ''}`}>
        <Link to="/app/dashboard" className="app-brand">
          <NodeMark color="#FFD77F" />
          NEXO.
        </Link>

        <nav className="app-nav">
          <div className="app-nav-inner">
            {NAV.map(({ to, label, icon }) => (
              <Link key={to} to={to} className={isActive(to) ? 'active' : ''} onClick={() => setOpen(false)}>
                <NavIcon name={icon} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="app-nav-bottom">
          <Link to="/app/guardado" className={isActive('/app/guardado') ? 'active' : ''} onClick={() => setOpen(false)}>
            <NavIcon name="bookmark" />
            <span>Guardado</span>
          </Link>
          <button type="button" className="app-nav-logout" onClick={handleLogout}>
            <NavIcon name="logout" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        <Link
          to="/app/ajustes"
          className={`app-profile-card ${isActive('/app/ajustes') ? 'active' : ''}`}
          onClick={() => setOpen(false)}
        >
          <span className="app-profile-avatar">
            {profile.photo ? <img src={profile.photo} alt="" /> : initials(profile.name)}
          </span>
          <span className="app-profile-info">
            <span className="app-profile-name">{profile.name}</span>
            <span className="app-profile-role">Perfil y ajustes</span>
          </span>
          <NavIcon name="settings" size={16} />
        </Link>
      </aside>

      {open && <div className="app-sidebar-backdrop" onClick={() => setOpen(false)} />}
    </>
  )
}
