import React from 'react'
import { Link } from 'react-router-dom'
import NodeMark from './NodeMark.jsx'

export default function Footer() {
  return (
    <footer>
      <div className="foot-grid">
        <div className="foot-brand">
          <Link to="/" className="brand">
            <NodeMark />
            NEXO.
          </Link>
          <p>Este mapa cambia cada semana. Si tu iniciativa no está todavía, ese es el primer problema que puedes resolver aquí.</p>
        </div>
        <div className="foot-col">
          <h4>Plataforma</h4>
          <Link to="/#iniciativas">Iniciativas</Link>
          <Link to="/iniciativas/nueva">Nueva iniciativa</Link>
          <Link to="/#identidad">Recursos</Link>
        </div>
        <div className="foot-col">
          <h4>Comunidad</h4>
          <Link to="/#eventos">Eventos</Link>
          <Link to="/#identidad">Nosotros</Link>
          <a href="mailto:join.nexo.mx@gmail.com">Contacto</a>
        </div>
        <div className="foot-col">
          <h4>Cuenta</h4>
          <Link to="/login">Ingresar</Link>
          <Link to="/register">Registrarse</Link>
          <Link to="/app/dashboard">Ver dashboard (demo)</Link>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© {new Date().getFullYear()} NEXO — hecho en México.</span>
        <span>join.nexo.mx@gmail.com</span>
      </div>
    </footer>
  )
}
