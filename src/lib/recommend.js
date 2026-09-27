// Puntúa qué tan afín es un emprendimiento/evento/mesa de trabajo al perfil
// de quien está viendo el dashboard. Un solo criterio reutilizable en vez
// de comparar ODS a mano en cada página — así "recomendado para ti"
// significa lo mismo en todas partes.

// Los ODS de eventos/grupos vienen como "ODS 4" (mock viejo) en vez de
// "ods4" (id usado en perfiles/iniciativas) — se normaliza antes de comparar.
function normalizeOds(value) {
  if (!value) return []
  const list = Array.isArray(value) ? value : [value]
  return list
    .map((v) => {
      const match = String(v).match(/\d+/)
      return match ? `ods${match[0]}` : String(v).toLowerCase()
    })
    .filter(Boolean)
}

export function scoreForProfile(item, profile) {
  if (!profile) return 0
  let score = 0

  const itemOds = normalizeOds(item.ods ?? item.odsLabel)
  const profileOds = profile.interests || []
  itemOds.forEach((id, i) => {
    if (profileOds.includes(id)) score += i === 0 ? 3 : 2
  })

  if (item.industry && profile.industry) {
    if (item.industry === profile.industry) score += 3
    else if (item.industrySecondary === profile.industry) score += 1
  }
  if (item.industrySecondary && profile.industry === item.industrySecondary) score += 1

  if (item.city && profile.city && item.city === profile.city) score += 2

  return score
}

export function rankForProfile(items, profile, { onlyPositive = true } = {}) {
  return items
    .map((item) => ({ item, score: scoreForProfile(item, profile) }))
    .filter((x) => !onlyPositive || x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item)
}
