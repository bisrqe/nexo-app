import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { PROFILE_TYPES } from '../data/profileOptions.js'
import { kindFor } from '../lib/initiativeKind.js'
import { rankForProfile, rankMentorsForProfile } from '../lib/recommend.js'

const GREETING = { role: 'assistant', content: '¡Hola! Soy el asistente de Nexo. Pregúntame cómo registrar tu emprendimiento, unirte a una mesa de trabajo, o cualquier otra duda sobre la plataforma.' }

// Arma un resumen corto y real (nombres, no inventado) de qué le conviene
// ver a esta cuenta ahora mismo — se manda como contexto al chatbot "de
// adentro" para que recomiende en vez de solo explicar la plataforma. Solo
// se llama al mandar un mensaje dentro del dashboard, no en cada render.
async function buildInsideContext(profile, groups) {
  const [initSnap, mentorSnap] = await Promise.all([
    getDocs(collection(db, 'initiatives')),
    getDocs(query(collection(db, 'profiles'), where('profileType', '==', 'mentor'))),
  ])
  const initiatives = initSnap.docs.map((d) => ({ ...d.data(), docId: d.id }))
  const mentors = mentorSnap.docs.map((d) => ({ ...d.data(), docId: d.id }))

  const rankedInitiatives = rankForProfile(initiatives, profile).slice(0, 4)
  const rankedMentors = profile.profileType === 'mentor' ? [] : rankMentorsForProfile(mentors, profile, 3)
  const rankedGroups = rankForProfile(groups, profile).slice(0, 3)

  return {
    name: profile.name,
    profileTypeLabel: PROFILE_TYPES.find((p) => p.id === profile.profileType)?.label || profile.profileType,
    industryLabel: profile.industryLabel,
    cause: profile.cause || profile.expertise || '',
    city: profile.city,
    recommended: {
      initiatives: rankedInitiatives.map((i) => ({
        title: i.title,
        kind: kindFor(i.ownerProfileType).noun,
        tag: i.industryLabel || i.odsLabel,
        need: (i.need || '').slice(0, 100),
      })),
      mentors: rankedMentors.map((m) => ({ name: m.name, expertise: (m.expertise || '').slice(0, 100) })),
      groups: rankedGroups.map((g) => ({ name: g.name, industryLabel: g.industryLabel })),
    },
  }
}

// Vive montado una sola vez en App.jsx (fuera de <Routes>), así que
// aparece igual en la landing pública y en todo el dashboard — pero se
// comporta distinto: dentro de /app conoce el perfil real de la cuenta y
// recomienda recursos/personas/emprendimientos concretos; fuera solo
// orienta sobre qué es Nexo, sin datos de nadie.
export default function Chatbot() {
  const location = useLocation()
  const { user } = useAuth()
  const { profile } = useProfile()
  const { groups } = useGroups()
  const isInside = user && location.pathname.startsWith('/app')

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, loading])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setError(false)
    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }))
    setMessages((m) => [...m, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const context = isInside ? await buildInsideContext(profile, groups) : null
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, history, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Error del servidor')
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(true)
      setMessages((m) => [...m, { role: 'assistant', content: 'No pude responder justo ahora — intenta de nuevo en un momento.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="nexo-chatbot">
      {open && (
        <div className="nexo-chatbot-panel">
          <div className="nexo-chatbot-header">
            <span>Asistente Nexo</span>
            <button type="button" className="nexo-chatbot-close" onClick={() => setOpen(false)} aria-label="Cerrar asistente">✕</button>
          </div>
          <div className="nexo-chatbot-body">
            {messages.map((m, i) => (
              <div key={i} className={`nexo-chatbot-msg nexo-chatbot-msg-${m.role}`}>{m.content}</div>
            ))}
            {loading && <div className="nexo-chatbot-msg nexo-chatbot-msg-assistant nexo-chatbot-typing">Escribiendo…</div>}
            <div ref={bottomRef} />
          </div>
          <form className="nexo-chatbot-input" onSubmit={send}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>Enviar</button>
          </form>
          {error && <p className="nexo-chatbot-error">Si el problema sigue, escríbenos directamente desde Ajustes.</p>}
        </div>
      )}
      <button
        type="button"
        className="nexo-chatbot-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Cerrar asistente de Nexo' : 'Abrir asistente de Nexo'}
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  )
}
