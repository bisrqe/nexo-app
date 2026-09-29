import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InitiativeCard from './InitiativeCard.jsx'
import { ODS_FILTERS, INDUSTRY_FILTERS, CAUSE_FILTERS } from '../data/initiatives.js'
import { PROJECT_TYPE_FILTERS, projectTypeFor } from '../lib/initiativeKind.js'

// Cada tipo de proyecto busca por su propia categoría: emprendimientos
// por industria, iniciativas por ODS, instituciones por causa. Por eso el
// segundo filtro (categoría) solo aparece una vez elegido un tipo — "Todos"
// mezcla los tres catálogos y no hay una sola categoría que los describa.
const CATEGORY_BY_PROJECT_TYPE = {
  emprendimientos: { key: 'industry', set: INDUSTRY_FILTERS },
  iniciativas: { key: 'ods', set: ODS_FILTERS },
  instituciones: { key: 'cause', set: CAUSE_FILTERS },
}

const EMPTY_STATE_NOUN = {
  todos: 'emprendimientos, iniciativas o instituciones',
  emprendimientos: 'emprendimientos',
  iniciativas: 'iniciativas',
  instituciones: 'instituciones',
}

// Shared by the public /iniciativas page and the one inside the app
// (/app/iniciativas) — same filtering logic, so it can't drift between
// the two. The public page hides the save button (view-only, no cuenta).
export default function InitiativeCatalog({
  initiatives = [],
  basePath = '/iniciativas',
  allowSave = true,
}) {
  const [activeType, setActiveType] = useState('todos')
  const [activeCategory, setActiveCategory] = useState('todos')
  const category = CATEGORY_BY_PROJECT_TYPE[activeType]

  const handleType = (id) => {
    setActiveType(id === activeType ? 'todos' : id)
    setActiveCategory('todos')
  }

  const filtered = useMemo(() => {
    return initiatives.filter((i) => {
      const matchesType = activeType === 'todos' || projectTypeFor(i.ownerProfileType, i.ownerProfileSubtype) === activeType
      if (!matchesType) return false
      if (!category || activeCategory === 'todos') return true
      return category.key === 'ods' ? (i.ods || []).includes(activeCategory) : i[category.key] === activeCategory
    })
  }, [initiatives, activeType, activeCategory, category])

  return (
    <>
      <div className="filters" style={{ marginBottom: 14 }}>
        {PROJECT_TYPE_FILTERS.map((f) => (
          <button
            key={f.id}
            className={`chip ${activeType === f.id ? 'active' : ''}`}
            onClick={() => handleType(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {category && (
        <div className="filters">
          <button className={`chip ${activeCategory === 'todos' ? 'active' : ''}`} onClick={() => setActiveCategory('todos')}>
            Todos
          </button>
          {category.set.filter((f) => f.id !== 'todos').map((f) => (
            <button
              key={f.id}
              className={`chip ${activeCategory === f.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === f.id ? 'todos' : f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="catalog-grid">
          {filtered.map((i) => (
            <InitiativeCard key={i.docId || i.id} initiative={i} basePath={basePath} allowSave={allowSave} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Todavía no hay {EMPTY_STATE_NOUN[activeType]} registrados con ese filtro.</p>
          <Link to={`${basePath}/nueva`} className="link-arrow">Sé el primero en registrarlo →</Link>
        </div>
      )}
    </>
  )
}
