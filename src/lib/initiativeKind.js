// Cómo se llama "tu emprendimiento" según el tipo de perfil de quien lo
// registró — un estudiante registra una "iniciativa", una institución una
// "institución/organización", todos los demás (emprendedor, y el caso
// genérico sin cuenta) un "emprendimiento". El esquema en Firestore es el
// mismo para los tres (colección "initiatives") — solo cambia cómo se llama.
const KIND_LABELS = {
  estudiante: {
    noun: 'iniciativa', Noun: 'Iniciativa', eyebrow: 'Iniciativas', my: 'Mi iniciativa',
    el: 'la', un: 'una', nuevo: 'Nueva',
  },
  organizacion: {
    noun: 'institución/organización', Noun: 'Institución/organización', eyebrow: 'Institución', my: 'Mi institución',
    el: 'la', un: 'una', nuevo: 'Nueva',
  },
}
const DEFAULT_KIND = {
  noun: 'emprendimiento', Noun: 'Emprendimiento', eyebrow: 'Emprendimientos', my: 'Mi emprendimiento',
  el: 'el', un: 'un', nuevo: 'Nuevo',
}

// Perfiles que no registran su propio emprendimiento/iniciativa — solo
// exploran y contactan a quien sí tiene uno.
export const PROFILE_TYPES_WITHOUT_OWN_INITIATIVE = ['mentor', 'voluntario']

export function kindFor(profileType) {
  return KIND_LABELS[profileType] || DEFAULT_KIND
}

// "Tipo de proyecto" para el filtro de Explorar — mismo criterio que
// KIND_LABELS de arriba, pero como id de catálogo en vez de texto para
// mostrar. Cualquier ownerProfileType que no sea estudiante/organizacion
// (emprendedor, o vacío en registros viejos) cae en "emprendimientos".
const PROJECT_TYPE_BY_PROFILE = {
  estudiante: 'iniciativas',
  organizacion: 'instituciones',
}

export function projectTypeFor(profileType) {
  return PROJECT_TYPE_BY_PROFILE[profileType] || 'emprendimientos'
}

export const PROJECT_TYPE_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'emprendimientos', label: 'Emprendimientos' },
  { id: 'iniciativas', label: 'Iniciativas' },
  { id: 'instituciones', label: 'Instituciones' },
]

// Ordena dejando arriba lo del mismo tipo de proyecto que quien mira el
// catálogo (estudiante ve iniciativas de otros estudiantes primero,
// emprendedor ve otros emprendimientos primero, etc.) sin ocultar el
// resto — solo reordena. Array.sort es estable, así que dentro de cada
// grupo se conserva el orden original. Mentores/voluntarios no tienen un
// tipo propio, así que no se reordena para ellos.
export function sortByOwnProjectType(list, viewerProfileType) {
  if (PROFILE_TYPES_WITHOUT_OWN_INITIATIVE.includes(viewerProfileType)) return list
  const viewerType = projectTypeFor(viewerProfileType)
  return [...list].sort((a, b) => {
    const aMatch = projectTypeFor(a.ownerProfileType) === viewerType ? 0 : 1
    const bMatch = projectTypeFor(b.ownerProfileType) === viewerType ? 0 : 1
    return aMatch - bMatch
  })
}
