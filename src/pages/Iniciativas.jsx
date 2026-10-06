import React, { useMemo } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCatalog from '../components/InitiativeCatalog.jsx'
import RegionFilter, { useRegionFilter } from '../components/RegionFilter.jsx'
import SkeletonCards from '../components/SkeletonCards.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { profileRegion, matchesRegionFilter } from '../data/cities.js'
import { sortByOwnProjectType } from '../lib/initiativeKind.js'

// El perfil de una cuenta "institución / organización" también es una ficha
// del catálogo — aparece en Explorar, dentro de "Instituciones", aunque esa
// cuenta no haya registrado además un dossier aparte. Se adapta a la misma
// forma que un emprendimiento para reutilizar tarjeta, filtros y orden.
function institutionProfileToCard(p) {
  return {
    docId: `perfil-${p.docId}`,
    isProfileCard: true,
    slug: p.username || p.docId,
    title: p.name,
    desc: p.orgActivity || p.bio || 'Perfil institucional.',
    need: p.lookingFor || 'Por definir',
    cause: p.cause,
    causeLabel: p.causeLabel,
    ods: p.interests || [],
    region: p.region,
    cityName: p.cityName,
    city: p.city,
    location: p.location,
    ownerUid: p.docId,
    ownerProfileType: 'organizacion',
    ownerProfileSubtype: '',
    logoUrl: p.photo || '',
  }
}

export default function Iniciativas() {
  const { profile } = useProfile()
  const myRegion = profileRegion(profile)
  const [allInitiatives, loading] = useFirestoreCollection('initiatives')
  const [orgProfiles] = useFirestoreCollection('profiles', ['profileType', '==', 'organizacion'])
  const [regionFilter, setRegionFilter] = useRegionFilter(myRegion)

  const visible = useMemo(() => {
    // Una institución que ya registró su propio dossier no se repite como
    // perfil — se queda solo el dossier, que trae más información.
    const ownersWithInstitution = new Set(
      allInitiatives.filter((i) => i.ownerProfileType === 'organizacion').map((i) => i.ownerUid)
    )
    const profileCards = orgProfiles
      .filter((p) => p.name && !ownersWithInstitution.has(p.docId))
      .map(institutionProfileToCard)

    const inRegion = [...allInitiatives, ...profileCards].filter((i) => matchesRegionFilter(i, regionFilter))
    return sortByOwnProjectType(inRegion, profile.profileType, profile.subtype)
  }, [allInitiatives, orgProfiles, regionFilter, profile.profileType, profile.subtype])

  return (
    <DashboardLayout
      eyebrow="Explorar"
      title="Catálogo completo"
      subtitle="Emprendimientos, iniciativas e instituciones — filtra por región, por tipo de proyecto y por industria, ODS o causa según cuál elijas."
    >
      <RegionFilter value={regionFilter} onChange={setRegionFilter} myRegion={myRegion} />
      {loading ? (
        <SkeletonCards />
      ) : (
        <InitiativeCatalog initiatives={visible} basePath="/app/iniciativas" />
      )}
    </DashboardLayout>
  )
}
