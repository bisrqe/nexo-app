// Puntúa qué tan afín es un emprendimiento/evento/mesa de trabajo al perfil
// de quien está viendo el dashboard. Un solo criterio reutilizable en vez
// de comparar ODS a mano en cada página — así "recomendado para ti"
// significa lo mismo en todas partes (dashboard, recursos y chatbot).
import { isStudentEntrepreneur, profileRoles } from './initiativeKind.js'
import { regionsOf, isRemoteItem, profileRegion, matchesRegionFilter } from '../data/cities.js'
import { relevanceScore } from './resourceRelevance.js'
import { genderFocusFor, itemGenderFocus } from './gender.js'

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

function genderScore(item, profile) {
  const focus = genderFocusFor(profile)
  if (!focus) return 0
  let score = 0
  if (itemGenderFocus(item) === focus) score += 2
  const ods = normalizeOds(item.ods ?? item.odsLabel)
  if (focus === 'mujeres' && (ods.includes('ods5') || item.cause === 'igualdad-genero')) score += 1
  return score
}

// withLocation:false deja fuera los puntos por región — sirve para saber si
// algo está alineado con lo que busca la persona *independientemente* de
// dónde esté (ver isAlignedRemote).
export function scoreForProfile(item, profile, { withLocation = true } = {}) {
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

  if (withLocation) {
    const myRegion = profileRegion(profile)
    if (myRegion && regionsOf(item).includes(myRegion)) score += 2
  }

  score += genderScore(item, profile)

  // Union en vez de reemplazo: un estudiante-emprendedor conserva las
  // prioridades de estudiante (compañeros, mentores) Y suma las de
  // emprendedor, en vez de perder unas por ganar las otras. Lo mismo con un
  // segundo perfil (voluntario). Mismo criterio para decidir si el ITEM
  // cuenta como "emprendedor" a ojos de quien mira.
  const priority = [...new Set([
    ...profileRoles(profile).flatMap((r) => PROFILE_TYPE_PRIORITY[r] || []),
    ...(isStudentEntrepreneur(profile.profileType, profile.subtype) ? PROFILE_TYPE_PRIORITY.emprendedor : []),
  ])]
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

  // Lo que la persona dice que busca vs. lo que el proyecto ofrece/hace —
  // palabras compartidas (largas, para no empatar por "para"/"como").
  if (profile.lookingFor) {
    const wanted = profile.lookingFor.toLowerCase().split(/\W+/).filter((w) => w.length > 4)
    const itemText = `${item.title || ''} ${item.desc || ''} ${item.industryLabel || ''} ${item.causeLabel || ''}`.toLowerCase()
    if (wanted.some((w) => itemText.includes(w))) score += 2
  }

  return score
}

// Un proyecto remoto no compite por región: si trabaja de forma remota,
// puede servirle a alguien de cualquier lugar. Pero solo se cuela en las
// recomendaciones si de verdad está alineado con lo que busca esa persona
// (industria, ODS, etapa, lo que pide) — no basta con ser remoto.
export function isAlignedRemote(item, profile) {
  return isRemoteItem(item) && scoreForProfile(item, profile, { withLocation: false }) > 0
}

export function inRegionOrAlignedRemote(item, profile) {
  const myRegion = profileRegion(profile)
  if (!myRegion) return true
  return matchesRegionFilter(item, myRegion) || isAlignedRemote(item, profile)
}

// Emparejar mentores no usa ods/industria (no los capturan) — se comparan
// palabras entre su expertise/asesoría y lo que describe al perfil que
// pregunta (industria, bio, ocupación), más la región.
export function scoreMentorForProfile(mentor, profile) {
  let score = 0
  const mentorText = `${mentor.expertise || ''} ${mentor.advisoryOffer || ''}`.toLowerCase()
  const profileText = `${profile.industryLabel || ''} ${profile.bio || ''} ${profile.lookingFor || ''} ${profile.occupation || ''}`.toLowerCase()
  const words = mentorText.split(/\W+/).filter((w) => w.length > 3)
  words.forEach((w) => { if (profileText.includes(w)) score += 1 })
  const myRegion = profileRegion(profile)
  if (myRegion && regionsOf(mentor).includes(myRegion)) score += 2
  return score
}

