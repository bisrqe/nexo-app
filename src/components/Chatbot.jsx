import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { PROFILE_TYPES } from '../data/profileOptions.js'
import { kindFor } from '../lib/initiativeKind.js'
import { rankForProfile, rankMentorsForProfile } from '../lib/recommend.js'
import { CHATBOT_FAQ, matchFaq, FAQ_FALLBACK, SUPPORT_EMAIL } from '../data/chatbotFaq.js'
import nexoIconWhite from '../assets/iconotipo-blanco.png'

const OUTSIDE_GREETING = { role: 'assistant', content: '¡Hola! Soy el asistente de Nexo. Puedo orientarte sobre qué es Nexo, cómo registrar tu emprendimiento, eventos y recursos. Si necesitas algo más puntual, escríbenos directo.' }
const INSIDE_GREETING = { role: 'assistant', content: '¡Hola! Soy el asistente de Nexo. Pregúntame cómo registrar tu emprendimiento, unirte a una mesa de trabajo, o cualquier otra duda sobre la plataforma.' }

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
  const { user, signOutUser } = useAuth()
  const { profile } = useProfile()
  const { groups } = useGroups()
  const isInside = user && location.pathname.startsWith('/app')

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(() => [isInside ? INSIDE_GREETING : OUTSIDE_GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [showMenu, setShowMenu] = useState(true)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, loading])

  // El chatbot vive montado una sola vez (ver abajo), así que isInside
  // puede cambiar por navegación sin que el componente se remonte — sin
  // esto, el saludo se quedaba congelado en lo que fuera cierto cuando se
  // montó por primera vez. Solo resetea si todavía no hay conversación
  // real, para no borrar algo que la persona ya está escribiendo.
  useEffect(() => {
    setMessages((m) => (m.length <= 1 ? [isInside ? INSIDE_GREETING : OUTSIDE_GREETING] : m))
  }, [isInside])

  // Fuera del dashboard, el bot responde con FAQ locales — sin red, sin
  // costo por token, y 100% predecible. Dentro del dashboard sigue usando
  // la API con contexto real de la cuenta (ver buildInsideContext arriba).
  const sendOutside = (text) => {
    const match = matchFaq(text)
    if (match) {
      setMessages((m) => [...m, { role: 'assistant', content: match.answer, link: match.link }])
    } else {
      setMessages((m) => [...m, { role: 'assistant', content: FAQ_FALLBACK.content, link: FAQ_FALLBACK.link }])
    }
  }

  // Atajo para las sugerencias que aparecen junto al saludo: evita
  // depender de matchFaq (que reconoce texto libre) cuando ya sabemos
  // exactamente qué entrada de la FAQ corresponde.
  const askSuggested = (entry) => {
    setShowMenu(false)
    setMessages((m) => [...m, { role: 'user', content: entry.prompt }, { role: 'assistant', content: entry.answer, link: entry.link }])
  }

  const handleLogoutFromChat = async () => {
    setShowMenu(false)
    await signOutUser()
    setMessages((m) => [...m, { role: 'assistant', content: 'Cerraste sesión correctamente. ¡Hasta pronto!' }])
  }

  const handleTalkToHuman = () => {
    setShowMenu(false)
    setMessages((m) => [
      ...m,
      { role: 'user', content: 'Quiero hablar con una persona' },
      { role: 'assistant', content: 'Claro — escríbenos directamente y alguien del equipo te responde:', link: { href: `mailto:${SUPPORT_EMAIL}`, label: SUPPORT_EMAIL } },
    ])
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    const text = feedbackText.trim()
    if (!text || feedbackSubmitting) return
    setFeedbackSubmitting(true)
    try {
      await addDoc(collection(db, 'feedback'), {
        message: text,
        uid: user?.uid || null,
        email: user?.email || null,
        page: location.pathname,
        createdAt: serverTimestamp(),
      })
      setMessages((m) => [...m, { role: 'assistant', content: '¡Gracias por tu retroalimentación! La leemos con atención.' }])
    } catch (err) {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: 'No pudimos enviar tu retroalimentación — intenta de nuevo o escríbenos directamente:',
        link: { href: `mailto:${SUPPORT_EMAIL}`, label: SUPPORT_EMAIL },
      }])
    } finally {
      setFeedbackSubmitting(false)
      setFeedbackOpen(false)
      setFeedbackText('')
    }
  }

  const sendInside = async (text, history) => {
    setLoading(true)
    try {
      const context = await buildInsideContext(profile, groups)
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
      setMessages((m) => [...m, { role: 'assistant', content: `No pude responder justo ahora — intenta de nuevo, o escríbenos a ${SUPPORT_EMAIL}.` }])
    } finally {
      setLoading(false)
    }
  }

  const send = (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    setError(false)
    setShowMenu(false)
    const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }))
    setMessages((m) => [...m, { role: 'user', content: text }])
    setInput('')
    if (isInside) {
      sendInside(text, history)
    } else {
      sendOutside(text)
    }
  }

  return (
    <div className="nexo-chatbot">
      {open && (
        <div className="nexo-chatbot-panel">
          <div className="nexo-chatbot-header">
            <span>Asistente Nexo</span>
            <div className="nexo-chatbot-header-actions">
              <button
                type="button"
                className="nexo-chatbot-menu-btn"
                onClick={() => { setFeedbackOpen(false); setShowMenu((v) => !v) }}
              >
                Menú
              </button>
              <button type="button" className="nexo-chatbot-close" onClick={() => setOpen(false)} aria-label="Cerrar asistente">✕</button>
            </div>
          </div>
          <div className="nexo-chatbot-body">
            {messages.map((m, i) => (
              <div key={i} className={`nexo-chatbot-msg nexo-chatbot-msg-${m.role}`}>
                {m.content}
                {m.link && (
                  m.link.to ? (
                    <Link to={m.link.to} className="nexo-chatbot-link" onClick={() => setOpen(false)}>{m.link.label}</Link>
                  ) : (
                    <a href={m.link.href} className="nexo-chatbot-link">{m.link.label}</a>
                  )
                )}
              </div>
            ))}
            {feedbackOpen ? (
              <form className="nexo-chatbot-feedback" onSubmit={handleFeedbackSubmit}>
                <label>
                  <span>Cuéntanos qué podemos mejorar</span>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tu retroalimentación…"
                    autoFocus
                  />
                </label>
                <div className="nexo-chatbot-feedback-actions">
                  <button type="submit" disabled={feedbackSubmitting || !feedbackText.trim()}>
                    {feedbackSubmitting ? 'Enviando…' : 'Enviar'}
                  </button>
                  <button type="button" onClick={() => { setFeedbackOpen(false); setFeedbackText('') }}>Cancelar</button>
                </div>
              </form>
            ) : showMenu ? (
              <div className="nexo-chatbot-suggestions">
                <p className="nexo-chatbot-suggestions-label">
                  {isInside ? 'También puedes:' : 'Puedes preguntarme cosas como:'}
                </p>
                <ul>
                  {!isInside && CHATBOT_FAQ.map((entry) => (
                    <li key={entry.id}>
                      <button type="button" onClick={() => askSuggested(entry)}>{entry.prompt}</button>
                    </li>
                  ))}
                  {isInside && (
                    <li><button type="button" onClick={handleTalkToHuman}>Hablar con una persona</button></li>
                  )}
                  <li><button type="button" onClick={() => setFeedbackOpen(true)}>Enviar retroalimentación</button></li>
                  {!isInside && user && (
                    <li><button type="button" onClick={handleLogoutFromChat}>Cerrar sesión</button></li>
                  )}
                </ul>
              </div>
            ) : null}
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
          {error && <p className="nexo-chatbot-error">Si el problema sigue, escríbenos directamente.</p>}
          <p className="nexo-chatbot-footnote">¿Prefieres escribirnos? <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
        </div>
      )}
      <button
        type="button"
        className="nexo-chatbot-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Cerrar asistente de Nexo' : 'Abrir asistente de Nexo'}
      >
        {open ? '✕' : <img src={nexoIconWhite} alt="" width="22" height="22" />}
      </button>
    </div>
  )
}
