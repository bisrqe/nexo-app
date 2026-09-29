import React, { useMemo, useState } from 'react'
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import DashboardLayout from '../components/DashboardLayout.jsx'
import EventDetailModal from '../components/EventDetailModal.jsx'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { CITIES, getCityName } from '../data/cities.js'
import { EVENT_CATEGORIES } from '../data/eventCategories.js'
import { normalizeUrl } from '../lib/url.js'
import { isVirtualEvent, callLinkFor } from '../lib/eventLocation.js'

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

function excerpt(text, max = 140) {
  if (!text || text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

const EMPTY_EVENT = {
  title: '', date: '', time: '', locationType: 'fisico', location: '', mapsUrl: '', callUrl: '',
  city: '', category: EVENT_CATEGORIES[0], ods: '', description: '', maxAttendees: 30,
}

export default function Eventos() {
  const { user } = useAuth()
  const { addEvent, updateEvent, deleteEvent } = useUserContent()
  const { profile } = useProfile()
  const [realEvents] = useFirestoreCollection('events')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [cityFilter, setCityFilter] = useState(profile.city || '')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_EVENT)
  const [editingEventId, setEditingEventId] = useState(null)
  const [activeEventId, setActiveEventId] = useState(null)

  const allEvents = useMemo(
    () => [...realEvents].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [realEvents]
  )
  const activeEvent = activeEventId ? allEvents.find((e) => e.docId === activeEventId) : null

  const handleToggle = async (event) => {
    if (!user) return
    const registered = (event.attendees || []).includes(user.uid)
    await updateDoc(doc(db, 'events', event.docId), {
      attendees: registered ? arrayRemove(user.uid) : arrayUnion(user.uid),
    })
  }

  const handleFormChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleUrlBlur = (e) => {
    const { name, value } = e.target
    const normalized = normalizeUrl(value)
    if (normalized !== value) setForm((f) => ({ ...f, [name]: normalized }))
  }

  const resetForm = () => {
    setForm(EMPTY_EVENT)
    setEditingEventId(null)
    setShowForm(false)
  }

  const openEditForm = (event) => {
    setActiveEventId(null)
    setForm({
      title: event.title || '',
      date: event.date || '',
      time: event.time || '',
      locationType: event.locationType || (isVirtualEvent(event) ? 'virtual' : 'fisico'),
      location: event.location || '',
      mapsUrl: event.mapsUrl || '',
      callUrl: event.callUrl || callLinkFor(event),
      city: event.city || '',
      category: event.category || EVENT_CATEGORIES[0],
      ods: (event.ods || []).join(', '),
      description: event.description || '',
      maxAttendees: event.maxAttendees || 30,
    })
    setEditingEventId(event.docId)
    setShowForm(true)
  }

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`¿Seguro que quieres cancelar "${event.title}"? Esto lo borra para siempre y ya no se les avisa a los inscritos.`)) return
    await deleteEvent(event.docId)
    if (activeEventId === event.docId) setActiveEventId(null)
    if (editingEventId === event.docId) resetForm()
  }

  const handleSubmitEvent = async (e) => {
    e.preventDefault()
    if (!form.title || !form.date) return
    const isVirtual = form.locationType === 'virtual'
    const payload = {
      title: form.title,
      date: form.date,
      time: form.time || '00:00',
      locationType: form.locationType,
      location: isVirtual ? '' : (form.location || 'Por definir'),
      mapsUrl: isVirtual ? '' : normalizeUrl(form.mapsUrl),
      callUrl: isVirtual ? normalizeUrl(form.callUrl) : '',
      city: form.city,
      category: form.category || 'Otro',
      ods: form.ods ? form.ods.split(',').map((s) => s.trim()).filter(Boolean) : [],
      description: form.description || 'Sin descripción.',
      maxAttendees: Number(form.maxAttendees) || 30,
    }
    if (editingEventId) {
      await updateEvent(editingEventId, payload)
    } else {
      await addEvent({ ...payload, attendees: [] })
    }
    resetForm()
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return allEvents.filter((e) => {
      const matchQ = !q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      const matchCat = category === 'Todos' || e.category === category
      const isRemote = e.city === 'remoto'
      const matchCity = !cityFilter || isRemote || e.city === cityFilter
      return matchQ && matchCat && matchCity
    })
  }, [allEvents, query, category, cityFilter])

  return (
    <DashboardLayout
      eyebrow="Comunidad"
      title="Eventos"
      subtitle="Talleres, hackathons y pitch days — donde el mapa se vuelve conversación real."
    >
      <div className="filters">
        <button className={`chip ${!cityFilter ? 'active' : ''}`} onClick={() => setCityFilter('')}>
          Todas las zonas
        </button>
        {CITIES.map((c) => (
          <button key={c.id} className={`chip ${cityFilter === c.id ? 'active' : ''}`} onClick={() => setCityFilter(c.id)}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="filters" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <input
          className="search-input"
          type="text"
          placeholder="Buscar eventos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="filters" style={{ marginBottom: 0 }}>
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
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button type="button" className="btn btn-primary" onClick={() => (showForm ? resetForm() : setShowForm(true))}>
          {showForm ? 'Cancelar' : 'Crear evento +'}
        </button>
      </div>

      {showForm && (
        <div className="settings-card" style={{ marginBottom: 32 }}>
          <h2>{editingEventId ? 'Editar evento' : 'Nuevo evento'}</h2>
          <p className="settings-card-desc">Queda visible para todo el mapa en cuanto lo publicas.</p>
          <form onSubmit={handleSubmitEvent} className="auth-form">
            <div className="form-row">
              <label className="form-field">
                <span>Título</span>
                <input type="text" name="title" required value={form.title} onChange={handleFormChange} placeholder="Ej. Taller de branding social" />
              </label>
              <label className="form-field">
                <span>Categoría</span>
                <select name="category" value={form.category} onChange={handleFormChange}>
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
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
                <span>Modalidad</span>
                <select name="locationType" value={form.locationType} onChange={handleFormChange}>
                  <option value="fisico">Presencial</option>
                  <option value="virtual">Videollamada</option>
                </select>
              </label>
              <label className="form-field">
                <span>Ciudad / región</span>
                <select name="city" value={form.city} onChange={handleFormChange}>
                  <option value="">Selecciona una ciudad</option>
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
            </div>
            {form.locationType === 'virtual' ? (
              <label className="form-field">
                <span>Liga de la videollamada</span>
                <input type="text" name="callUrl" value={form.callUrl} onChange={handleFormChange} onBlur={handleUrlBlur} placeholder="zoom.us/mi-sala" />
              </label>
            ) : (
              <div className="form-row">
                <label className="form-field">
                  <span>Ubicación</span>
                  <input type="text" name="location" value={form.location} onChange={handleFormChange} placeholder="Ej. Venture Café Monterrey" />
                </label>
                <label className="form-field">
                  <span>Liga de mapa (opcional)</span>
                  <input type="text" name="mapsUrl" value={form.mapsUrl} onChange={handleFormChange} onBlur={handleUrlBlur} placeholder="maps.google.com/..." />
                </label>
              </div>
            )}
            <label className="form-field">
              <span>Cupo máximo</span>
              <input type="number" name="maxAttendees" min="1" value={form.maxAttendees} onChange={handleFormChange} />
            </label>
            <label className="form-field">
              <span>ODS relacionados (separados por coma)</span>
              <input type="text" name="ods" value={form.ods} onChange={handleFormChange} placeholder="Ej. ODS 4, ODS 9" />
            </label>
            <label className="form-field">
              <span>Descripción</span>
              <textarea name="description" rows={3} value={form.description} onChange={handleFormChange} placeholder="¿De qué trata el evento?" />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-gold btn-lg" style={{ justifyContent: 'center' }}>
                {editingEventId ? 'Guardar cambios →' : 'Publicar evento →'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state"><p>No encontramos eventos con ese criterio.</p></div>
      ) : (
        <div className="page-grid">
          {filtered.map((event) => {
            const registered = Boolean(user && event.attendees?.includes(user.uid))
            const count = event.attendees?.length || 0
            const pct = Math.min(100, Math.round((count / event.maxAttendees) * 100))
            const full = count >= event.maxAttendees && !registered
            const barClass = pct >= 90 ? 'high' : pct >= 70 ? 'mid' : ''
            const virtual = isVirtualEvent(event)
            const callLink = callLinkFor(event)
            const isOwner = Boolean(user && event.ownerUid === user.uid)

            return (
              <div className="event-card" key={event.docId}>
                <div className={`event-stripe ${registered ? 'registered' : ''}`} />
                <div className="event-body">
                  <div className="event-top">
                    <span className="event-cat">{event.category}</span>
                    <span className="event-date">{formatDate(event.date)}</span>
                  </div>
                  <button type="button" className="event-title" style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setActiveEventId(event.docId)}>
                    {event.title}
                  </button>
                  <p className="event-desc">{excerpt(event.description)}</p>
                  <div className="event-meta">
                    <span>
                      {event.time} hrs —{' '}
                      {virtual
                        ? (callLink
                          ? <a href={callLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Unirse a la llamada →</a>
                          : 'Liga por confirmar')
                        : event.location}
                    </span>
                    {!virtual && event.mapsUrl && (
                      <span><a href={event.mapsUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Ver en el mapa →</a></span>
                    )}
                    {event.city && <span>{getCityName(event.city)}</span>}
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
                  <div className="form-actions" style={{ marginTop: 0 }}>
                    {isOwner ? (
                      <>
                        <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEditForm(event)}>
                          Editar evento
                        </button>
                        <button className="btn btn-ghost-danger" onClick={() => handleDeleteEvent(event)}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        className={registered ? 'btn btn-ghost' : full ? 'btn btn-ghost' : 'btn btn-primary'}
                        disabled={full}
                        onClick={() => handleToggle(event)}
                        style={{ flex: 1, justifyContent: 'center', opacity: full ? 0.5 : 1, cursor: full ? 'not-allowed' : 'pointer' }}
                      >
                        {registered ? '✓ Inscrito — click para cancelar' : full ? 'Cupo lleno' : 'Inscribirme →'}
                      </button>
                    )}
                    <button type="button" className="btn btn-ghost" onClick={() => setActiveEventId(event.docId)}>Ver más</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeEvent && (
        <EventDetailModal
          event={activeEvent}
          currentUser={user}
          onClose={() => setActiveEventId(null)}
          onToggleAttend={handleToggle}
          onEdit={openEditForm}
          onDelete={handleDeleteEvent}
        />
      )}
    </DashboardLayout>
  )
}
