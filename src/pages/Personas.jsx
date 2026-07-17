import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { PEOPLE } from '../data/people.js'

function initials(name) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export default function Personas() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PEOPLE
    return PEOPLE.filter((p) =>
      [p.name, p.role, p.odsLabel, ...p.offers, p.looking].join(' ').toLowerCase().includes(q)
    )
  }, [query])

  return (
    <DashboardLayout
      eyebrow="Directorio"
      title="Personas"
      subtitle="Quién sabe hacer qué, y qué está buscando — sin currículums de relleno."
    >
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
            <div className="person-card" key={p.id}>
              <div className="person-avatar">{initials(p.name)}</div>
              <div className="person-name">{p.name}</div>
              <div className="person-role">{p.role} — {p.location}</div>
              <div className="cat-tags"><span>{p.odsLabel}</span></div>
              <div className="person-offers">
                {p.offers.map((o) => (
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
