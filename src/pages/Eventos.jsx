import React, { useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { EVENTS } from '../data/events.js'
import { useSaved } from '../context/SavedContext.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

const EMPTY_EVENT = {
  title: '', date: '', time: '', location: '', category: '', ods: '', description: '', maxAttendees: 30,
}

export default function Eventos() {
  const { isEventSaved, toggleEvent } = useSaved()
  const { myEvents, addEvent } = useUserContent()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_EVENT)

  const allEvents = useMemo(() => [...EVENTS, ...myEvents], [myEvents])

  const [counts, setCounts] = useState(() => Object.fromEntries(EVENTS.map((e) => [e.id, e.attendees])))

  const categories = ['Todos', ...new Set(allEvents.map((e) => e.category).filter(Boolean))]

  const handleToggle = (event) => {
    const wasRegistered = isEventSaved(event.id)
    toggleEvent(event.id)
    setCounts((c) => ({ ...c, [event.id]: (c[event.id] ?? event.attendees) + (wasRegistered ? -1 : 1) }))
  }

  const handleFormChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleCreateEvent = (e) => {
    e.preventDefault()
    if (!form.title || !form.date) return
    const newEvent = {
      id: `local-${Date.now()}`,
      title: form.title,
      date: form.date,
      time: form.time || '00:00',
      location: form.location || 'Por definir',
      category: form.category || 'Otro',
      ods: form.ods ? form.ods.split(',').map((s) => s.trim()).filter(Boolean) : [],
      description: form.description || 'Sin descripción.',
      attendees: 0,
      maxAttendees: Number(form.maxAttendees) || 30,
    }
    addEvent(newEvent)
    setCounts((c) => ({ ...c, [newEvent.id]: 0 }))
    setForm(EMPTY_EVENT)
    setShowForm(false)
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return allEvents.filter((e) => {
      const matchQ = !q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      const matchCat = category === 'Todos' || e.category === category
      return matchQ && matchCat
    })
  }, [allEvents, query, category])

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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
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
          <button type="button" className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : 'Crear evento +'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="settings-card" style={{ marginBottom: 32 }}>
          <h2>Nuevo evento</h2>
          <p className="settings-card-desc">Se agrega solo en este navegador — no hay backend detrás todavía.</p>
          <form onSubmit={handleCreateEvent} className="auth-form">
            <div className="form-row">
              <label className="form-field">
                <span>Título</span>
                <input type="text" name="title" required value={form.title} onChange={handleFormChange} placeholder="Ej. Taller de branding social" />
              </label>
              <label className="form-field">
                <span>Categoría</span>
                <input type="text" name="category" value={form.category} onChange={handleFormChange} placeholder="Ej. Taller" />
              </label>
            </div>
            <div className="form-row">
              <label className="form-field">
                <span>Fecha</span>
                <input type="date" name="date" required value={form.date} onChange={handleFormChange} />
              </label>
              <label className="form-field">
                <span>Hora</span>
                <input type="time" name="time" value={form.time} onChange={handleFormChange} />
              </label>
            </div>
            <div className="form-row">
              <label className="form-field">
                <span>Ubicación</span>
                <input type="text" name="location" value={form.location} onChange={handleFormChange} placeholder="Lugar o liga de videollamada" />
              </label>
              <label className="form-field">
                <span>Cupo máximo</span>
                <input type="number" name="maxAttendees" min="1" value={form.maxAttendees} onChange={handleFormChange} />
              </label>
            </div>
            <label className="form-field">
              <span>ODS relacionados (separados por coma)</span>
              <input type="text" name="ods" value={form.ods} onChange={handleFormChange} placeholder="Ej. ODS 4, ODS 9" />
            </label>
            <label className="form-field">
              <span>Descripción</span>
              <textarea name="description" rows={3} value={form.description} onChange={handleFormChange} placeholder="¿De qué trata el evento?" />
            </label>
            <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }}>Publicar evento →</button>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No encontramos eventos con ese criterio.</p></div>
      ) : (
        <div className="page-grid">
          {filtered.map((event) => {
            const registered = isEventSaved(event.id)
            const count = counts[event.id] ?? event.attendees
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
