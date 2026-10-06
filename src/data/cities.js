// Ubicación en Nexo = REGIÓN (catálogo fijo, para filtrar) + CIUDAD ESCRITA
// por la persona (texto libre, para mostrar). Se dividió así en vez de un
// catálogo de ciudades porque el país es muy grande y una lista cerrada
// dejaba fuera a casi todo el mundo, mientras que filtrar por región sí
// agrupa lo que realmente queda "cerca" para fines de recomendación.
export const REGIONS = [
  { id: 'norte', name: 'Región Norte', states: ['Baja California', 'Baja California Sur', 'Sonora', 'Chihuahua', 'Coahuila', 'Nuevo León', 'Tamaulipas', 'Sinaloa', 'Durango'] },
  { id: 'occidente', name: 'Región Occidente y Bajío', states: ['Jalisco', 'Nayarit', 'Colima', 'Michoacán', 'Guanajuato', 'Querétaro', 'Aguascalientes', 'Zacatecas', 'San Luis Potosí'] },
  { id: 'centro', name: 'Región Centro', states: ['Ciudad de México', 'Estado de México', 'Puebla', 'Morelos', 'Hidalgo', 'Tlaxcala'] },
  { id: 'sur', name: 'Región Sur', states: ['Guerrero', 'Oaxaca', 'Chiapas', 'Veracruz'] },
  { id: 'sureste', name: 'Región Sureste', states: ['Yucatán', 'Quintana Roo', 'Campeche', 'Tabasco'] },
]

export function statesOfRegion(id) {
  return REGIONS.find((r) => r.id === id)?.states ?? []
}

export const REMOTE_FILTER_ID = 'remoto'

export function getRegionName(id) {
  return REGIONS.find((r) => r.id === id)?.name ?? ''
}

// ── Compatibilidad con datos viejos ──────────────────────────────────────
// Antes la ubicación era un id de ciudad de un catálogo cerrado. Eventos,
// recursos y cuentas ya guardados todavía usan esos ids — se siguen leyendo
// para no perderlos, y se mapean a su región.
export const CITIES = [
  { id: 'mty', name: 'Monterrey, Nuevo León', region: 'norte' },
  { id: 'cdmx', name: 'Ciudad de México', region: 'centro' },
  { id: 'gdl', name: 'Guadalajara, Jalisco', region: 'occidente' },
  { id: 'oax', name: 'Oaxaca de Juárez, Oaxaca', region: 'sur' },
  { id: 'pue', name: 'Puebla, Puebla', region: 'centro' },
  { id: 'mid', name: 'Mérida, Yucatán', region: 'sureste' },
  { id: 'qro', name: 'Querétaro, Querétaro', region: 'occidente' },
  { id: 'remoto', name: 'Remoto', region: '' },
  { id: 'otra', name: 'Otra ciudad', region: '' },
]

export function getCityName(id) {
  return CITIES.find((c) => c.id === id)?.name ?? ''
}

export function regionOfLegacyCity(id) {
  return CITIES.find((c) => c.id === id)?.region ?? ''
}

function normalizeText(text) {
  return (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

// Los recursos capturados a mano siguen organizados por ciudad (mty, cdmx,
// gdl…) — esto traduce la ciudad que alguien escribió a una de esas zonas,
// si coincide con alguna. Devuelve '' si no hay una zona de recursos para
// esa ciudad (la persona igual ve los de alcance nacional).
const ZONE_KEYWORDS = {
  mty: ['monterrey', 'san pedro garza', 'san nicolas de los garza', 'apodaca', 'escobedo', 'santa catarina', 'guadalupe, nuevo leon', 'nuevo leon'],
  cdmx: ['ciudad de mexico', 'cdmx', 'mexico city', 'distrito federal'],
  gdl: ['guadalajara', 'zapopan', 'tlaquepaque', 'tonala', 'tlajomulco', 'jalisco'],
  oax: ['oaxaca'],
  pue: ['puebla'],
  mid: ['merida', 'yucatan'],
  qro: ['queretaro'],
}

export function resourceZoneFor(entity) {
  if (!entity) return ''
  if (entity.city && ZONE_KEYWORDS[entity.city]) return entity.city
  const text = normalizeText(entity.cityName || entity.location)
  if (!text) return ''
  return Object.keys(ZONE_KEYWORDS).find((id) => ZONE_KEYWORDS[id].some((k) => text.includes(k))) || ''
}

// ── Lectura uniforme de ubicación (perfil, emprendimiento, evento) ───────
// Un proyecto puede tener varias sedes (sedes: [{ region, cityName }]) y/o
// operar de forma remota (remote). Un perfil o evento tiene una sola
// (region + cityName). Estas funciones leen cualquiera de las formas — y el
// formato viejo basado en ids de ciudad — para que el resto del código no
// tenga que distinguir.
export function regionsOf(item) {
  if (!item) return []
  if (Array.isArray(item.regions) && item.regions.length > 0) return item.regions
  if (Array.isArray(item.sedes) && item.sedes.length > 0) {
    return [...new Set(item.sedes.map((s) => s.region).filter(Boolean))]
  }
  if (item.region) return [item.region]
  const legacy = regionOfLegacyCity(item.city)
  return legacy ? [legacy] : []
}

export function isRemoteItem(item) {
  if (!item) return false
  return Boolean(item.remote) || item.city === 'remoto' || item.locationType === 'virtual'
}

export function sedesOf(item) {
  if (!item) return []
  if (Array.isArray(item.sedes) && item.sedes.length > 0) return item.sedes
  if (item.region || item.cityName) return [{ region: item.region || '', state: item.state || '', cityName: item.cityName || '' }]
  if (item.city && item.city !== 'remoto' && item.city !== 'otra') {
    return [{ region: regionOfLegacyCity(item.city), cityName: getCityName(item.city) }]
  }
  return []
}

function sedeLabel(sede) {
  const place = [sede.cityName, sede.state].filter(Boolean).join(', ')
  const regionName = getRegionName(sede.region)
  if (place && regionName) return `${place} · ${regionName}`
  return place || regionName
}

export function locationLabel(item) {
  const parts = sedesOf(item).map(sedeLabel).filter(Boolean)
  if (isRemoteItem(item)) parts.push('Remoto')
  if (parts.length === 0) return item?.location || ''
  return parts.join(' · ')
}

// Misma regla para todos los filtros por región. Un elemento sin ninguna
// ubicación conocida no se excluye (viene de datos viejos o incompletos) —
// mejor mostrarlo que esconderlo sin querer.
export function matchesRegionFilter(item, filter) {
  if (!filter || filter === 'todas') return true
  if (filter === REMOTE_FILTER_ID) return isRemoteItem(item)
  const regions = regionsOf(item)
  return regions.length === 0 || regions.includes(filter)
}

// Región "propia" de una cuenta (perfil), con el mismo respaldo al formato
// viejo.
export function profileRegion(profile) {
  return regionsOf(profile)[0] || ''
}
