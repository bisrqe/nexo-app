import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { rankForProfile, rankMentorsForProfile } from '../lib/recommend.js'
import { getCityName } from '../data/cities.js'
import { kindFor, PROFILE_TYPES_WITHOUT_OWN_INITIATIVE } from '../lib/initiativeKind.js'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const { profile } = useProfile()
  const [allInitiatives, initiativesLoading] = useFirestoreCollection('initiatives')
  const [realEvents, eventsLoading] = useFirestoreCollection('events')
  const [allProfiles] = useFirestoreCollection('profiles')
  const { groups } = useGroups()
  const [showAllCities, setShowAllCities] = useState(false)

  const allEvents = useMemo(
    () => [...realEvents].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [realEvents]
  )

  const inMyCity = (item) => showAllCities || !profile.city || !item.city || item.city === profile.city
  // Un evento remoto no compite por zona — no importa tu ciudad, siempre
  // debería poder recomendarse.
  const eventInMyCity = (item) => item.city === 'remoto' || inMyCity(item)

  const rankedInitiatives = useMemo(() => {
    const pool = allInitiatives.filter(inMyCity)
    const ranked = rankForProfile(pool, profile)
    return (ranked.length > 0 ? ranked : pool).slice(0, 6)
  }, [allInitiatives, profile, showAllCities])

  const rankedEvents = useMemo(() => {
    const pool = allEvents.filter(eventInMyCity)
    const ranked = rankForProfile(pool, profile)
    return (ranked.length > 0 ? ranked : pool).slice(0, 3)
  }, [allEvents, profile, showAllCities])

  const rankedGroups = useMemo(() => {
    const pool = groups.filter(inMyCity)
    const ranked = rankForProfile(pool, profile)
    return (ranked.length > 0 ? ranked : pool).slice(0, 3)
  }, [groups, profile, showAllCities])

  const rankedMentors = useMemo(() => {
    if (profile.profileType === 'mentor') return []
    const pool = allProfiles.filter((p) => p.profileType === 'mentor').filter(inMyCity)
    return rankMentorsForProfile(pool, profile, 3)
  }, [allProfiles, profile, showAllCities])

  return (
    <DashboardLayout
      eyebrow="Tu mapa"
      title="Recomendado para ti"
      subtitle="Emprendimientos, eventos y mesas de trabajo afines a tu perfil — por causas, industria y lo que buscas."
    >
      {profile.city && (
        <div className="filters">
          <button className={`chip ${!showAllCities ? 'active' : ''}`} onClick={() => setShowAllCities(false)}>
            {getCityName(profile.city)}
          </button>
          <button className={`chip ${showAllCities ? 'active' : ''}`} onClick={() => setShowAllCities(true)}>
            Ver todas las zonas
          </button>
        </div>
      )}

      <div className="dash-grid">
        <div className="dash-col">
          <h2 className="dash-col-heading">Emprendimientos afines a ti</h2>
          {initiativesLoading ? (
            <p className="auth-sub">Cargando…</p>
          ) : rankedInitiatives.length === 0 ? (
            <div className="empty-state">
              <p>Todavía no hay emprendimientos en tu zona — sé quien abra el primero.</p>
              {!PROFILE_TYPES_WITHOUT_OWN_INITIATIVE.includes(profile.profileType) && (
                <Link to="/app/iniciativas/nueva" className="link-arrow">Registrar {kindFor(profile.profileType, profile.subtype).noun} →</Link>
              )}
            </div>
          ) : (
            <div className="page-grid">
              {rankedInitiatives.map((i) => (
                <InitiativeCard key={i.docId || i.id} initiative={i} basePath="/app/iniciativas" />
              ))}
            </div>
          )}
        </div>

        <div className="dash-col">
          {rankedMentors.length > 0 && (
            <div className="dash-widget">
              <h3>Mentores afines a ti</h3>
              <div className="dash-list">
                {rankedMentors.map((m) => (
                  <Link to={`/app/personas/${m.username || m.docId}`} className="dash-list-item" key={m.docId}>
                    <span>{m.name}</span>
                    <span>{m.expertise}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="dash-widget">
            <h3>Mesas de trabajo afines a ti</h3>
            {rankedGroups.length === 0 ? (
              <p className="dash-empty">Todavía no hay mesas de trabajo. <Link to="/app/comunidad" className="link-arrow">Ver comunidad →</Link></p>
            ) : (
              <div className="dash-list">
                {rankedGroups.map((g) => (
                  <Link to={`/app/comunidad/${g.slug}`} className="dash-list-item" key={g.docId}>
                    <span>{g.name}</span>
                    <span>{g.industryLabel}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="dash-widget">
            <h3>Eventos afines a ti</h3>
            {eventsLoading ? (
              <p className="auth-sub">Cargando…</p>
            ) : rankedEvents.length === 0 ? (
              <p className="dash-empty">Todavía no hay eventos. <Link to="/app/eventos" className="link-arrow">Ver eventos →</Link></p>
            ) : (
              <div className="dash-list">
                {rankedEvents.map((e) => (
                  <div className="dash-list-item dash-list-item-static" key={e.docId}>
                    <span>{e.title}</span>
                    <span>{formatDate(e.date)}</span>
                  </div>
                ))}
              </div>
            )}
            <p style={{ marginTop: '14px' }}>
              <Link to="/app/eventos" className="link-arrow">Ver todos →</Link>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
