import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { getCityName } from '../data/cities.js'
import { EVENT_REPORT_REASONS } from '../data/eventCategories.js'
import { useProfilesByUids } from '../lib/useProfilesByUids.js'
import { isVirtualEvent, callLinkFor } from '../lib/eventLocation.js'

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Vista expandida de un evento: lugar (con liga de mapa o de llamada),
// fecha, resumen completo, quién lo organiza, contacto y denuncia — la
// tarjeta de la lista solo muestra un resumen corto de esto mismo.
export default function EventDetailModal({ event, currentUser, onClose, onToggleAttend, onEdit }) {
  const navigate = useNavigate()
  const [showAttendees, setShowAttendees] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [reportReason, setReportReason] = useState(EVENT_REPORT_REASONS[0])
  const [reportDetails, setReportDetails] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [sendingReport, setSendingReport] = useState(false)

  const [organizer] = useProfilesByUids(event.ownerUid ? [event.ownerUid] : [])
  const attendeeProfiles = useProfilesByUids(showAttendees ? event.attendees || [] : [])

  const isOwner = Boolean(currentUser && event.ownerUid === currentUser.uid)
  const registered = Boolean(currentUser && event.attendees?.includes(currentUser.uid))
  const count = event.attendees?.length || 0
  const full = count >= event.maxAttendees && !registered
  const virtual = isVirtualEvent(event)
  const callLink = callLinkFor(event)

  const handleSendReport = async (e) => {
    e.preventDefault()
    if (!currentUser || sendingReport) return
    setSendingReport(true)
    try {
      await addDoc(collection(db, 'eventReports'), {
        eventId: event.docId,
        eventTitle: event.title,
        reporterUid: currentUser.uid,
        reason: reportReason,
        details: reportDetails.trim(),
        createdAt: serverTimestamp(),
      })
      setReportSent(true)
      setReporting(false)
    } catch {
      alert('No se pudo enviar la denuncia, intenta de nuevo.')
    } finally {
      setSendingReport(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="event-top">
          <span className="event-cat">{event.category}</span>
          <span className="event-date">{formatDate(event.date)}</span>
        </div>
        <h2 className="modal-title">{event.title}</h2>

        <div className="event-meta" style={{ marginBottom: 4 }}>
          <span>{event.time} hrs</span>
          {virtual ? (
            callLink ? (
              <a href={callLink} target="_blank" rel="noreferrer" className="link-arrow">Unirse a la llamada →</a>
            ) : (
              <span>Videollamada — liga por confirmar</span>
            )
          ) : (
            <span>
              {event.location || 'Por definir'}
              {event.mapsUrl && (
                <> — <a href={event.mapsUrl} target="_blank" rel="noreferrer" className="link-arrow">Ver en el mapa →</a></>
              )}
            </span>
          )}
          {event.city && <span>{getCityName(event.city)}</span>}
        </div>

        <div className="dossier-section">
          <span className="kicker">Acerca del evento</span>
          <p className="modal-desc">{event.description}</p>
        </div>

        {event.ods?.length > 0 && (
          <div className="event-ods">
            {event.ods.map((o) => <span className="tag-pill" key={o}>{o}</span>)}
          </div>
        )}

        <div className="dossier-card">
          <span className="kicker">Organizado por</span>
          <div className="dossier-contact">
            <div className="dossier-contact-person">
              <span className="dossier-avatar" style={{ width: 44, height: 44, fontSize: 14 }}>
                {organizer?.photo ? <img src={organizer.photo} alt="" /> : initials(organizer?.name)}
              </span>
              <div>
                <div className="dossier-contact-name">{organizer?.name || 'Organizador/a'}</div>
                {organizer?.username && <div className="dossier-contact-role">@{organizer.username}</div>}
              </div>
            </div>
            <div className="dossier-contact-actions">
              {!isOwner && currentUser && event.ownerUid && (
                <button type="button" className="btn btn-ghost" onClick={() => navigate(`/app/mensajes?to=${event.ownerUid}`)}>
                  Contactar al anfitrión →
                </button>
              )}
              {isOwner && (
                <button type="button" className="btn btn-ghost" onClick={() => onEdit(event)}>
                  Editar evento
                </button>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="dossier-card">
            <div className="capacity-row">
              <span className="kicker" style={{ marginBottom: 0 }}>Inscritos</span>
              <button type="button" className="link-arrow" onClick={() => setShowAttendees((v) => !v)}>
                {showAttendees ? 'Ocultar' : `Ver los ${count} inscritos →`}
              </button>
            </div>
            {showAttendees && (
              count === 0 ? (
                <p className="settings-card-desc" style={{ marginTop: 10 }}>Todavía nadie se ha inscrito.</p>
              ) : (
                <ul className="resource-link-list" style={{ marginTop: 10 }}>
                  {attendeeProfiles.map((p) => (
                    <li key={p.uid}>
                      <span>{p.name}{p.username ? ` · @${p.username}` : ''}</span>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}

        <div className="form-actions">
          {currentUser && !isOwner && (
            <button
              className={registered ? 'btn btn-ghost' : full ? 'btn btn-ghost' : 'btn btn-primary'}
              disabled={full}
              onClick={() => onToggleAttend(event)}
              style={{ opacity: full ? 0.5 : 1, cursor: full ? 'not-allowed' : 'pointer' }}
            >
              {registered ? '✓ Inscrito — click para cancelar' : full ? 'Cupo lleno' : 'Inscribirme →'}
            </button>
          )}
          {currentUser && !isOwner && !reportSent && (
            <button type="button" className="btn btn-ghost-danger" onClick={() => setReporting((v) => !v)}>
              Denunciar evento
            </button>
          )}
        </div>

        {reportSent && <p className="settings-card-desc">Gracias, ya recibimos tu denuncia.</p>}

        {reporting && (
          <form className="auth-form" onSubmit={handleSendReport} style={{ marginTop: 4 }}>
            <label className="form-field">
              <span>Motivo</span>
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                {EVENT_REPORT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Detalles (opcional)</span>
              <textarea rows={3} value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Cuéntanos qué pasó" />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={sendingReport}>
                {sendingReport ? 'Enviando…' : 'Enviar denuncia'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setReporting(false)}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
