import React from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCatalog from '../components/InitiativeCatalog.jsx'

export default function Iniciativas() {
  return (
    <DashboardLayout
      eyebrow="Explorar"
      title="Todas las iniciativas"
      subtitle="El catálogo completo — filtra por ODS o por lo que cada una necesita ahora mismo."
    >
      <InitiativeCatalog basePath="/app/iniciativas" />
    </DashboardLayout>
  )
}
