// Qué tan relevante es cada categoría de recurso según el tipo de perfil
// de la cuenta — no filtra nada (todo sigue siendo visible en Recursos),
// solo reordena para que lo más útil para esa cuenta aparezca primero.
// Coincide por substring contra item.category, que es texto libre.
// Compartido entre src/pages/Recursos.jsx y src/pages/Dashboard.jsx para
// que "recomendado para ti" signifique lo mismo en los dos lados.
export const PROFILE_CATEGORY_WEIGHTS = {
  emprendedor: ['financiamiento', 'incubaci', 'aceleraci', 'convocatoria', 'grant', 'premio', 'crédito', 'capital'],
  estudiante: ['incubaci', 'competencia', 'beca', 'mentoría', 'formación', 'evento', 'networking'],
  mentor: ['mentoría', 'red', 'comunidad', 'directorio', 'networking'],
  voluntario: ['comunidad', 'red', 'directorio', 'evento', 'networking'],
  organizacion: ['programas estatales', 'directorio', 'grant', 'alianza', 'financiamiento'],
}

export function relevanceScore(item, profileType) {
  const keywords = PROFILE_CATEGORY_WEIGHTS[profileType]
  if (!keywords) return 0
  const category = (item.category || '').toLowerCase()
  return keywords.some((k) => category.includes(k)) ? 1 : 0
}
