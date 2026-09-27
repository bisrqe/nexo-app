import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { PEOPLE } from '../data/people.js'
import { ODS_FILTERS } from '../data/initiatives.js'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getCityName } from '../data/cities.js'

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function profileToPerson(p) {
  const odsLabel = ODS_FILTERS.find((f) => f.id === p.interests?.[0])?.label ?? ''
  return {
    id: p.docId,
    slug: p.username || p.docId,
    name: p.name,
    role: p.occupation,
    location: getCityName(p.city) || p.location,
    city: p.city,
    odsLabel,
    offers: [p.industryLabel].filter(Boolean),
    looking: p.bio,
    bio: p.bio,
    contact: p.email,
    linkedin: p.linkedin,
    photo: p.photo,
  }
}

export default function Personas() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const realProfiles = useFirestoreCollection('profiles')
  const [query, setQuery] = useState('')
  const [showAllCities, setShowAllCities] = useState(false)

  const allPeople = useMemo(() => {
    const real = realProfiles
      .filter((p) => p.docId !== user?.uid && p.name)
      .map(profileToPerson)
    return [...real, ...PEOPLE]
  }, [realProfiles, user])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allPeople.filter((p) => {
      const matchesCity = showAllCities || !profile.city || !p.city || p.city === profile.city
      if (!matchesCity) return false
      if (!q) return true
      return [p.name, p.role, p.odsLabel, ...(p.offers || []), p.looking].join(' ').toLowerCase().includes(q)
    })
  }, [allPeople, query, profile.city, showAllCities])

  return (
    <DashboardLayout
      eyebrow="Directorio"
      title="Personas"
      subtitle="Quién sabe hacer qué, y qué está buscando — sin currículums de relleno."
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
