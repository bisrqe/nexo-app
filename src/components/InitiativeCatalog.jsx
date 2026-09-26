import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InitiativeCard from './InitiativeCard.jsx'
import { INITIATIVES, ODS_FILTERS, NEED_FILTERS, INDUSTRY_FILTERS } from '../data/initiatives.js'

// Shared by the public /iniciativas page and the one inside the app
// (/app/iniciativas) — same filtering logic, so it can't drift between
// the two. The public page filters by industry and hides the need chips
// and the save button (view-only, no account); the app page keeps the
// original ODS + need-tag filtering with saving enabled.
export default function InitiativeCatalog({
  initiatives = INITIATIVES,
  basePath = '/iniciativas',
  filterBy = 'ods',
  showNeedFilters = true,
  allowSave = true,
}) {
  const filterSet = filterBy === 'industry' ? INDUSTRY_FILTERS : ODS_FILTERS
  const [activeFilter, setActiveFilter] = useState('todos')
  const [needFilter, setNeedFilter] = useState(null)

  const filtered = useMemo(() => {
    return initiatives.filter((i) => {
      const matchesFilter =
        activeFilter === 'todos' ||
        (filterBy === 'industry' ? i.industry === activeFilter : i.ods.includes(activeFilter))
      const matchesNeed = !showNeedFilters || !needFilter || i.needTag === needFilter
      return matchesFilter && matchesNeed
    })
  }, [initiatives, activeFilter, needFilter, filterBy, showNeedFilters])

  const toggleNeed = (id) => setNeedFilter((prev) => (prev === id ? null : id))

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
        {showNeedFilters && NEED_FILTERS.map((f) => (
          <button key={f.id} className={`chip ${needFilter === f.id ? 'active' : ''}`} onClick={() => toggleNeed(f.id)}>
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
          <p>Todavía no hay iniciativas registradas con ese filtro.</p>
          <Link to={`${basePath}/nueva`} className="link-arrow">Sé la primera en registrarla →</Link>
        </div>
      )}
    </>
  )
}
