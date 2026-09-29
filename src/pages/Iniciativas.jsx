import React, { useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCatalog from '../components/InitiativeCatalog.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { getCityName } from '../data/cities.js'
import { sortByOwnProjectType } from '../lib/initiativeKind.js'

export default function Iniciativas() {
  const { profile } = useProfile()
  const [allInitiatives] = useFirestoreCollection('initiatives')
  const [showAllCities, setShowAllCities] = useState(false)

  const visible = useMemo(() => {
    const inCity = allInitiatives.filter((i) => showAllCities || !profile.city || !i.city || i.city === profile.city)
    return sortByOwnProjectType(inCity, profile.profileType, profile.subtype)
  }, [allInitiatives, profile.city, profile.profileType, profile.subtype, showAllCities])

  return (
    <DashboardLayout
      eyebrow="Explorar"
      title="Explorar"
      subtitle="El catálogo completo — filtra por tipo de proyecto y por industria, ODS o causa según cuál elijas."
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
      <InitiativeCatalog initiatives={visible} basePath="/app/iniciativas" />
    </DashboardLayout>
  )
}
