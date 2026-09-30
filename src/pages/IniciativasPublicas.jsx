import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'

export default function IniciativasPublicas() {
  const [allInitiatives] = useFirestoreCollection('initiatives')

  const featuredInitiatives = useMemo(
    () => [...allInitiatives].sort((a, b) => (b.interestedBy?.length || 0) - (a.interestedBy?.length || 0)).slice(0, 10),
    [allInitiatives]
  )

  return (
    <>
      <Header />

      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Explorar</span>
            <h2>Emprendimientos destacados</h2>
            <p className="head-desc-below">Un vistazo a lo que ya se mueve en el mapa — sin publicaciones sueltas.</p>
          </div>
        </div>

        {featuredInitiatives.length > 0 ? (
          <div className="catalog-grid">
            {featuredInitiatives.map((i) => (
              <InitiativeCard key={i.docId || i.id} initiative={i} allowSave={false} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Este mapa cambia cada semana. Sé quien registre el primer emprendimiento.</p>
          </div>
        )}
      </section>

      <section className="full">
        <div className="cta-band">
          <div>
            <h2>¿Quieres ver el dossier completo?</h2>
            <p>Ingresa o regístrate para conocer a fondo cada emprendimiento y conectar con quien lo lidera.</p>
          </div>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-gold btn-lg">Registrarse →</Link>
            <Link to="/login" className="btn btn-ghost-dark btn-lg">Ingresar</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
