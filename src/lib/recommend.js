// Puntúa qué tan afín es un emprendimiento/evento/mesa de trabajo al perfil
// de quien está viendo el dashboard. Un solo criterio reutilizable en vez
// de comparar ODS a mano en cada página — así "recomendado para ti"
// significa lo mismo en todas partes.
import { isStudentEntrepreneur } from './initiativeKind.js'

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

// Qué tipos de emprendimiento/iniciativa le conviene ver más arriba a cada
// tipo de perfil — prioriza, no oculta: todo sigue apareciendo, esto solo
// mueve hacia arriba lo más relevante según el principio de Nexo (recomendar
// por perfil e intereses sin limitar la exploración del resto).
const PROFILE_TYPE_PRIORITY = {
  emprendedor: ['emprendedor'],
  estudiante: ['mentor', 'emprendedor', 'estudiante'],
  organizacion: ['estudiante'],
  mentor: ['estudiante', 'emprendedor'],
  voluntario: [],
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

  // Union en vez de reemplazo: un estudiante-emprendedor conserva las
  // prioridades de estudiante (compañeros, mentores) Y suma las de
  // emprendedor, en vez de perder unas por ganar las otras. Mismo criterio
  // para decidir si el ITEM cuenta como "emprendedor" a ojos de quien mira.
  const priority = isStudentEntrepreneur(profile.profileType, profile.subtype)
    ? [...(PROFILE_TYPE_PRIORITY[profile.profileType] || []), ...PROFILE_TYPE_PRIORITY.emprendedor]
    : (PROFILE_TYPE_PRIORITY[profile.profileType] || [])
  const itemCountsAsEmprendedor = isStudentEntrepreneur(item.ownerProfileType, item.ownerProfileSubtype)
  if (item.ownerProfileType && (priority.includes(item.ownerProfileType) || (itemCountsAsEmprendedor && priority.includes('emprendedor')))) {
    score += 2
  }

  // Un mentor busca a quién asesorar según su expertise, no ODS/industria
  // propios (no los captura) — empareja por palabras compartidas entre su
  // expertise y lo que la iniciativa dice que necesita o a qué se dedica.
  if (profile.profileType === 'mentor' && profile.expertise) {
    const expertiseWords = profile.expertise.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
    const itemText = `${item.need || ''} ${item.desc || ''} ${item.industryLabel || ''}`.toLowerCase()
    if (expertiseWords.some((w) => itemText.includes(w))) score += 3
  }

  return score
}

// Emparejar mentores no usa ods/industria (no los capturan) — se comparan
// palabras entre su expertise/asesoría y lo que describe al perfil que
// pregunta (industria, bio, ocupación), más la ciudad.
export function scoreMentorForProfile(mentor, profile) {
  let score = 0
  const mentorText = `${mentor.expertise || ''} ${mentor.advisoryOffer || ''}`.toLowerCase()
  const profileText = `${profile.industryLabel || ''} ${profile.bio || ''} ${profile.lookingFor || ''} ${profile.occupation || ''}`.toLowerCase()
  const words = mentorText.split(/\W+/).filter((w) => w.length > 3)
  words.forEach((w) => { if (profileText.includes(w)) score += 1 })
  if (mentor.city && profile.city && mentor.city === profile.city) score += 2
  return score
}

export function rankMentorsForProfile(mentors, profile, limit = 3) {
  return mentors
    .map((m) => ({ item: m, score: scoreMentorForProfile(m, profile) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item)
    .slice(0, limit)
}

export function rankForProfile(items, profile, { onlyPositive = true } = {}) {
  return items
    .map((item) => ({ item, score: scoreForProfile(item, profile) }))
    .filter((x) => !onlyPositive || x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item)
}
