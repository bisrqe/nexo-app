import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InitiativeCard from './InitiativeCard.jsx'
import { INITIATIVES, ODS_FILTERS, INDUSTRY_FILTERS } from '../data/initiatives.js'

// Shared by the public /iniciativas page and the one inside the app
// (/app/iniciativas) — same filtering logic, so it can't drift between
// the two. The public page hides the save button (view-only, no cuenta);
// ambas filtran por industria.
export default function InitiativeCatalog({
  initiatives = INITIATIVES,
  basePath = '/iniciativas',
  filterBy = 'industry',
  allowSave = true,
}) {
  const filterSet = filterBy === 'industry' ? INDUSTRY_FILTERS : ODS_FILTERS
  const [activeFilter, setActiveFilter] = useState('todos')

  const filtered = useMemo(() => {
    return initiatives.filter((i) => {
      return (
        activeFilter === 'todos' ||
        (filterBy === 'industry' ? i.industry === activeFilter : i.ods.includes(activeFilter))
      )
    })
  }, [initiatives, activeFilter, filterBy])

  return (
    <>
      <div className="filters">
        <button className={`chip ${activeFilter === 'todos' ? 'active' : ''}`} onClick={() => setActiveFilter('todos')}>
          Todos
        </button>
        {filterSet.filter((f) => f.id !== 'todos').map((f) => (
          <button
            key={f.id}
            className={`chip ${activeFilter === f.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(activeFilter === f.id ? 'todos' : f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="catalog-grid">
          {filtered.map((i) => (
            <InitiativeCard key={i.id} initiative={i} basePath={basePath} allowSave={allowSave} tagMode={filterBy} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Todavía no hay emprendimientos registrados con ese filtro.</p>
          <Link to={`${basePath}/nueva`} className="link-arrow">Sé el primero en registrarlo →</Link>
        </div>
      )}
    </>
  )
}
