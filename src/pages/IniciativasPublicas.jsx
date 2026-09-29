import React from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import InitiativeCatalog from '../components/InitiativeCatalog.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'

export default function IniciativasPublicas() {
  const [allInitiatives] = useFirestoreCollection('initiatives')

  return (
    <>
      <Header />

      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Explorar</span>
            <h2>Emprendimientos, no publicaciones</h2>
            <p className="head-desc-below">Filtra por tipo de proyecto y por industria, ODS o causa según cuál elijas.</p>
          </div>
        </div>

        <InitiativeCatalog initiatives={allInitiatives} allowSave={false} />
      </section>

      <Footer />
    </>
  )
}
