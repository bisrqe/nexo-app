import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { EVENTS } from '../data/events.js'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function EventosPublicos() {
  const events = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date))

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
          {events.length === 0 ? (
            <div className="empty-state"><p>Todavía no hay eventos programados.</p></div>
          ) : (
            <div className="page-grid">
              {events.map((event) => {
                const pct = Math.min(100, Math.round((event.attendees / event.maxAttendees) * 100))
                const barClass = pct >= 90 ? 'high' : pct >= 70 ? 'mid' : ''
                return (
                  <div className="event-card" key={event.id}>
                    <div className="event-stripe" />
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
                          <span>{event.attendees} inscritos</span>
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
