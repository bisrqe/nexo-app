import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/iconotipo-azul.png'

const NAV_LINKS = [
  { to: '/', label: 'Inicio', primary: true },
  { to: '/iniciativas', label: 'Emprendimientos', primary: true },
  { to: '/como-funciona', label: 'Cómo funciona' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/eventos', label: 'Eventos', primary: true },
]

export default function Header() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // close the mobile menu on route change
  useEffect(() => setMenuOpen(false), [location])

  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to))

  return (
    <header>
      <nav>
        <Link to="/" className="brand">
          <img src={logo} alt="" width="24" height="24" />
          NEXO.
        </Link>

        <div className="navlinks">
          {NAV_LINKS.map(({ to, label, primary }) => (
            <Link key={to} to={to} className={[isActive(to) ? 'active' : '', primary ? 'primary' : ''].filter(Boolean).join(' ')}>
              {label}
            </Link>
          ))}
        </div>

        <div className="navcta">
          <Link to="/login" className="link-quiet">Ingresar</Link>
          <Link to="/register" className="btn btn-primary">Registrarse</Link>
        </div>

        <button
          className="menu-toggle"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" ref={menuRef}>
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
          <div className="mobile-menu-cta">
            <Link to="/login" className="btn btn-ghost">Ingresar</Link>
            <Link to="/register" className="btn btn-primary">Registrarse</Link>
          </div>
        </div>
      )}
    </header>
  )
}
