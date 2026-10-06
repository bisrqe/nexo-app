import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { REGIONS, REMOTE_FILTER_ID, getRegionName } from '../data/cities.js'

// Filtro por región — el mismo en Explorar, Personas, Eventos y el
// dashboard, para que se vea y se comporte igual en todos lados. El valor
// vive en la URL (?region=) en vez de solo en estado: refrescar o compartir
// el link no regresa el filtro a "mi región" sin avisar.
//   ''/'todas' → sin filtro · id de región → solo esa región · 'remoto' →
//   solo lo que opera de forma remota o en línea.
export function useRegionFilter(myRegion) {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = searchParams.get('region') || myRegion || 'todas'
  const setValue = (next) => setSearchParams((prev) => {
    const params = new URLSearchParams(prev)
    params.set('region', next)
    return params
  })
  return [value, setValue]
}

export default function RegionFilter({ value, onChange, myRegion, includeRemote = true }) {
  const isOther = value !== 'todas' && value !== myRegion
  const otherOptions = REGIONS.filter((r) => r.id !== myRegion)

  return (
    <div className="filters">
      {myRegion && (
        <button className={`chip ${value === myRegion ? 'active' : ''}`} onClick={() => onChange(myRegion)}>
          {getRegionName(myRegion)} (la tuya)
        </button>
      )}
      <button className={`chip ${value === 'todas' ? 'active' : ''}`} onClick={() => onChange('todas')}>
        Todas las regiones
      </button>
      <select
        className={`chip-select ${isOther ? 'active' : ''}`}
        value={isOther ? value : ''}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        aria-label="Filtrar por otra región"
      >
        <option value="">Otra región…</option>
        {otherOptions.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
        {includeRemote && <option value={REMOTE_FILTER_ID}>Remoto / en línea</option>}
      </select>
    </div>
  )
}
