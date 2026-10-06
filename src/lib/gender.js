// Género → a qué enfoque de apoyo se le da prioridad. Hoy solo hay apoyos
// dirigidos a mujeres (convocatorias, programas, redes); el resto de las
// opciones de género ("masculino", "no binario", "prefiero no decir",
// "otro") a propósito NO activan ningún criterio — esas cuentas reciben
// recomendaciones solo por industria, ODS, región, etapa y lo que buscan.
// Se declara como mapa (y no como un if suelto) para que, si algún día se
// suma otro enfoque, sea una línea más.
const GENDER_TO_FOCUS = { femenino: 'mujeres' }

export function genderFocusFor(profile) {
  return GENDER_TO_FOCUS[profile?.gender] || ''
}

// Enfoque de género de un recurso/emprendimiento/evento: el campo
// explícito (genderFocus) si lo trae; si no, se infiere del texto — para que
// los recursos ya capturados ("dirigidos a mujeres emprendedoras…") cuenten
// sin tener que editarlos uno por uno.
const WOMEN_TEXT_RE = /\b(mujer|mujeres|women|womens|ellas|igualdad de g[eé]nero)\b/i

export function itemGenderFocus(item) {
  if (!item) return ''
  if (item.genderFocus) return item.genderFocus
  const text = `${item.title || ''} ${item.desc || ''} ${item.name || ''}`
  return WOMEN_TEXT_RE.test(text) ? 'mujeres' : ''
}

