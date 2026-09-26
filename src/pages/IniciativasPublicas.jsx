import React from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import InitiativeCatalog from '../components/InitiativeCatalog.jsx'

export default function IniciativasPublicas() {
  return (
    <>
      <Header />

      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Explorar</span>
            <h2>Iniciativas, no publicaciones</h2>
            <p className="head-desc-below">Filtra por industria o por lo que la iniciativa necesita ahora mismo.</p>
          </div>
        </div>

        <InitiativeCatalog filterBy="industry" showNeedFilters={false} allowSave={false} />
      </section>

      <Footer />
    </>
  )
}