export function rankMentorsForProfile(mentors, profile, limit = 3) {
  const scored = mentors
    .map((m) => ({ item: m, score: scoreMentorForProfile(m, profile) }))
    .sort((a, b) => b.score - a.score)

  // Prioriza mentores que de verdad atienden lo que la cuenta busca
  // (score > 0, viene de cruzar mentor.expertise/advisoryOffer contra
  // profile.lookingFor/bio/industryLabel/occupation) — solo cae a
  // mostrar cualquier mentor si ninguno coincide, para no dejar la
  // sección vacía si sí hay mentores en la plataforma.
  const matched = scored.filter((x) => x.score > 0)
  const pool = matched.length > 0 ? matched : scored
  return pool.map((x) => x.item).slice(0, limit)
}

export function rankForProfile(items, profile, { onlyPositive = true } = {}) {
  return items
    .map((item) => ({ item, score: scoreForProfile(item, profile) }))
    .filter((x) => !onlyPositive || x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item)
}

// Recursos recomendados — los de alcance nacional/internacional más los de
// la región de la cuenta (con prioridad a los de su propio estado), ordenados
// por tipo de perfil (y género, si aplica). Los marcados "sin convocatoria
// abierta" no se recomiendan: siguen visibles en Recursos, pero no tiene
// caso empujarlos al inicio. `resources` es una lista plana normalizada (ver
// flattenResources / normalizeResource en data/resources.js).
export function recommendResources(resources, profile, limit = 3) {
  const region = profileRegion(profile)
  const pool = resources.filter((r) => r.link && !r.noOpenCall && (r.scope !== 'estatal' || (region && r.regionId === region)))
  const scored = pool
    .map((r) => ({
      item: r,
      score: relevanceScore(r, profile) + (r.scope === 'estatal' && profile.state && r.state === profile.state ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)
  const matched = scored.filter((x) => x.score > 0)
  return (matched.length > 0 ? matched : scored).map((x) => x.item).slice(0, limit)
}

// Todo lo que se le recomienda a una cuenta, en un solo lugar — lo usan el
// dashboard y el chatbot, así que "lo que te recomienda Nexo" es lo mismo
// en los dos. scope 'all' quita el filtro de región (el botón "Ver todas
// las zonas"). Los eventos remotos/virtuales siempre entran (no dependen de
// dónde estés); los proyectos remotos solo si están alineados con lo que
// busca la persona (ver isAlignedRemote).
export function buildRecommendations({
  profile, initiatives = [], events = [], groups = [], mentors = [], resources = [],
  scope = 'region', limits = {},
}) {
  const { initiatives: nInit = 6, events: nEv = 3, groups: nGr = 3, mentors: nMen = 3, resources: nRes = 3 } = limits
  const regional = scope !== 'all'
  const inScope = (item) => !regional || inRegionOrAlignedRemote(item, profile)
  const inScopeEvent = (item) => !regional || isRemoteItem(item) || inRegionOrAlignedRemote(item, profile)

  const pick = (pool, n) => {
    const ranked = rankForProfile(pool, profile)
    return (ranked.length > 0 ? ranked : pool).slice(0, n)
  }

  return {
    initiatives: pick(initiatives.filter(inScope), nInit),
    events: pick(events.filter(inScopeEvent), nEv),
    groups: pick(groups.filter(inScope), nGr),
    mentors: profile.profileType === 'mentor'
      ? []
      : rankMentorsForProfile(mentors.filter((m) => !regional || inScope(m) || scoreMentorForProfile(m, profile) > 0), profile, nMen),
    resources: recommendResources(resources, profile, nRes),
  }
}
