import React, { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import RegionFilter, { useRegionFilter } from '../components/RegionFilter.jsx'
import { ODS_FILTERS, INDUSTRY_FILTERS, CAUSE_FILTERS } from '../data/initiatives.js'
import { PROFILE_TYPES } from '../data/profileOptions.js'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { locationLabel, profileRegion, matchesRegionFilter } from '../data/cities.js'
import { isSupportProfile } from '../data/admins.js'
import { profileRoles } from '../lib/initiativeKind.js'

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function profileToPerson(p) {
  const odsLabel = ODS_FILTERS.find((f) => f.id === p.interests?.[0])?.label ?? ''
  const offers = p.profileType === 'mentor'
    ? [p.expertise].filter(Boolean)
    : p.profileType === 'organizacion'
      ? [p.causeLabel].filter(Boolean)
      : [p.industryLabel, p.industrySecondaryLabel].filter(Boolean)
  return {
    id: p.docId,
    slug: p.username || p.docId,
    name: p.name,
    role: p.occupation,
    profileType: p.profileType,
    roles: profileRoles(p),
    location: locationLabel(p),
    region: p.region,
    cityName: p.cityName,
    city: p.city,
    ods: p.interests || [],
    odsLabel,
    industries: [p.industry, p.industrySecondary].filter(Boolean),
    cause: p.cause,
    offers,
    looking: p.lookingFor,
    bio: p.bio,
    photo: p.photo,
  }
}

// Qué tanto empata una persona con el perfil de quien está buscando —
// mismo criterio que scoreForProfile en lib/recommend.js pero para
// personas en vez de emprendimientos: no filtra nada, solo ordena para
// que las coincidencias más fuertes (región, industria, causa, ODS
// compartidos, mismo rol) aparezcan primero.
function scorePersonForProfile(person, profile) {
  let score = 0
  const myRegion = profileRegion(profile)
  if (person.region && myRegion && person.region === myRegion) score += 2
  if (profile.industry && person.industries.includes(profile.industry)) score += 3
  if (person.cause && profile.cause && person.cause === profile.cause) score += 3
  const sharedOds = (person.ods || []).filter((id) => (profile.interests || []).includes(id))
  score += sharedOds.length * 2
  if (person.profileType && profile.profileType && person.profileType === profile.profileType) score += 1
  return score
}

export default function Personas() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const myRegion = profileRegion(profile)
  const [realProfiles, profilesLoading] = useFirestoreCollection('profiles')
  // Rol/categoría/búsqueda viven en la URL (junto con la región) — refrescar
  // la página o mandarle el link a alguien no debe regresar todo a los
  // valores por defecto.
  const [searchParams, setSearchParams] = useSearchParams()
  const [regionFilter, setRegionFilter] = useRegionFilter(myRegion)
  const query = searchParams.get('q') || ''
  const roleFilter = searchParams.get('rol') || ''
  const industryFilter = searchParams.get('industria') || ''
  const causeFilter = searchParams.get('causa') || ''
  const odsFilter = searchParams.get('ods') || ''

  const setParam = (key, value) => setSearchParams((prev) => {
    const next = new URLSearchParams(prev)
    if (value) next.set(key, value)
    else next.delete(key)
    return next
  })
  const clearFilters = (region) => setSearchParams((prev) => {
    const next = new URLSearchParams()
    const keep = region || prev.get('region')
    if (keep) next.set('region', keep)
    return next
  })
  const hasActiveFilters = Boolean(query || roleFilter || industryFilter || causeFilter || odsFilter)

  const allPeople = useMemo(() => {
    return realProfiles
      .filter((p) => p.docId !== user?.uid && p.name && !isSupportProfile(p))
      .map(profileToPerson)
  }, [realProfiles, user])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = allPeople.filter((p) => {
      if (!matchesRegionFilter(p, regionFilter)) return false
      // Un estudiante con segundo perfil de voluntario también aparece al
      // filtrar por "Voluntario/a" (ver profileRoles).
      if (roleFilter && !p.roles.includes(roleFilter)) return false
      // Industria cuenta tanto la principal como la segunda industria.
      if (industryFilter && !p.industries.includes(industryFilter)) return false
      if (causeFilter && p.cause !== causeFilter) return false
      if (odsFilter && !p.ods.includes(odsFilter)) return false
      if (!q) return true
      return [p.name, p.role, p.location, p.odsLabel, ...(p.offers || []), p.looking, p.bio].join(' ').toLowerCase().includes(q)
    })
    // Sin ningún filtro activo, aparece todo el directorio — solo se
    // reordena para que quien más empata con tu propio perfil quede
    // hasta arriba, en vez de recortar la lista.
    return [...list].sort((a, b) => scorePersonForProfile(b, profile) - scorePersonForProfile(a, profile))
  }, [allPeople, query, profile, regionFilter, roleFilter, industryFilter, causeFilter, odsFilter])

  return (
    <DashboardLayout
      eyebrow="Directorio"
      title="Personas"
      subtitle="Quién sabe hacer qué, y qué está buscando — sin currículums de relleno."
    >
      <RegionFilter value={regionFilter} onChange={setRegionFilter} myRegion={myRegion} includeRemote={false} />

      <div className="filters">
        <select className="chip-select" value={roleFilter} onChange={(e) => setParam('rol', e.target.value)} aria-label="Filtrar por rol">
          <option value="">Todos los roles</option>
          {PROFILE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>

        <select className="chip-select" value={industryFilter} onChange={(e) => setParam('industria', e.target.value)} aria-label="Filtrar por industria">
          <option value="">Toda industria</option>
          {INDUSTRY_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>

        <select className="chip-select" value={causeFilter} onChange={(e) => setParam('causa', e.target.value)} aria-label="Filtrar por causa">
          <option value="">Toda causa</option>
          {CAUSE_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>

        <select className="chip-select" value={odsFilter} onChange={(e) => setParam('ods', e.target.value)} aria-label="Filtrar por ODS">
          <option value="">Todo ODS</option>
          {ODS_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </div>

      <div className="filters">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar por nombre, habilidad, ciudad u ODS..."
          value={query}
          onChange={(e) => setParam('q', e.target.value)}
        />
        {hasActiveFilters && (
          <button type="button" className="btn btn-ghost" onClick={() => clearFilters()}>Limpiar filtros</button>
        )}
        {!profilesLoading && (
          <span className="filter-count">{filtered.length} {filtered.length === 1 ? 'persona' : 'personas'}</span>
        )}
      </div>

      {profilesLoading ? (
        <p className="auth-sub">Cargando…</p>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No encontramos a nadie con ese criterio todavía.</p>
          {(hasActiveFilters || regionFilter !== 'todas') && (
            <button type="button" className="link-arrow" onClick={() => clearFilters('todas')}>
              Ver todo el directorio →
            </button>
          )}
        </div>
      ) : (
        <div className="page-grid">
          {filtered.map((p) => (
            <div className="person-card" key={p.slug}>
              <div className="person-avatar">
                {p.photo ? <img src={p.photo} alt="" /> : initials(p.name)}
              </div>
              <div className="person-name">{p.name}</div>
              <div className="person-role">{p.role}{p.role && p.location ? ' — ' : ''}{p.location}</div>
              {p.odsLabel && <div className="cat-tags"><span>{p.odsLabel}</span></div>}
              <div className="person-offers">
                {(p.offers || []).map((o) => (
                  <span className="tag-pill" key={o}>{o}</span>
                ))}
              </div>
              <p className="person-looking"><b>Busca:</b> {p.looking}</p>
              <Link to={`/app/personas/${p.slug}`} className="btn btn-ghost" style={{ justifyContent: 'center', marginTop: '4px' }}>
                Ver perfil →
              </Link>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
