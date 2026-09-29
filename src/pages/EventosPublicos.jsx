import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { EVENT_CATEGORIES } from '../data/eventCategories.js'
import { isVirtualEvent, callLinkFor } from '../lib/eventLocation.js'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function EventosPublicos() {
  const [realEvents] = useFirestoreCollection('events')
  const [category, setCategory] = useState('Todos')
  const allEvents = useMemo(() => [...realEvents].sort((a, b) => a.date.localeCompare(b.date)), [realEvents])
  const events = useMemo(
    () => allEvents.filter((e) => category === 'Todos' || e.category === category),
    [allEvents, category]
  )

  return (
    <>
      <Header />

      <section>
        <div className="section-head">
          <div className="head-title">
            <span className="kicker">Comunidad</span>
            <h2>Eventos</h2>
            <p className="head-desc-below">Talleres, hackathons y pitch days — donde el mapa se vuelve conversación real.</p>
          </div>
        </div>

        <div className="in">
          <div className="filters">
            {['Todos', ...EVENT_CATEGORIES].map((cat) => (
              <button
                key={cat}
                className={`chip ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          {events.length === 0 ? (
            <div className="empty-state"><p>Todavía no hay eventos programados.</p></div>
          ) : (
            <div className="page-grid">
              {events.map((event) => {
                const count = event.attendees?.length || 0
                const pct = Math.min(100, Math.round((count / event.maxAttendees) * 100))
                const barClass = pct >= 90 ? 'high' : pct >= 70 ? 'mid' : ''
                const virtual = isVirtualEvent(event)
                const callLink = callLinkFor(event)
                return (
                  <div className="event-card" key={event.docId}>
                    <div className="event-stripe" />
                    <div className="event-body">
                      <div className="event-top">
                        <span className="event-cat">{event.category}</span>
                        <span className="event-date">{formatDate(event.date)}</span>
                      </div>
                      <div className="event-title">{event.title}</div>
                      <p className="event-desc">{event.description}</p>
                      <div className="event-meta">
                        <span>
                          {event.time} hrs —{' '}
                          {virtual
                            ? (callLink ? <a href={callLink} target="_blank" rel="noreferrer">Unirse a la llamada →</a> : 'Liga por confirmar')
                            : event.location}
                        </span>
                        {!virtual && event.mapsUrl && (
                          <span><a href={event.mapsUrl} target="_blank" rel="noreferrer">Ver en el mapa →</a></span>
                        )}
                      </div>
                      {event.ods?.length > 0 && (
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
                      <Link to="/register" className="btn btn-primary" style={{ justifyContent: 'center' }}>Regístrate para inscribirte →</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
