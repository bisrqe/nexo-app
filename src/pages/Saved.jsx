import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useSaved } from '../context/SavedContext.jsx'
import { getInitiativeBySlug } from '../data/initiatives.js'
import { EVENTS } from '../data/events.js'
import { GROUPS } from '../data/groups.js'
import InitiativeCard from '../components/InitiativeCard.jsx'

export default function Saved() {
  const { saved } = useSaved()

  const savedInitiatives = saved.initiatives.map(getInitiativeBySlug).filter(Boolean)
  const savedEvents = EVENTS.filter((e) => saved.events.includes(e.id))
  const savedGroups = GROUPS.filter((g) => saved.groups.includes(g.id))

  const nothingSaved = savedInitiatives.length === 0 && savedEvents.length === 0 && savedGroups.length === 0

  return (
    <DashboardLayout
      eyebrow="Mi espacio"
      title="Guardado"
      subtitle="Solo vive en este navegador — todavía no hay cuenta ni backend detrás de esto."
    >
      {nothingSaved && (
        <div className="empty-state">
          <p>Todavía no guardaste ni te uniste a nada.</p>
          <Link to="/iniciativas" className="link-arrow">Explorar iniciativas →</Link>
        </div>
      )}

      {savedInitiatives.length > 0 && (
        <div className="resource-group">
          <h3>Iniciativas guardadas</h3>
          <div className="page-grid">
            {savedInitiatives.map((i) => (
              <InitiativeCard key={i.id} initiative={i} />
            ))}
          </div>
        </div>
      )}

      {savedEvents.length > 0 && (
        <div className="resource-group">
          <h3>Eventos donde estás inscrito</h3>
          <div className="page-grid">
            {savedEvents.map((e) => (
              <div className="resource-card" key={e.id}>
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
              <div className="resource-card" key={g.id}>
                <div className="resource-title">{g.name}</div>
                <div className="resource-org">{g.odsLabel}</div>
                <p className="resource-desc">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
