import React, { useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { EVENTS } from '../data/events.js'
import { useSaved } from '../context/SavedContext.jsx'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function Eventos() {
  const { isEventSaved, toggleEvent } = useSaved()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [counts, setCounts] = useState(() => Object.fromEntries(EVENTS.map((e) => [e.id, e.attendees])))

  const categories = ['Todos', ...new Set(EVENTS.map((e) => e.category))]

  const handleToggle = (event) => {
    const wasRegistered = isEventSaved(event.id)
    toggleEvent(event.id)
    setCounts((c) => ({ ...c, [event.id]: c[event.id] + (wasRegistered ? -1 : 1) }))
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return EVENTS.filter((e) => {
      const matchQ = !q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      const matchCat = category === 'Todos' || e.category === category
      return matchQ && matchCat
    })
  }, [query, category])

  return (
    <DashboardLayout
      eyebrow="Comunidad"
      title="Eventos"
      subtitle="Talleres, hackathons y pitch days — donde el mapa se vuelve conversación real."
    >
      <div className="filters" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <input
          className="search-input"
          type="text"
          placeholder="Buscar eventos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="filters" style={{ marginBottom: 0 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No encontramos eventos con ese criterio.</p></div>
      ) : (
        <div className="page-grid">
          {filtered.map((event) => {
            const registered = isEventSaved(event.id)
            const count = counts[event.id]
            const pct = Math.min(100, Math.round((count / event.maxAttendees) * 100))
            const full = count >= event.maxAttendees && !registered
            const barClass = pct >= 90 ? 'high' : pct >= 70 ? 'mid' : ''

            return (
              <div className="event-card" key={event.id}>
                <div className={`event-stripe ${registered ? 'registered' : ''}`} />
                <div className="event-body">
                  <div className="event-top">
                    <span className="event-cat">{event.category}</span>
                    <span className="event-date">{formatDate(event.date)}</span>
                  </div>
                  <div className="event-title">{event.title}</div>
                  <p className="event-desc">{event.description}</p>
                  <div className="event-meta">
                    <span>{event.time} hrs — {event.location}</span>
                  </div>
                  {event.ods.length > 0 && (
                    <div className="event-ods">
                      {event.ods.map((o) => (
                        <span className="tag-pill" key={o}>{o}</span>
                      ))}
                    </div>
                  )}
                  <div>
                    <div className="capacity-row">
                      <span>{count} inscritos</span>
                      <span>{event.maxAttendees} cupos</span>
                    </div>
                    <div className="capacity-bar">
                      <div className={`capacity-fill ${barClass}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <button
                    className={registered ? 'btn btn-ghost' : full ? 'btn btn-ghost' : 'btn btn-primary'}
                    disabled={full}
                    onClick={() => handleToggle(event)}
                    style={{ justifyContent: 'center', opacity: full ? 0.5 : 1, cursor: full ? 'not-allowed' : 'pointer' }}
                  >
                    {registered ? '✓ Inscrito — click para cancelar' : full ? 'Cupo lleno' : 'Inscribirme →'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
