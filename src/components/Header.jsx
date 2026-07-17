import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import NodeMark from './NodeMark.jsx'

const NAV_LINKS = [
  { id: 'hero', label: 'Inicio' },
  { id: 'iniciativas', label: 'Iniciativas' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'identidad', label: 'Nosotros' },
  { id: 'eventos', label: 'Eventos' },
]

// Highlights the nav link for whichever <section id="..."> is currently
// in view. Only finds anything on the Home page — on other pages the
// selectors just don't match, which is fine.
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [ids])

  return active
}

export default function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const active = useActiveSection(NAV_LINKS.map((l) => l.id))
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // close the mobile menu on route change
  useEffect(() => setMenuOpen(false), [location])

  return (
    <header>
      <nav>
        <Link to="/" className="brand">
          <NodeMark />
          NEXO.
        </Link>

        <div className="navlinks">
          {NAV_LINKS.map(({ id, label }) => (
            <Link
              key={id}
              to={`/#${id}`}
              className={isHome && active === id ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="navcta">
          <Link to="/login" className="btn btn-ghost">Ingresar</Link>
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
          {NAV_LINKS.map(({ id, label }) => (
            <Link key={id} to={`/#${id}`} onClick={() => setMenuOpen(false)}>
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
