import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

export default function Personas() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const [realProfiles] = useFirestoreCollection('profiles')
  const [query, setQuery] = useState('')
  const [showAllCities, setShowAllCities] = useState(false)
  const [specificCity, setSpecificCity] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const allPeople = useMemo(() => {
    return realProfiles
      .filter((p) => p.docId !== user?.uid && p.name)
      .map(profileToPerson)
  }, [realProfiles, user])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allPeople.filter((p) => {
      const matchesCity = specificCity
        ? p.city === specificCity
        : showAllCities || !profile.city || !p.city || p.city === profile.city
      if (!matchesCity) return false
      if (roleFilter && p.profileType !== roleFilter) return false
      if (categoryFilter) {
        const matchesCategory = p.ods?.includes(categoryFilter) || p.industry === categoryFilter || p.cause === categoryFilter
        if (!matchesCategory) return false
      }
      if (!q) return true
      return [p.name, p.role, p.odsLabel, ...(p.offers || []), p.looking].join(' ').toLowerCase().includes(q)
    })
  }, [allPeople, query, profile.city, showAllCities, specificCity, roleFilter, categoryFilter])

  return (
    <DashboardLayout
      eyebrow="Directorio"
      title="Personas"
      subtitle="Quién sabe hacer qué, y qué está buscando — sin currículums de relleno."
    >
      <div className="filters">
        {profile.city && (
          <>
            <button
              className={`chip ${!showAllCities && !specificCity ? 'active' : ''}`}
              onClick={() => { setShowAllCities(false); setSpecificCity('') }}
            >
              {getCityName(profile.city)}
            </button>
            <button
              className={`chip ${showAllCities && !specificCity ? 'active' : ''}`}
              onClick={() => { setShowAllCities(true); setSpecificCity('') }}
            >
              Ver todas las zonas
            </button>
          </>
        )}
        <select
          className="chip-select"
          value={specificCity}
          onChange={(e) => setSpecificCity(e.target.value)}
        >
          <option value="">Otra ciudad…</option>
          {CITIES.filter((c) => c.id !== profile.city).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select className="chip-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          {PROFILE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>

        <select className="chip-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Industria / causa / ODS</option>
          <optgroup label="Industria">
            {INDUSTRY_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </optgroup>
          <optgroup label="Causa">
            {CAUSE_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </optgroup>
          <optgroup label="ODS">
            {ODS_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </optgroup>
        </select>
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
