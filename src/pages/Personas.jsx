import React, { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { ODS_FILTERS, INDUSTRY_FILTERS, CAUSE_FILTERS } from '../data/initiatives.js'
import { PROFILE_TYPES } from '../data/profileOptions.js'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { CITIES, getCityName } from '../data/cities.js'

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
    location: getCityName(p.city) || p.location,
    city: p.city,
    ods: p.interests || [],
    odsLabel,
    industry: p.industry,
    cause: p.cause,
    offers,
    looking: p.lookingFor,
    bio: p.bio,
    contact: p.email,
    linkedin: p.linkedin,
    photo: p.photo,
  }
}

// Qué filtro de categoría tiene sentido mostrar según el rol elegido —
// cada tipo de perfil captura una categoría distinta (industria, causa u
// ODS), así que no tiene caso mostrar los tres desplegables si ya se sabe
// cuál aplica. Estudiante es el único caso con dos a la vez (ver
// isStudentEntrepreneur en lib/initiativeKind.js para el mismo criterio
// en emprendimientos).
const ROLE_CATEGORY_VISIBILITY = {
  emprendedor: { industry: true },
  organizacion: { cause: true },
  voluntario: { ods: true },
  estudiante: { industry: true, ods: true },
}

// Qué tanto empata una persona con el perfil de quien está buscando —
// mismo criterio que scoreForProfile en lib/recommend.js pero para
// personas en vez de emprendimientos: no filtra nada, solo ordena para
// que las coincidencias más fuertes (ciudad, industria, causa, ODS
// compartidos, mismo rol) aparezcan primero.
function scorePersonForProfile(person, profile) {
  let score = 0
  if (person.city && profile.city && person.city === profile.city) score += 2
  if (person.industry && profile.industry && person.industry === profile.industry) score += 3
  if (person.cause && profile.cause && person.cause === profile.cause) score += 3
  const sharedOds = (person.ods || []).filter((id) => (profile.interests || []).includes(id))
  score += sharedOds.length * 2
  if (person.profileType && profile.profileType && person.profileType === profile.profileType) score += 1
  return score
}

export default function Personas() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const [realProfiles] = useFirestoreCollection('profiles')
  // Filtros de ciudad/rol/categoría viven en la URL — refrescar la
  // página o mandarle el link a alguien no debe regresar todo a los
  // valores por defecto.
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const showAllCities = searchParams.get('zonas') !== 'mia'
  const specificCity = searchParams.get('ciudad') || ''
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
  const setQuery = (v) => setParam('q', v)
  const setShowAllCities = (v) => setSearchParams((prev) => {
    const next = new URLSearchParams(prev)
    if (v) next.delete('zonas')
    else next.set('zonas', 'mia')
    next.delete('ciudad')
    return next
  })
  const setSpecificCity = (v) => setParam('ciudad', v)
  const setIndustryFilter = (v) => setParam('industria', v)
  const setCauseFilter = (v) => setParam('causa', v)
  const setOdsFilter = (v) => setParam('ods', v)

  const categoryVisibility = ROLE_CATEGORY_VISIBILITY[roleFilter] || {}

  const handleRoleChange = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set('rol', value)
      else next.delete('rol')
      const visible = ROLE_CATEGORY_VISIBILITY[value] || {}
      if (!visible.industry) next.delete('industria')
      if (!visible.cause) next.delete('causa')
      if (!visible.ods) next.delete('ods')
      return next
    })
  }

  const allPeople = useMemo(() => {
    return realProfiles
      .filter((p) => p.docId !== user?.uid && p.name)
      .map(profileToPerson)
  }, [realProfiles, user])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = allPeople.filter((p) => {
      const matchesCity = !showAllCities
        ? p.city === profile.city
        : (!specificCity || p.city === specificCity)
      if (!matchesCity) return false
      if (roleFilter && p.profileType !== roleFilter) return false
      if (categoryVisibility.industry && industryFilter && p.industry !== industryFilter) return false
      if (categoryVisibility.cause && causeFilter && p.cause !== causeFilter) return false
      if (categoryVisibility.ods && odsFilter && !p.ods?.includes(odsFilter)) return false
      if (!q) return true
      return [p.name, p.role, p.odsLabel, ...(p.offers || []), p.looking].join(' ').toLowerCase().includes(q)
    })
    // Sin ningún filtro activo, aparece todo el directorio — solo se
    // reordena para que quien más empata con tu propio perfil quede
    // hasta arriba, en vez de recortar la lista.
    return [...list].sort((a, b) => scorePersonForProfile(b, profile) - scorePersonForProfile(a, profile))
  }, [allPeople, query, profile, showAllCities, specificCity, roleFilter, industryFilter, causeFilter, odsFilter, categoryVisibility])

  return (
    <DashboardLayout
      eyebrow="Directorio"
      title="Personas"
      subtitle="Quién sabe hacer qué, y qué está buscando — sin currículums de relleno."
    >
      {profile.city && (
        <div className="filters">
          <button
            className={`chip ${!showAllCities ? 'active' : ''}`}
            onClick={() => { setShowAllCities(false); setSpecificCity('') }}
          >
            {getCityName(profile.city)}
          </button>
          <button
            className={`chip ${showAllCities ? 'active' : ''}`}
            onClick={() => setShowAllCities(true)}
          >
            Ver todas las zonas
          </button>
          {showAllCities && (
            <select
              className="chip-select"
              value={specificCity}
              onChange={(e) => setSpecificCity(e.target.value)}
            >
              <option value="">Otras ciudades…</option>
              {CITIES.filter((c) => c.id !== profile.city).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="filters">
        <select className="chip-select" value={roleFilter} onChange={(e) => handleRoleChange(e.target.value)}>
          <option value="">Todos los roles</option>
          {PROFILE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>

        {categoryVisibility.industry && (
          <select className="chip-select" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
            <option value="">Industria</option>
            {INDUSTRY_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        )}

        {categoryVisibility.cause && (
          <select className="chip-select" value={causeFilter} onChange={(e) => setCauseFilter(e.target.value)}>
            <option value="">Causa</option>
            {CAUSE_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        )}

        {categoryVisibility.ods && (
          <select className="chip-select" value={odsFilter} onChange={(e) => setOdsFilter(e.target.value)}>
            <option value="">ODS</option>
            {ODS_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        )}
      </div>

      <div className="filters">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar por nombre, habilidad u ODS..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No encontramos a nadie con ese criterio todavía.</p>
        </div>
      ) : (
        <div className="page-grid">
          {filtered.map((p) => (
            <div className="person-card" key={p.slug}>
              <div className="person-avatar">
                {p.photo ? <img src={p.photo} alt="" /> : initials(p.name)}
              </div>
              <div className="person-name">{p.name}</div>
              <div className="person-role">{p.role} — {p.location}</div>
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
