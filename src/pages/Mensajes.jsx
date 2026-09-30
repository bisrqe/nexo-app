import React, { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { useGroupMessages } from '../hooks/useGroupMessages.js'
import { useDirectMessages } from '../context/DirectMessagesContext.jsx'
import { useConversationMessages } from '../hooks/useConversationMessages.js'
import { uploadFile } from '../lib/uploads.js'
import { initials } from '../data/currentUser.js'
import { useToast } from '../context/ToastContext.jsx'

function formatTime(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })
}

function Attachment({ url, name, type }) {
  if (!url) return null
  if (type?.startsWith('image/')) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="msg-attachment">
        <img src={url} alt={name} />
      </a>
    )
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="msg-attachment msg-attachment-file">
      📎 {name}
    </a>
  )
}

export default function Mensajes() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const { groups, sendGroupMessage } = useGroups()
  const { conversations, getOrCreateConversation, sendDirectMessage } = useDirectMessages()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()

  const myGroups = groups.filter((g) => profile.joinedGroups?.includes(g.docId))
  const [activeKey, setActiveKey] = useState(null)
  const [draft, setDraft] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

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

  const send = async (file) => {
    if (activeGroup) await sendGroupMessage(activeGroup.docId, draft, file)
    else if (activeConv) await sendDirectMessage(activeConv.docId, draft, file)
    setDraft('')
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!draft.trim() || uploading) return
    send()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || (!activeGroup && !activeConv)) return
    setUploading(true)
    try {
      const folder = activeGroup ? `groups/${activeGroup.docId}` : `conversations/${activeConv.docId}`
      const uploaded = await uploadFile(folder, file)
      await send(uploaded)
    } catch {
      // No mostramos err.message aquí a propósito — puede traer texto
      // crudo de Firebase/Storage que no significa nada para quien
      // escribe el chat. Un toast en vez de alert() para no bloquear
      // la conversación con un diálogo nativo.
      showToast('No se pudo subir el archivo. Intenta de nuevo en un momento.')
    } finally {
      setUploading(false)
    }
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

  const activeName = activeGroup ? activeGroup.name : otherName
  const messages = activeGroup ? groupMessages : directMessages

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
          {activeGroup || activeConv ? (
            <>
              <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {activeConv && (
                  <div className="person-avatar" style={{ width: 32, height: 32, fontSize: 13, marginBottom: 0 }}>{initials(otherName)}</div>
                )}
                <div>
                  <div className="group-name person-name">{activeName}</div>
                  {activeGroup && <span className="conv-meta">{activeGroup.industryLabel}</span>}
                </div>
              </div>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <p className="dash-empty">Todavía no hay mensajes — sé quien abra la conversación.</p>
                ) : (
                  messages.map((m) => (
                    <div className={`msg-bubble ${m.senderUid === user.uid ? 'self' : ''}`} key={m.id}>
                      <div className="msg-author">{m.senderUid === user.uid ? 'Tú' : (m.senderName || otherName)}</div>
                      {m.text && <div className="msg-text">{m.text}</div>}
                      {m.fileUrl && <Attachment url={m.fileUrl} name={m.fileName} type={m.fileType} />}
                      <div className="msg-time">{formatTime(m.createdAt)}</div>
                    </div>
                  ))
                )}
              </div>

              <form className="chat-input-row" onSubmit={handleSend}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />
                <button
                  type="button"
                  className="btn btn-ghost chat-attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  aria-label="Adjuntar archivo"
                  title="Adjuntar archivo"
                >
                  📎
                </button>
                <input
                  className="search-input"
                  type="text"
                  placeholder={uploading ? 'Subiendo archivo…' : `Escribe algo para ${activeName}...`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={uploading}
                />
                <button type="submit" className="btn btn-primary" disabled={!draft.trim() || uploading}>Enviar</button>
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
