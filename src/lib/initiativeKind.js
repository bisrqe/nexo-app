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
