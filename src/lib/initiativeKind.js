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

// Roles que una cuenta cumple a la vez: su perfil principal más, si lo
// tiene, el segundo (un estudiante puede sumar "voluntario/a"). Todo lo que
// se recomienda o filtra por rol debería usar esto en vez de comparar
// profileType a mano — así el segundo perfil cuenta en todos lados.
export function profileRoles(profile) {
  if (!profile) return []
  const roles = [profile.profileType]
  if (profile.profileType === 'estudiante' && profile.secondaryProfile) roles.push(profile.secondaryProfile)
  return roles.filter(Boolean)
}

// Etapas por tipo de proyecto. Una iniciativa (proyecto escolar, aún sin
// constituir) solo pasa por idea → prototipo; un emprendimiento o una
// institución ya funcionan como organización, así que se describen por qué
// tan consolidados están. Los valores viejos ("En marcha", "Escalando") se
// siguen mostrando tal cual en lo ya guardado — ver stageOptionsFor.
const STAGES_BY_PROJECT_TYPE = {
  iniciativas: [
    { id: 'Idea', hint: 'Todavía es un planteamiento: identificaste un problema y una posible solución, sin nada construido.' },
    { id: 'Prototipo', hint: 'Ya hay una primera versión (prototipo, piloto o prueba) que se está probando con personas reales.' },
  ],
  emprendimientos: [
    { id: 'Constituido', hint: 'Ya está formalizado (figura legal, RFC o equivalente) y empieza a operar y vender.' },
    { id: 'En crecimiento', hint: 'Ventas, usuarios o equipo van en aumento y se busca escalar o abrir nuevos mercados.' },
    { id: 'Maduro', hint: 'Operación estable: procesos definidos, ingresos recurrentes y un equipo consolidado.' },
  ],
  instituciones: [
    { id: 'Constituida', hint: 'Ya está legalmente constituida y arrancando operaciones o programas.' },
    { id: 'En crecimiento', hint: 'Está ampliando su alcance: más beneficiarios, sedes, programas o alianzas.' },
    { id: 'Consolidada', hint: 'Trayectoria sólida: programas estables, equipo y financiamiento recurrentes.' },
  ],
}

export function stagesFor(projectType) {
  return STAGES_BY_PROJECT_TYPE[projectType] || STAGES_BY_PROJECT_TYPE.emprendimientos
}

export function defaultStageFor(projectType) {
  return stagesFor(projectType)[0].id
}

// Etapas disponibles para un tipo de proyecto, más — al editar algo ya
// guardado con una etapa de la lista vieja — esa etapa actual, para que el
// select no la borre en silencio al guardar.
export function stageOptionsFor(projectType, currentStage) {
  const options = stagesFor(projectType)
  if (currentStage && !options.some((o) => o.id === currentStage)) {
    return [...options, { id: currentStage, hint: 'Etapa anterior — elige una de la lista nueva si quieres actualizarla.' }]
  }
  return options
}

// Texto de "mi emprendimiento / mi iniciativa / mi institución" para el
// sidebar y los títulos del dashboard. Una cuenta puede tener varios
// proyectos, incluso de tipos distintos (un estudiante con una iniciativa y
// un emprendimiento) — con uno solo va en singular, con varios del mismo
// tipo en plural, y si son de tipos distintos queda el genérico "proyectos".
export function myProjectsLabel(profile, myInitiatives = []) {
  const profileKind = kindFor(profile?.profileType, profile?.subtype)
  if (myInitiatives.length === 0) return profileKind.my
  const types = new Set(myInitiatives.map((i) => projectTypeFor(i.ownerProfileType, i.ownerProfileSubtype)))
  if (types.size > 1) return 'Mis proyectos'
  if (myInitiatives.length === 1) {
    const only = myInitiatives[0]
    return kindFor(only.ownerProfileType, only.ownerProfileSubtype).my
  }
  const first = myInitiatives[0]
  return kindFor(first.ownerProfileType, first.ownerProfileSubtype).myPlural
}
