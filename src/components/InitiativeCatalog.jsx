import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InitiativeCard from './InitiativeCard.jsx'
import { INITIATIVES, ODS_FILTERS, NEED_FILTERS } from '../data/initiatives.js'

// Shared by the public landing preview and the /iniciativas page inside
// the app — same filtering logic, so it can't drift between the two.
export default function InitiativeCatalog({ initiatives = INITIATIVES, basePath = '/iniciativas' }) {
  const [odsFilter, setOdsFilter] = useState('todos')
  const [needFilter, setNeedFilter] = useState(null)

  const filtered = useMemo(() => {
    return initiatives.filter((i) => {
      const matchesOds = odsFilter === 'todos' || i.ods.includes(odsFilter)
      const matchesNeed = !needFilter || i.needTag === needFilter
      return matchesOds && matchesNeed
    })
  }, [initiatives, odsFilter, needFilter])

  const toggleNeed = (id) => setNeedFilter((prev) => (prev === id ? null : id))

  return (
    <>
      <div className="filters">
        <button className={`chip ${odsFilter === 'todos' ? 'active' : ''}`} onClick={() => setOdsFilter('todos')}>
          Todos
        </button>
        {ODS_FILTERS.filter((f) => f.id !== 'todos').map((f) => (
          <button
            key={f.id}
            className={`chip ${odsFilter === f.id ? 'active' : ''}`}
            onClick={() => setOdsFilter(odsFilter === f.id ? 'todos' : f.id)}
          >
            {f.label}
          </button>
        ))}
        {NEED_FILTERS.map((f) => (
          <button key={f.id} className={`chip ${needFilter === f.id ? 'active' : ''}`} onClick={() => toggleNeed(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="catalog-grid">
          {filtered.map((i) => (
            <InitiativeCard key={i.id} initiative={i} basePath={basePath} />
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
