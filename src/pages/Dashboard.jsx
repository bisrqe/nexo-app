import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { INITIATIVES } from '../data/initiatives.js'
import { EVENTS } from '../data/events.js'
import { useProfile } from '../context/ProfileContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { rankForProfile } from '../lib/recommend.js'
import { getCityName } from '../data/cities.js'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const { profile } = useProfile()
  const realInitiatives = useFirestoreCollection('initiatives')
  const { groups } = useGroups()
  const [showAllCities, setShowAllCities] = useState(false)

  const allInitiatives = useMemo(() => [...INITIATIVES, ...realInitiatives], [realInitiatives])
  const allEvents = useMemo(
    () => [...EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date)),
    []
  )

  const inMyCity = (item) => showAllCities || !profile.city || !item.city || item.city === profile.city

  const rankedInitiatives = useMemo(() => {
    const pool = allInitiatives.filter(inMyCity)
    const ranked = rankForProfile(pool, profile)
    return (ranked.length > 0 ? ranked : pool).slice(0, 6)
  }, [allInitiatives, profile, showAllCities])

  const rankedEvents = useMemo(() => {
    const pool = allEvents.filter(inMyCity)
    const ranked = rankForProfile(pool, profile)
    return (ranked.length > 0 ? ranked : pool).slice(0, 3)
  }, [allEvents, profile, showAllCities])

  const rankedGroups = useMemo(() => {
    const ranked = rankForProfile(groups, profile)
    return (ranked.length > 0 ? ranked : groups).slice(0, 3)
  }, [groups, profile])

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
          <h3 style={{ marginBottom: 16 }}>Emprendimientos afines a ti</h3>
          {rankedInitiatives.length === 0 ? (
            <div className="empty-state">
              <p>Todavía no hay emprendimientos en tu zona — sé quien abra el primero.</p>
              <Link to="/app/iniciativas/nueva" className="link-arrow">Registrar emprendimiento →</Link>
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
            <div className="dash-list">
              {rankedEvents.map((e) => (
                <div className="dash-list-item" key={e.id}>
                  <span>{e.title}</span>
                  <span>{formatDate(e.date)}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '14px' }}>
              <Link to="/app/eventos" className="link-arrow">Ver todos →</Link>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
