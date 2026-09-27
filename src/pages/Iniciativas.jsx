import React, { useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCatalog from '../components/InitiativeCatalog.jsx'
import { INITIATIVES } from '../data/initiatives.js'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { getCityName } from '../data/cities.js'

export default function Iniciativas() {
  const { profile } = useProfile()
  const realInitiatives = useFirestoreCollection('initiatives')
  const [showAllCities, setShowAllCities] = useState(false)

  const allInitiatives = useMemo(() => [...INITIATIVES, ...realInitiatives], [realInitiatives])
  const visible = useMemo(
    () => allInitiatives.filter((i) => showAllCities || !profile.city || !i.city || i.city === profile.city),
    [allInitiatives, profile.city, showAllCities]
  )

  return (
    <DashboardLayout
      eyebrow="Explorar"
      title="Todos los emprendimientos"
      subtitle="El catálogo completo — filtra por industria o por lo que cada uno necesita ahora mismo."
    >
      {profile.city && (
        <div className="filters">
          <button className={`chip ${!showAllCities ? 'active' : ''}`} onClick={() => setShowAllCities(false)}>
            {getCityName(profile.city)}
          </button>
          <button className={`chip ${showAllCities ? 'active' : ''}`} onClick={() => setShowAllCities(true)}>
            Ver todas las zonas
          </button>
        </div>
      )}
      <InitiativeCatalog initiatives={visible} basePath="/app/iniciativas" filterBy="industry" />
    </DashboardLayout>
  )
}
