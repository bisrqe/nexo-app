import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { useGroupMessages } from '../hooks/useGroupMessages.js'
import { useDirectMessages } from '../context/DirectMessagesContext.jsx'
import { useConversationMessages } from '../hooks/useConversationMessages.js'
import { initials } from '../data/currentUser.js'

function formatTime(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
}

export default function Mensajes() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const { groups, sendGroupMessage } = useGroups()
  const { conversations, getOrCreateConversation, sendDirectMessage } = useDirectMessages()
  const [searchParams, setSearchParams] = useSearchParams()

  const myGroups = groups.filter((g) => profile.joinedGroups?.includes(g.docId))
  const [activeKey, setActiveKey] = useState(null)
  const [draft, setDraft] = useState('')

  // Se puede llegar aquí desde "Enviar mensaje" en un perfil (?to=uid) o
  // desde "Ir al chat" en una mesa de trabajo (?group=id) — en ambos casos
  // se abre esa conversación de una vez.
  useEffect(() => {
    const to = searchParams.get('to')
    const groupId = searchParams.get('group')
    if (groupId) {
      setActiveKey(`group:${groupId}`)
      setSearchParams({}, { replace: true })
      return
    }
    if (!to) return
    let cancelled = false
    getOrCreateConversation(to).then((convId) => {
      if (cancelled || !convId) return
      setActiveKey(`dm:${convId}`)
      setSearchParams({}, { replace: true })
    })
    return () => { cancelled = true }
  }, [searchParams])

  useEffect(() => {
    if (activeKey) return
    if (myGroups.length > 0) setActiveKey(`group:${myGroups[0].docId}`)
    else if (conversations.length > 0) setActiveKey(`dm:${conversations[0].docId}`)
  }, [activeKey, myGroups.length, conversations.length])

  const activeGroup = activeKey?.startsWith('group:') ? myGroups.find((g) => `group:${g.docId}` === activeKey) : null
  const activeConv = activeKey?.startsWith('dm:') ? conversations.find((c) => `dm:${c.docId}` === activeKey) : null
  const otherUid = activeConv ? activeConv.participants.find((p) => p !== user.uid) : null
  const otherName = activeConv ? activeConv.participantNames?.[otherUid] || 'Cuenta eliminada' : ''

  const groupMessages = useGroupMessages(activeGroup?.docId)
  const directMessages = useConversationMessages(activeConv?.docId)

  const nothingToShow = myGroups.length === 0 && conversations.length === 0

  const handleSend = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    if (activeGroup) sendGroupMessage(activeGroup.docId, draft)
    else if (activeConv) sendDirectMessage(activeConv.docId, draft)
    else return
    setDraft('')
  }

  if (nothingToShow) {
    return (
      <DashboardLayout
        eyebrow="Comunidad"
        title="Mensajes"
        subtitle="Chats con mesas de trabajo y conversaciones directas con otras personas de la red."
      >
        <div className="empty-state">
          <p>Todavía no tienes ninguna conversación. Únete a una mesa de trabajo o escríbele a alguien desde su perfil.</p>
          <Link to="/app/comunidad" className="link-arrow">Unirme a una mesa de trabajo →</Link>
          <Link to="/app/personas" className="link-arrow" style={{ marginTop: 8 }}>Explorar el directorio →</Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      eyebrow="Comunidad"
      title="Mensajes"
      subtitle="Directos y mesas de trabajo — todo queda guardado de verdad."
    >
      <div className="messages-shell">
        <div className="conv-list">
          {conversations.length > 0 && (
            <>
              <div className="conv-list-heading">Directos</div>
              {conversations.map((c) => {
                const other = c.participants.find((p) => p !== user.uid)
                const name = c.participantNames?.[other] || 'Cuenta eliminada'
                return (
                  <button
                    key={c.docId}
                    className={`conv-item ${activeKey === `dm:${c.docId}` ? 'active' : ''}`}
                    onClick={() => setActiveKey(`dm:${c.docId}`)}
                  >
                    <span className="conv-name">{name}</span>
                    <span className="conv-meta conv-preview">{c.lastMessage || 'Sin mensajes todavía'}</span>
                  </button>
                )
              })}
            </>
          )}

          {myGroups.length > 0 && (
            <>
              <div className="conv-list-heading">Mesas de trabajo</div>
              {myGroups.map((g) => (
                <button
                  key={g.docId}
                  className={`conv-item ${activeKey === `group:${g.docId}` ? 'active' : ''}`}
                  onClick={() => setActiveKey(`group:${g.docId}`)}
                >
                  <span className="conv-name">{g.name}</span>
                  <span className="conv-meta conv-preview">{g.lastMessage || g.industryLabel}</span>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="chat-pane">
          {activeGroup ? (
            <>
              <div className="chat-header">
                <div className="group-name person-name">{activeGroup.name}</div>
                <span className="conv-meta">{activeGroup.industryLabel}</span>
              </div>

              <div className="chat-messages">
                {groupMessages.length === 0 ? (
                  <p className="dash-empty">Todavía no hay mensajes en esta mesa. Sé quien abra la conversación.</p>
                ) : (
                  groupMessages.map((m) => (
                    <div className={`msg-bubble ${m.senderUid === user.uid ? 'self' : ''}`} key={m.id}>
                      <div className="msg-author">{m.senderUid === user.uid ? 'Tú' : m.senderName}</div>
                      <div className="msg-text">{m.text}</div>
                      <div className="msg-time">{formatTime(m.createdAt)}</div>
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
          ) : activeConv ? (
            <>
              <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="person-avatar" style={{ width: 32, height: 32, fontSize: 13, marginBottom: 0 }}>{initials(otherName)}</div>
                <div className="group-name person-name">{otherName}</div>
              </div>

              <div className="chat-messages">
                {directMessages.length === 0 ? (
                  <p className="dash-empty">Todavía no hay mensajes — sé quien abra la conversación.</p>
                ) : (
                  directMessages.map((m) => (
                    <div className={`msg-bubble ${m.senderUid === user.uid ? 'self' : ''}`} key={m.id}>
                      <div className="msg-author">{m.senderUid === user.uid ? 'Tú' : otherName}</div>
                      <div className="msg-text">{m.text}</div>
                      <div className="msg-time">{formatTime(m.createdAt)}</div>
                    </div>
                  ))
                )}
              </div>

              <form className="chat-input-row" onSubmit={handleSend}>
                <input
                  className="search-input"
                  type="text"
                  placeholder={`Escribe algo para ${otherName}...`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>Enviar</button>
              </form>
            </>
          ) : (
            <div className="chat-empty">Elige una conversación de la izquierda.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
