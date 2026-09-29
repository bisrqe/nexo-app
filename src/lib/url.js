// Autocompleta el esquema de una liga que alguien escriba sin "https://"
// (ej. "www.ejemplo.com") para que el campo no dependa de que lo tecleen
// bien — se aplica al perder el foco del input, nunca mientras escriben.
export function normalizeUrl(value) {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
