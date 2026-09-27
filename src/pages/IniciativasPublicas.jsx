import React, { useMemo } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import InitiativeCatalog from '../components/InitiativeCatalog.jsx'
import { INITIATIVES } from '../data/initiatives.js'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'

export default function IniciativasPublicas() {
  const realInitiatives = useFirestoreCollection('initiatives')
  const allInitiatives = useMemo(() => [...INITIATIVES, ...realInitiatives], [realInitiatives])

  return (
    <>
      <Header />

      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Explorar</span>
            <h2>Emprendimientos, no publicaciones</h2>
            <p className="head-desc-below">Filtra por industria o por lo que el emprendimiento necesita ahora mismo.</p>
          </div>
        </div>

        <InitiativeCatalog initiatives={allInitiatives} filterBy="industry" allowSave={false} />
      </section>

      <Footer />
    </>
  )
}
