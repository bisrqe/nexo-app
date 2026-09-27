// Catálogo fijo de ciudades/regiones — con esto se filtran perfiles,
// iniciativas y eventos por zona. Las primeras tres son las que arrancan
// con más actividad; el resto cubre las ubicaciones que ya usan los datos
// de ejemplo (people.js, initiatives.js, events.js) para que ese contenido
// pueda mapearse a un id de ciudad real.
export const CITIES = [
  { id: 'mty', name: 'Monterrey, Nuevo León' },
  { id: 'cdmx', name: 'Ciudad de México' },
  { id: 'gdl', name: 'Guadalajara, Jalisco' },
  { id: 'oax', name: 'Oaxaca de Juárez, Oaxaca' },
  { id: 'pue', name: 'Puebla, Puebla' },
  { id: 'mid', name: 'Mérida, Yucatán' },
  { id: 'qro', name: 'Querétaro, Querétaro' },
  { id: 'remoto', name: 'Remoto' },
  { id: 'otra', name: 'Otra ciudad' },
]

export function getCityName(id) {
  return CITIES.find((c) => c.id === id)?.name ?? ''
}
