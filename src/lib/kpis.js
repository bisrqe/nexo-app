import { ODS_FILTERS, INDUSTRY_FILTERS } from '../data/initiatives.js'
import { PROFILE_TYPES } from '../data/profileOptions.js'
import { getCityName } from '../data/cities.js'

// Todo lo que se calcula aquí viene únicamente de las colecciones reales
// de Firestore (profiles/initiatives/events) — nunca de los catálogos de
// ejemplo (INITIATIVES/EVENTS/PEOPLE) que se usan para poblar el catálogo
// mientras la comunidad todavía es chica. Un reporte de KPIs con datos
// inventados no sirve de nada.

function labelFor(list, id) {
  return list.find((o) => o.id === id)?.label ?? (id || 'Sin especificar')
}

function countBy(list, keyFn) {
  const map = new Map()
  for (const item of list) {
    const key = keyFn(item)
    if (!key) continue
    map.set(key, (map.get(key) || 0) + 1)
  }
  return map
}

function sortedEntries(map) {
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

export function computeKpis({ profiles = [], initiatives = [], events = [], conversations = [], groups = [] }) {
  const totalProfiles = profiles.length
  const totalInitiatives = initiatives.length
  const totalEvents = events.length
  const totalConversations = conversations.length
  const totalDirectMessages = conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0)
  const totalGroupMessages = groups.reduce((sum, g) => sum + (g.messageCount || 0), 0)

  let totalInterest = 0
  const connectionPairs = new Set()
  const connectedPeople = new Set()
  for (const init of initiatives) {
    const interested = init.interestedBy || []
    totalInterest += interested.length
    for (const uid of interested) {
      if (init.ownerUid && uid !== init.ownerUid) {
        connectionPairs.add(`${uid}::${init.ownerUid}`)
        connectedPeople.add(uid)
        connectedPeople.add(init.ownerUid)
      }
    }
  }

  const citiesSet = new Set([
    ...profiles.map((p) => p.city).filter(Boolean),
    ...initiatives.map((i) => i.city).filter(Boolean),
    ...events.map((e) => e.city).filter(Boolean),
  ])

  const initiativesByIndustry = sortedEntries(
    countBy(initiatives, (i) => i.industryLabel || (i.industry ? labelFor(INDUSTRY_FILTERS, i.industry) : null))
  )
  const initiativesByOds = sortedEntries(
    countBy(initiatives, (i) => i.odsLabel || (i.ods?.[0] ? labelFor(ODS_FILTERS, i.ods[0]) : null))
  )
  const initiativesByStage = sortedEntries(countBy(initiatives, (i) => i.stage))
  const profilesByCity = sortedEntries(countBy(profiles, (p) => getCityName(p.city) || p.city))
  const profilesByType = sortedEntries(countBy(profiles, (p) => labelFor(PROFILE_TYPES, p.profileType)))
  const eventsByCity = sortedEntries(countBy(events, (e) => getCityName(e.city) || e.city))

  const groupMembership = groups.map((g) => ({
    label: g.name,
    value: profiles.filter((p) => (p.joinedGroups || []).includes(g.docId)).length,
  }))

  const topInitiatives = [...initiatives]
    .map((i) => ({
      title: i.title || 'Sin título',
      org: i.org || '—',
      industryLabel: i.industryLabel || '—',
      odsLabel: i.odsLabel || '—',
      interest: (i.interestedBy || []).length,
    }))
    .sort((a, b) => b.interest - a.interest)
    .slice(0, 10)
    .filter((i) => i.interest > 0)

  const profileByUid = new Map(profiles.map((p) => [p.docId, p]))
  const activity = new Map()
  const bump = (uid, field, amount = 1) => {
    if (!uid) return
    if (!activity.has(uid)) {
      activity.set(uid, { uid, initiatives: 0, interestShown: 0, events: 0, groupsJoined: 0 })
    }
    activity.get(uid)[field] += amount
  }
  for (const init of initiatives) {
    bump(init.ownerUid, 'initiatives')
    for (const uid of init.interestedBy || []) bump(uid, 'interestShown')
  }
  for (const ev of events) bump(ev.ownerUid, 'events')
  for (const p of profiles) {
    if (p.joinedGroups?.length) bump(p.docId, 'groupsJoined', p.joinedGroups.length)
  }

  const activityRanking = [...activity.values()]
    .map((a) => {
      const owner = profileByUid.get(a.uid)
      return {
        ...a,
        name: owner?.name || 'Cuenta eliminada',
        city: getCityName(owner?.city),
        score: a.initiatives * 3 + a.interestShown * 2 + a.events * 2 + a.groupsJoined,
      }
    })
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return {
    generatedAt: new Date(),
    totals: {
      profiles: totalProfiles,
      initiatives: totalInitiatives,
      events: totalEvents,
      interest: totalInterest,
      connections: connectionPairs.size,
      connectedPeople: connectedPeople.size,
      cities: citiesSet.size,
      directConversations: totalConversations,
      directMessages: totalDirectMessages,
      groups: groups.length,
      groupMessages: totalGroupMessages,
    },
    initiativesByIndustry,
    initiativesByOds,
    initiativesByStage,
    profilesByCity,
    profilesByType,
    eventsByCity,
    groupMembership,
    topInitiatives,
    activityRanking,
  }
}
