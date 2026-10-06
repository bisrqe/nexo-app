import React from 'react'
import { REGIONS, statesOfRegion } from '../data/cities.js'

// Región (catálogo fijo, para filtrar y recomendar) + ciudad escrita por la
// persona (texto libre, para mostrar). Dos campos en vez de un catálogo de
// ciudades: la región agrupa lo que queda "cerca", y la ciudad escrita
// permite cualquier lugar sin quedarse fuera de una lista cerrada.
export function RegionSelect({ name = 'region', value, onChange, required = false, label = 'Región' }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select name={name} required={required} value={value} onChange={onChange}>
        <option value="">Selecciona tu región</option>
        {REGIONS.map((r) => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>
    </label>
  )
}

// Estado — solo los de la región elegida; se reinicia al cambiar de región.
export function StateSelect({ name = 'state', region, value, onChange, required = false, label = 'Estado' }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select name={name} required={required} value={value} onChange={onChange} disabled={!region}>
        <option value="">{region ? 'Selecciona el estado' : 'Primero elige la región'}</option>
        {statesOfRegion(region).map((st) => (
          <option key={st} value={st}>{st}</option>
        ))}
      </select>
    </label>
  )
}

export default function LocationFields({
  region, state, cityName, onChange, required = false,
  regionLabel = 'Región', cityLabel = 'Ciudad', cityPlaceholder = 'Escribe tu ciudad',
}) {
  // Cambiar de región borra el estado (ya no pertenecería a ella).
  const handleRegion = (e) => {
    onChange(e)
    onChange({ target: { name: 'state', value: '' } })
  }
  return (
    <>
    <div className="form-row">
      <RegionSelect value={region} onChange={handleRegion} required={required} label={regionLabel} />
      <StateSelect region={region} value={state || ''} onChange={onChange} required={required} />
    </div>
    <div className="form-row">
      <label className="form-field">
        <span>{cityLabel}</span>
        <input
          type="text"
          name="cityName"
          required={required}
          value={cityName}
          onChange={onChange}
          placeholder={cityPlaceholder}
          autoComplete="address-level2"
        />
      </label>
    </div>
    </>
  )
}
