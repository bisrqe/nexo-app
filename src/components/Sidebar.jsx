import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import NodeMark from './NodeMark.jsx'
import NavIcon from './NavIcon.jsx'

const NAV = [
  { to: '/dashboard', label: 'Inicio', icon: 'home' },
  { to: '/iniciativas', label: 'Iniciativas', icon: 'compass' },
  { to: '/personas', label: 'Personas', icon: 'users' },
  { to: '/recursos', label: 'Recursos', icon: 'box' },
  { to: '/comunidad', label: 'Comunidad', icon: 'chat' },
  { to: '/eventos', label: 'Eventos', icon: 'calendar' },
]

export default function Sidebar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isActive = (to) => location.pathname === to

  return (
    <>
      <button className="app-topbar-toggle" onClick={() => setOpen((v) => !v)} aria-label="Abrir menú">
        <NavIcon name="chat" />
      </button>

      <aside className={`app-sidebar ${open ? 'open' : ''}`}>
        <Link to="/dashboard" className="app-brand">
          <NodeMark color="#FFD77F" />
          NEXO.
        </Link>

        <nav className="app-nav">
          {NAV.map(({ to, label, icon }) => (
            <Link key={to} to={to} className={isActive(to) ? 'active' : ''} onClick={() => setOpen(false)}>
              <NavIcon name={icon} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="app-nav-bottom">
          <Link to="/guardado" className={isActive('/guardado') ? 'active' : ''} onClick={() => setOpen(false)}>
            <NavIcon name="bookmark" />
            Guardado
          </Link>
          <Link to="/" onClick={() => setOpen(false)}>
            <NavIcon name="globe" />
            Ver sitio público
          </Link>
          <Link to="/login" onClick={() => setOpen(false)}>
            <NavIcon name="logout" />
            Cerrar sesión
          </Link>
        </div>
      </aside>

      {open && <div className="app-sidebar-backdrop" onClick={() => setOpen(false)} />}
    </>
  )
}
