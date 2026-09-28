import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useSaved } from '../context/SavedContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import InitiativeCard from '../components/InitiativeCard.jsx'

export default function Saved() {
  const { saved } = useSaved()
  const { profile } = useProfile()
  const { user } = useAuth()
  const { groups } = useGroups()
  const [initiatives] = useFirestoreCollection('initiatives')
  const [events] = useFirestoreCollection('events')

  const savedInitiatives = initiatives.filter((i) => saved.initiatives.includes(i.slug))
  const savedEvents = events.filter((e) => user && e.attendees?.includes(user.uid))
  const savedGroups = groups.filter((g) => profile.joinedGroups?.includes(g.docId))

  const nothingSaved = savedInitiatives.length === 0 && savedEvents.length === 0 && savedGroups.length === 0

  return (
    <DashboardLayout
      eyebrow="Mi espacio"
      title="Guardado"
      subtitle="Emprendimientos que guardaste, eventos donde estás inscrito y mesas de trabajo a las que te uniste."
    >
      {nothingSaved && (
        <div className="empty-state">
          <p>Todavía no guardaste ni te uniste a nada.</p>
          <Link to="/app/iniciativas" className="link-arrow">Explorar emprendimientos →</Link>
        </div>
      )}

      {savedInitiatives.length > 0 && (
        <div className="resource-group">
          <h3>Emprendimientos guardados</h3>
          <div className="page-grid">
            {savedInitiatives.map((i) => (
              <InitiativeCard key={i.docId} initiative={i} basePath="/app/iniciativas" />
            ))}
          </div>
        </div>
      )}

      {savedEvents.length > 0 && (
        <div className="resource-group">
          <h3>Eventos donde estás inscrito</h3>
          <div className="page-grid">
            {savedEvents.map((e) => (
              <div className="resource-card" key={e.docId}>
                <div className="resource-title">{e.title}</div>
                <div className="resource-org">{e.location}</div>
                <p className="resource-desc">{e.date} — {e.time} hrs</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedGroups.length > 0 && (
        <div className="resource-group">
          <h3>Mesas de trabajo a las que te uniste</h3>
          <div className="page-grid">
            {savedGroups.map((g) => (
              <div className="resource-card" key={g.docId}>
                <div className="resource-title">{g.name}</div>
                <div className="resource-org">{g.industryLabel}</div>
                <p className="resource-desc">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
