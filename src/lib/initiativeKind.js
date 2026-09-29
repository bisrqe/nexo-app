// Cómo se llama "tu emprendimiento" según el tipo de perfil de quien lo
// registró — un estudiante registra una "iniciativa", una institución una
// "institución/organización", todos los demás (emprendedor, y el caso
// genérico sin cuenta) un "emprendimiento". El esquema en Firestore es el
// mismo para los tres (colección "initiatives") — solo cambia cómo se llama.
//
// "myPlural" es para el sidebar y la lista de "Mis emprendimientos": una
// misma cuenta puede tener varios (ver UserContentContext), así que ese
// texto siempre está en plural aunque "my"/"un"/"nuevo" se queden en
// singular (se usan para registrar UNO a la vez).
const KIND_LABELS = {
  estudiante: {
    noun: 'iniciativa', Noun: 'Iniciativa', eyebrow: 'Iniciativas', my: 'Mi iniciativa', myPlural: 'Mis iniciativas',
    el: 'la', un: 'una', nuevo: 'Nueva',
  },
  organizacion: {
    noun: 'institución/organización', Noun: 'Institución/organización', eyebrow: 'Institución', my: 'Mi institución', myPlural: 'Mis instituciones',
    el: 'la', un: 'una', nuevo: 'Nueva',
  },
}
const DEFAULT_KIND = {
  noun: 'emprendimiento', Noun: 'Emprendimiento', eyebrow: 'Emprendimientos', my: 'Mi emprendimiento', myPlural: 'Mis emprendimientos',
  el: 'el', un: 'un', nuevo: 'Nuevo',
}

// Perfiles que no registran su propio emprendimiento/iniciativa — solo
// exploran y contactan a quien sí tiene uno.
export const PROFILE_TYPES_WITHOUT_OWN_INITIATIVE = ['mentor', 'voluntario']

// Subcategoría de perfil (ver src/data/profileOptions.js: STUDENT_SUBTYPES)
// — hoy la única existe para estudiante+emprendedor: alguien que estudia
// pero ya trae un emprendimiento propio. Para todo lo que sigue en este
// archivo (cómo se llama lo que registra, en qué pestaña de Explorar cae,
// qué tan arriba lo ordena el catálogo) se reclasifica como si fuera un
// perfil "emprendedor" normal — es la única fuente de verdad de esa regla,
// así que cualquier otro lugar del código debería usar kindFor/
// projectTypeFor en vez de comparar profileType a mano.
export function isStudentEntrepreneur(profileType, subtype) {
  return profileType === 'estudiante' && subtype === 'emprendedor'
}

export function kindFor(profileType, subtype) {
  if (isStudentEntrepreneur(profileType, subtype)) return DEFAULT_KIND
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

export function projectTypeFor(profileType, subtype) {
  if (isStudentEntrepreneur(profileType, subtype)) return 'emprendimientos'
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
export function sortByOwnProjectType(list, viewerProfileType, viewerSubtype) {
  if (PROFILE_TYPES_WITHOUT_OWN_INITIATIVE.includes(viewerProfileType)) return list
  const viewerType = projectTypeFor(viewerProfileType, viewerSubtype)
  return [...list].sort((a, b) => {
    const aMatch = projectTypeFor(a.ownerProfileType, a.ownerProfileSubtype) === viewerType ? 0 : 1
    const bMatch = projectTypeFor(b.ownerProfileType, b.ownerProfileSubtype) === viewerType ? 0 : 1
    return aMatch - bMatch
  })
}
