import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { GROUPS } from '../data/groups.js'
import { useSaved } from '../context/SavedContext.jsx'
import { useMessages } from '../context/MessagesContext.jsx'

export default function Mensajes() {
  const { saved } = useSaved()
  const { getMessages, sendMessage } = useMessages()
  const myGroups = GROUPS.filter((g) => saved.groups.includes(g.id))
  const [activeId, setActiveId] = useState(myGroups[0]?.id ?? null)
  const [draft, setDraft] = useState('')

  const activeGroup = myGroups.find((g) => g.id === activeId)
  const messages = activeGroup ? getMessages(activeGroup.id) : []

  const handleSend = (e) => {
    e.preventDefault()
    if (!activeGroup || !draft.trim()) return
    sendMessage(activeGroup.id, draft)
    setDraft('')
  }

  if (myGroups.length === 0) {
    return (
      <DashboardLayout
        eyebrow="Comunidad"
        title="Mensajes"
        subtitle="Un chat por cada mesa de trabajo a la que te unas — solo entre quienes son parte del grupo."
      >
        <div className="empty-state">
          <p>Todavía no te unes a ninguna mesa de trabajo, así que no hay ningún grupo de mensajes que mostrarte.</p>
          <Link to="/app/comunidad" className="link-arrow">Unirme a una mesa de trabajo →</Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      eyebrow="Comunidad"
      title="Mensajes"
      subtitle="Demo local: estos mensajes solo viven en tu navegador, todavía no hay backend detrás."
    >
      <div className="messages-shell">
        <div className="conv-list">
          {myGroups.map((g) => (
            <button
              key={g.id}
              className={`conv-item ${g.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(g.id)}
            >
              <span className="conv-name">{g.name}</span>
              <span className="conv-meta">{g.odsLabel} — {g.members} miembros</span>
            </button>
          ))}
        </div>

        <div className="chat-pane">
          {activeGroup ? (
            <>
              <div className="chat-header">
                <div className="group-name person-name">{activeGroup.name}</div>
                <span className="conv-meta">{activeGroup.odsLabel}</span>
              </div>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <p className="dash-empty">Todavía no hay mensajes en este grupo. Sé quien abra la conversación.</p>
                ) : (
                  messages.map((m) => (
                    <div className={`msg-bubble ${m.self ? 'self' : ''}`} key={m.id}>
                      <div className="msg-author">{m.author}</div>
                      <div className="msg-text">{m.text}</div>
                      <div className="msg-time">{m.time}</div>
                    </div>
                  ))
                )}
              </div>

              <form className="chat-input-row" onSubmit={handleSend}>
                <input
                  className="search-input"
                  type="text"
                  placeholder={`Escribe algo para ${activeGroup.name}...`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>Enviar</button>
              </form>
            </>
          ) : (
            <div className="chat-empty">Elige una mesa de trabajo de la izquierda.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
