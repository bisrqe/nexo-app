import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function NotFound() {
  return (
    <>
      <Header />
      <section className="auth-section">
        <div className="auth-card">
          <span className="kicker">Error 404</span>
          <h1 className="auth-title">Esta página no está en el mapa</h1>
          <p className="auth-sub">Revisa la liga o vuelve al inicio.</p>
          <Link to="/" className="btn btn-primary">Volver al inicio</Link>
        </div>
      </section>
      <Footer />
    </>
  )
}
