import { normalizeUrl } from './url.js'

// Eventos viejos solo tienen "location" como texto libre (a veces ya era
// una liga de videollamada, con o sin "https://"). Los nuevos guardan
// locationType/callUrl/mapsUrl explícitos — estas funciones leen ambos
// formatos para no romper lo ya guardado.
const CALL_DOMAIN = /^(https?:)?\/\/|zoom\.us|meet\.google\.|teams\.microsoft\.|webex\.com|whereby\.com/i

export function isVirtualEvent(event) {
  if (event.locationType) return event.locationType === 'virtual'
  return Boolean(event.callUrl) || CALL_DOMAIN.test(event.location || '')
}

export function callLinkFor(event) {
  if (event.callUrl) return event.callUrl
  if (CALL_DOMAIN.test(event.location || '')) return normalizeUrl(event.location)
  return ''
}
