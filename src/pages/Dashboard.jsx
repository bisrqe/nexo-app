import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import SkeletonCards from '../components/SkeletonCards.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { buildRecommendations } from '../lib/recommend.js'
import { getRegionName, profileRegion } from '../data/cities.js'
import { kindFor, myProjectsLabel, PROFILE_TYPES_WITHOUT_OWN_INITIATIVE } from '../lib/initiativeKind.js'
import { flattenResources, normalizeResource } from '../data/resources.js'
import { isSupportProfile } from '../data/admins.js'
import { SUPPORT_GROUP_ID } from '../data/supportGroup.js'

const BUILT_IN_RESOURCES = flattenResources()

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export default function Dashboard() {
  const { profile, updateProfile, profileLoading } = useProfile()
  const { user } = useAuth()
  const { myInitiatives } = useUserContent()
  const myRegion = profileRegion(profile)
  const [allInitiatives, initiativesLoading, initiativesError] = useFirestoreCollection('initiatives')
  const [realEvents, eventsLoading] = useFirestoreCollection('events')
  // Solo se traen los mentores, no el directorio completo — el dashboard
  // únicamente necesita esos, y bajar todos los perfiles hacía más lenta
  // cada carga a medida que crece la plataforma.
  const [mentors] = useFirestoreCollection('profiles', ['profileType', '==', 'mentor'])
  const [customResources] = useFirestoreCollection('resources')
  const { groups } = useGroups()
  const [showAllRegions, setShowAllRegions] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const upcomingEvents = useMemo(
    () => realEvents.filter((e) => !e.date || e.date >= today).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [realEvents, today]
  )

  const resources = useMemo(
    () => [...BUILT_IN_RESOURCES, ...customResources.filter((r) => !r.status || r.status === 'approved').map(normalizeResource)],
    [customResources]
  )

  const recommended = useMemo(
    () => buildRecommendations({
      profile,
      initiatives: allInitiatives.filter((i) => !(i.memberUids || []).includes(user?.uid)),
      events: upcomingEvents,
      groups: groups.filter((g) => g.docId !== SUPPORT_GROUP_ID),
      mentors: mentors.filter((m) => !isSupportProfile(m)),
      resources,
      scope: showAllRegions ? 'all' : 'region',
    }),
    [profile, user, allInitiatives, upcomingEvents, groups, mentors, resources, showAllRegions]
  )

  // La mesa de dudas y onboarding siempre se le ofrece primero a quien
  // todavía no se ha unido, sin importar qué tan afín sea por industria.
  const supportGroup = groups.find((g) => g.docId === SUPPORT_GROUP_ID)
  const showSupportGroup = Boolean(supportGroup) && !profile.joinedGroups?.includes(SUPPORT_GROUP_ID)
  const rankedGroups = recommended.groups

  const ownKind = kindFor(profile.profileType, profile.subtype)
  const canRegister = !PROFILE_TYPES_WITHOUT_OWN_INITIATIVE.includes(profile.profileType)

  return (
    <DashboardLayout
      eyebrow="Tu mapa"
      title="Recomendado para ti"
      subtitle="Emprendimientos, eventos y mesas de trabajo afines a tu perfil — por causas, industria, región y lo que buscas."
    >
      {!profile.tutorialSeen && !profileLoading && (
        <div className="tutorial-banner">
          <div>
            <strong>Conoce Nexo en 2 minutos</strong>
            <span>Un recorrido corto por tu perfil, el catálogo, las mesas, los eventos y el asistente.</span>
          </div>
          <div className="tutorial-banner-actions">
            <Link to="/app/tutorial" className="btn btn-primary">Ver el tutorial →</Link>
            <button type="button" className="link-arrow" onClick={() => updateProfile({ tutorialSeen: true })}>Ahora no</button>
          </div>
        </div>
      )}

      {myRegion && (
        <div className="filters">
          <button className={`chip ${!showAllRegions ? 'active' : ''}`} onClick={() => setShowAllRegions(false)}>
            {getRegionName(myRegion)}
          </button>
          <button className={`chip ${showAllRegions ? 'active' : ''}`} onClick={() => setShowAllRegions(true)}>
            Ver todas las regiones
          </button>
        </div>
      )}
      {myRegion && !showAllRegions && (
        <p className="filter-note">
          Incluye proyectos remotos de otras regiones que coinciden con lo que buscas.
        </p>
      )}

      <div className="dash-grid">
        <div className="dash-col">
          <h2 className="dash-col-heading">Emprendimientos afines a ti</h2>
          {initiativesLoading ? (
            <SkeletonCards count={2} gridClassName="page-grid" />
          ) : initiativesError ? (
            <div className="empty-state">
              <p>No pudimos cargar los emprendimientos. Revisa tu conexión e intenta de nuevo.</p>
              <button type="button" className="link-arrow" onClick={() => window.location.reload()}>Reintentar →</button>
            </div>
          ) : recommended.initiatives.length === 0 ? (
            <div className="empty-state">
              <p>Todavía no hay emprendimientos en tu región — sé quien abra el primero.</p>
              {canRegister && (
                <Link to="/app/iniciativas/nueva" className="link-arrow">Registrar {ownKind.noun} →</Link>
              )}
            </div>
          ) : (
            <div className="page-grid">
              {recommended.initiatives.map((i) => (
                <InitiativeCard key={i.docId || i.id} initiative={i} basePath="/app/iniciativas" />
              ))}
            </div>
          )}
        </div>

        <div className="dash-col">
          {canRegister && myInitiatives.length > 0 && (
            <div className="dash-widget">
              <h3>{myProjectsLabel(profile, myInitiatives)}</h3>
              <div className="dash-list">
                {myInitiatives.map((i) => (
                  <Link to={`/app/iniciativas/${i.slug}`} className="dash-list-item" key={i.docId}>
                    <span>{i.title}</span>
                    <span>{i.stage}</span>
                  </Link>
                ))}
              </div>
              <p style={{ marginTop: '14px' }}>
                <Link to="/app/mi-iniciativa" className="link-arrow">Administrar →</Link>
              </p>
            </div>
          )}

          {recommended.mentors.length > 0 && (
            <div className="dash-widget">
              <h3>Mentores afines a ti</h3>
              <div className="dash-list">
                {recommended.mentors.map((m) => (
                  <Link to={`/app/personas/${m.username || m.docId}`} className="dash-list-item" key={m.docId}>
                    <span>{m.name}</span>
                    <span>{m.expertise}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {recommended.resources.length > 0 && (
            <div className="dash-widget">
              <h3>Recursos recomendados para ti</h3>
              <div className="dash-list">
                {recommended.resources.map((r) => (
                  <a href={`https://${r.link}`} target="_blank" rel="noreferrer" className="dash-list-item" key={r.docId || r.id}>
                    <span>{r.title}</span>
                    <span>{r.category}</span>
                  </a>
                ))}
              </div>
              <p style={{ marginTop: '14px' }}>
                <Link to="/app/recursos" className="link-arrow">Ver todos →</Link>
              </p>
            </div>
          )}

          <div className="dash-widget">
            <h3>Mesas de trabajo afines a ti</h3>
            {!showSupportGroup && rankedGroups.length === 0 ? (
              <p className="dash-empty">Todavía no hay mesas de trabajo. <Link to="/app/comunidad" className="link-arrow">Ver comunidad →</Link></p>
            ) : (
              <div className="dash-list">
                {showSupportGroup && (
                  <Link to={`/app/comunidad/${supportGroup.slug}`} className="dash-list-item">
                    <span>{supportGroup.name}</span>
                    <span>Resuelve tus dudas</span>
                  </Link>
                )}
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
            ) : recommended.events.length === 0 ? (
              <p className="dash-empty">Todavía no hay eventos próximos para ti.</p>
            ) : (
              <div className="dash-list">
                {recommended.events.map((e) => (
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
