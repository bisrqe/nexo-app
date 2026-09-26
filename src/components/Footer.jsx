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
          <p>Este mapa cambia cada semana. Si tu iniciativa no está todavía, ese es el primer problema que puedes resolver aquí.</p>
        </div>
        <div className="foot-col">
          <h4>Plataforma</h4>
          <Link to="/app/recursos">Recursos</Link>
          <Link to="/iniciativas">Iniciativas</Link>
        </div>
        <div className="foot-col">
          <h4>Comunidad</h4>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/eventos">Eventos</Link>
        </div>
        <div className="foot-col">
          <h4>Cuenta</h4>
          <Link to="/login">Ingresar</Link>
          <Link to="/register">Registrarse</Link>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© {new Date().getFullYear()} NEXO — hecho en México.</span>
        <span>join.nexo.mx@gmail.com</span>
      </div>
    </footer>
  )
}
