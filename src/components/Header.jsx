import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/iconotipo-azul.png'
import { useAuth } from '../context/AuthContext.jsx'

// El logo ya lleva a Inicio, así que no se repite aquí — son 5 enlaces
// en vez de 6, y los 3 "primary" (contenido en vivo) quedan visualmente
// más pesados que Cómo funciona/Nosotros (info institucional), en vez de
// competir los 5 al mismo nivel.
const NAV_LINKS = [
  { to: '/iniciativas', label: 'Explorar', primary: true },
  { to: '/recursos', label: 'Recursos', primary: true },
  { to: '/eventos', label: 'Eventos', primary: true },
  { to: '/como-funciona', label: 'Cómo funciona', secondary: true },
  { to: '/nosotros', label: 'Nosotros', secondary: true },
]

export default function Header() {
  const location = useLocation()
  const { user } = useAuth()
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
          {NAV_LINKS.map(({ to, label, primary, secondary }) => (
            <Link
              key={to}
              to={to}
              className={[isActive(to) ? 'active' : '', primary ? 'primary' : '', secondary ? 'secondary' : ''].filter(Boolean).join(' ')}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="navcta">
          {user ? (
            <Link to="/app/dashboard" className="btn btn-primary">Ir a mi panel →</Link>
          ) : (
            <>
              <Link to="/login" className="link-quiet">Ingresar</Link>
              <Link to="/register" className="btn btn-primary">Registrarse</Link>
            </>
          )}
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
            {user ? (
              <Link to="/app/dashboard" className="btn btn-primary">Ir a mi panel →</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Ingresar</Link>
                <Link to="/register" className="btn btn-primary">Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
