import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/iconotipo-azul.png'

export default function Footer() {
  return (
    <footer>
      <div className="foot-grid">
        <div className="foot-brand">
          <Link to="/" className="brand">
            <img src={logo} alt="" width="24" height="24" />
            NEXO.
          </Link>
          <p>Este mapa cambia cada semana. Si tu emprendimiento no está todavía, ese es el primer problema que puedes resolver aquí.</p>
        </div>
        <div className="foot-col">
          <h3 className="foot-heading">Plataforma</h3>
          <Link to="/recursos">Recursos</Link>
          <Link to="/iniciativas">Emprendimientos</Link>
        </div>
        <div className="foot-col">
          <h3 className="foot-heading">Comunidad</h3>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/eventos">Eventos</Link>
        </div>
        <div className="foot-col">
          <h3 className="foot-heading">Cuenta</h3>
          <Link to="/login">Ingresar</Link>
          <Link to="/register">Registrarse</Link>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© {new Date().getFullYear()} NEXO, hecho en México.</span>
        <span>support@nexohub.mx</span>
      </div>
    </footer>
  )
}
