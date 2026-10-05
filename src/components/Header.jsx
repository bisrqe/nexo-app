import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/iconotipo-azul.png'
import { useAuth } from '../context/AuthContext.jsx'

// El logo ya lleva a Inicio, así que no se repite aquí. Cómo funciona y
// Nosotros (info institucional, no contenido en vivo) van agrupados bajo
// un solo desplegable "Info" — así el nav muestra 4 opciones a la vez
// (Explorar, Recursos, Eventos, Info) en vez de competir 5 enlaces sueltos
// al mismo nivel, por encima de la guía de ≤4 por punto de decisión.
const NAV_LINKS = [
  { to: '/iniciativas', label: 'Explorar' },
  { to: '/recursos', label: 'Recursos' },
  { to: '/eventos', label: 'Eventos' },
]

const INFO_LINKS = [
  { to: '/como-funciona', label: 'Cómo funciona' },
  { to: '/nosotros', label: 'Nosotros' },
]

export default function Header() {
  const location = useLocation()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const menuRef = useRef(null)
  const infoRef = useRef(null)

  // close the mobile menu on route change
  useEffect(() => { setMenuOpen(false); setInfoOpen(false) }, [location])

  useEffect(() => {
    if (!infoOpen) return
    const onClick = (e) => { if (infoRef.current && !infoRef.current.contains(e.target)) setInfoOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [infoOpen])

  const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to))
  const infoActive = INFO_LINKS.some((l) => isActive(l.to))

  return (
    <header>
      <nav>
        <Link to="/" className="brand">
          <img src={logo} alt="" width="34" height="34" />
          NEXO.
        </Link>

        <div className="navlinks">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className={isActive(to) ? 'active' : ''}>
              {label}
            </Link>
          ))}

          <div className="nav-dropdown" ref={infoRef}>
            <button
              type="button"
              className={infoActive ? 'active' : ''}
              aria-expanded={infoOpen}
              onClick={() => setInfoOpen((v) => !v)}
            >
              Info {infoOpen ? '▴' : '▾'}
            </button>
            {infoOpen && (
              <div className="nav-dropdown-menu">
                {INFO_LINKS.map(({ to, label }) => (
                  <Link key={to} to={to} className={isActive(to) ? 'active' : ''}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
          <div className="mobile-menu-divider" />
          {INFO_LINKS.map(({ to, label }) => (
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
