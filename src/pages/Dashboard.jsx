import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { INITIATIVES, ODS_FILTERS } from '../data/initiatives.js'
import { EVENTS } from '../data/events.js'
import { GROUPS } from '../data/groups.js'
import { useSaved } from '../context/SavedContext.jsx'

const INTEREST_OPTIONS = ODS_FILTERS.filter((f) => f.id !== 'todos')

// Mismo espíritu que el algoritmo de TopPosts/ (ver DOC_ALGORITMO.md):
// puntuar por coincidencia de tema — solo que aquí el objeto que se
// rankea es la iniciativa, no la publicación.
function rankByInterest(initiatives, interests) {
  if (interests.length === 0) return []
  return initiatives
    .map((i) => ({ initiative: i, score: i.ods.filter((tag) => interests.includes(tag)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.initiative)
}

export default function Dashboard() {
  const [interests, setInterests] = useState(['ods4', 'ods6'])
  const { saved } = useSaved()

  const toggleInterest = (id) =>
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const matches = useMemo(() => rankByInterest(INITIATIVES, interests), [interests])

  const upcomingEvents = useMemo(
    () => [...EVENTS].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3),
    []
  )

  const myGroups = GROUPS.filter((g) => saved.groups.includes(g.id))

  return (
    <DashboardLayout
      eyebrow="Tu mapa"
      title="Iniciativas afines a ti"
      subtitle="Marca los ODS que te interesan y el orden de abajo se acomoda solo — mismo algoritmo de puntuación que ya habíamos diseñado, aplicado a iniciativas en vez de publicaciones."
    >
      <div className="filters">
        {INTEREST_OPTIONS.map((f) => (
          <button
            key={f.id}
            className={`chip ${interests.includes(f.id) ? 'active' : ''}`}
            onClick={() => toggleInterest(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          {matches.length === 0 ? (
            <div className="empty-state">
              <p>{interests.length === 0 ? 'Elige al menos un ODS arriba para ver coincidencias.' : 'Nadie está trabajando todavía en esos ODS — sé quien abra el primero.'}</p>
              <Link to="/app/iniciativas/nueva" className="link-arrow">Registrar iniciativa →</Link>
            </div>
          ) : (
            <div className="page-grid">
              {matches.map((i) => (
                <InitiativeCard key={i.id} initiative={i} basePath="/app/iniciativas" />
              ))}
            </div>
          )}
        </div>

        <div className="dash-col">
          <div className="dash-widget">
            <h3>Tus mesas de trabajo</h3>
            {myGroups.length === 0 ? (
              <p className="dash-empty">Todavía no te unes a ninguna. <Link to="/app/comunidad" className="link-arrow">Ver comunidad →</Link></p>
            ) : (
              <div className="dash-list">
                {myGroups.map((g) => (
                  <div className="dash-list-item" key={g.id}>
                    <span>{g.name}</span>
                    <span>{g.odsLabel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dash-widget">
            <h3>Próximos eventos</h3>
            <div className="dash-list">
              {upcomingEvents.map((e) => (
                <div className="dash-list-item" key={e.id}>
                  <span>{e.title}</span>
                  <span>{e.date}</span>
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
