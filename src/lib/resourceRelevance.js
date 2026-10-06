// Qué tan relevante es cada recurso para una cuenta — no filtra nada (todo
// sigue siendo visible en Recursos), solo reordena para que lo más útil
// para esa cuenta aparezca primero. Dos criterios:
//  - Tipo de perfil: coincide por substring contra item.category, que es
//    texto libre. Una cuenta con segundo perfil (estudiante + voluntario)
//    cuenta con las palabras clave de los dos.
//  - Género: solo apoyos dirigidos a mujeres, y solo para perfiles que se
//    registraron como femenino — "No binario", "Prefiero no decir", etc. no
//    activan nada (ver genderFocusFor en lib/gender.js).
// Compartido entre Recursos.jsx, Dashboard.jsx y el chatbot para que
// "recomendado para ti" signifique lo mismo en los tres.
import { profileRoles } from './initiativeKind.js'
import { genderFocusFor, itemGenderFocus } from './gender.js'

export const PROFILE_CATEGORY_WEIGHTS = {
  emprendedor: ['financiamiento', 'incubaci', 'aceleraci', 'convocatoria', 'grant', 'premio', 'crédito', 'capital'],
  estudiante: ['incubaci', 'competencia', 'beca', 'mentoría', 'formación', 'evento', 'networking'],
  mentor: ['mentoría', 'red', 'comunidad', 'directorio', 'networking'],
  voluntario: ['comunidad', 'red', 'directorio', 'evento', 'networking'],
  organizacion: ['programas estatales', 'directorio', 'grant', 'alianza', 'financiamiento'],
}

export function relevanceScore(item, profile) {
  let score = 0
  const category = (item.category || '').toLowerCase()
  const keywords = profileRoles(profile).flatMap((r) => PROFILE_CATEGORY_WEIGHTS[r] || [])
  if (keywords.some((k) => category.includes(k))) score += 1
  const focus = genderFocusFor(profile)
  if (focus && itemGenderFocus(item) === focus) score += 2
  return score
}
