import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'
import { PROFILE_TYPES, STUDENT_SUBTYPES } from '../data/profileOptions.js'
import { ODS_FILTERS } from '../data/initiatives.js'
import { getRegionName, profileRegion, locationLabel, isRemoteItem } from '../data/cities.js'
import { flattenResources } from '../data/resources.js'
import { SUPPORT_EMAIL as SUPPORT_ACCOUNT_EMAIL, isSupportProfile } from '../data/admins.js'
import { SUPPORT_GROUP_ID, SUPPORT_GROUP_SLUG } from '../data/supportGroup.js'
import { kindFor } from '../lib/initiativeKind.js'
import { buildRecommendations } from '../lib/recommend.js'
import { CHATBOT_FAQ, matchFaq, FAQ_FALLBACK, SUPPORT_EMAIL } from '../data/chatbotFaq.js'
import nexoIconWhite from '../assets/iconotipo-blanco.png'

const OUTSIDE_GREETING = { role: 'assistant', content: '¡Hola! Soy el asistente de Nexo. Puedo orientarte sobre qué es Nexo, cómo registrar tu emprendimiento, eventos y recursos. Si necesitas algo más puntual, escríbenos directo.' }
const INSIDE_GREETING = { role: 'assistant', content: '¡Hola! Soy el asistente de Nexo. Conozco tu perfil: pregúntame qué emprendimientos, eventos, mesas de trabajo, mentores o recursos te convienen, o cualquier duda sobre cómo usar la plataforma.' }

const BUILT_IN_RESOURCES = flattenResources()
const DATA_TTL_MS = 60 * 1000
let dataCache = null

// Lee de Firestore lo que el chatbot necesita para recomendar — emprendimientos,
// eventos, mentores y recursos reales de la plataforma. Se guarda un minuto
// en memoria para que varias preguntas seguidas no vuelvan a leer todo. Cada
// lectura es independiente: si una falla (permisos, red) el bot sigue
// recomendando con lo demás en vez de caerse.
async function loadPlatformData() {
  if (dataCache && Date.now() - dataCache.at < DATA_TTL_MS) return dataCache.data
  const read = (q) => getDocs(q).then((snap) => snap.docs.map((d) => ({ ...d.data(), docId: d.id })))
  const [initiatives, events, mentors, customResources] = await Promise.allSettled([
    read(collection(db, 'initiatives')),
    read(collection(db, 'events')),
    read(query(collection(db, 'profiles'), where('profileType', '==', 'mentor'))),
    read(collection(db, 'resources')),
  ]).then((results) => results.map((r) => (r.status === 'fulfilled' ? r.value : [])))
  const data = { initiatives, events, mentors, customResources }
  dataCache = { at: Date.now(), data }
  return data
}

const short = (text, n) => (text || '').slice(0, n)

// Arma el contexto real de la cuenta — su perfil completo y lo que Nexo le
// recomienda hoy (el MISMO cálculo que el dashboard: buildRecommendations) —
// para que el chatbot "de adentro" recomiende emprendimientos, eventos,
// mesas de trabajo, mentores y recursos concretos en vez de solo explicar la
// plataforma. Nunca manda el género de la cuenta: las recomendaciones ya
// vienen adaptadas, y el modelo no necesita saberlo. Solo se llama al mandar
// un mensaje dentro del dashboard, no en cada render.
async function buildInsideContext(profile, groups, uid, myInitiatives) {
  const { initiatives, events, mentors, customResources } = await loadPlatformData()
  const today = new Date().toISOString().slice(0, 10)

  const recommended = buildRecommendations({
    profile,
    initiatives: initiatives.filter((i) => !(i.memberUids || []).includes(uid)),
    events: events.filter((e) => !e.date || e.date >= today),
    groups: groups.filter((g) => g.docId !== SUPPORT_GROUP_ID),
    mentors: mentors.filter((m) => !isSupportProfile(m)),
    resources: [...BUILT_IN_RESOURCES, ...customResources.filter((r) => !r.status || r.status === 'approved')],
    limits: { initiatives: 5, events: 4, groups: 3, mentors: 3, resources: 4 },
  })

  const baseTypeLabel = PROFILE_TYPES.find((p) => p.id === profile.profileType)?.label || profile.profileType
  const subtypeLabel = profile.profileType === 'estudiante' ? STUDENT_SUBTYPES.find((s) => s.id === profile.subtype)?.label : ''
  const secondaryLabel = profile.profileType === 'estudiante' && profile.secondaryProfile
    ? PROFILE_TYPES.find((p) => p.id === profile.secondaryProfile)?.label
    : ''
  const profileTypeLabel = [baseTypeLabel, subtypeLabel, secondaryLabel].filter(Boolean).join(' · ')

  return {
    name: profile.name,
    profileTypeLabel,
    occupation: profile.occupation,
    industryLabel: profile.industryLabel,
    industrySecondaryLabel: profile.industrySecondaryLabel,
    odsLabel: ODS_FILTERS.find((f) => f.id === profile.interests?.[0])?.label || '',
    cause: profile.causeLabel || profile.expertise || '',
    advisoryOffer: short(profile.advisoryOffer, 160),
    region: getRegionName(profileRegion(profile)),
    city: profile.cityName || '',
    bio: short(profile.bio, 240),
    lookingFor: short(profile.lookingFor, 160),
    ownProjects: myInitiatives.map((i) => ({
      title: i.title,
      kind: kindFor(i.ownerProfileType, i.ownerProfileSubtype).noun,
      stage: i.stage,
      need: short(i.need, 100),
    })),
    recommended: {
      initiatives: recommended.initiatives.map((i) => ({
        title: i.title,
        kind: kindFor(i.ownerProfileType, i.ownerProfileSubtype).noun,
        stage: i.stage,
        tag: i.industryLabel || i.causeLabel || i.odsLabel,
        need: short(i.need, 100),
        location: locationLabel(i),
        remote: isRemoteItem(i),
      })),
      events: recommended.events.map((e) => ({
        title: e.title,
        date: e.date,
        category: e.category,
        location: isRemoteItem(e) ? 'En línea' : locationLabel(e),
      })),
      groups: recommended.groups.map((g) => ({ name: g.name, industryLabel: g.industryLabel })),
      mentors: recommended.mentors.map((m) => ({ name: m.name, expertise: short(m.expertise, 100) })),
      resources: recommended.resources.map((r) => ({ title: r.title, category: r.category, link: r.link })),
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
  const navigate = useNavigate()
  const { user, signOutUser } = useAuth()
  const { profile } = useProfile()
  const { groups } = useGroups()
  const { myInitiatives } = useUserContent()
  const isInside = user && location.pathname.startsWith('/app')

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [greeting, setGreeting] = useState(true)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, loading, greeting])

  // El chatbot vive montado una sola vez (ver abajo), así que isInside
  // puede cambiar por navegación sin que el componente se remonte — sin
  // esto, el saludo se quedaba congelado en lo que fuera cierto cuando se
  // montó por primera vez. Solo resetea si todavía no hay conversación
  // real, para no borrar algo que la persona ya está escribiendo. El
  // saludo tarda un momento en aparecer (como si "pensara") y el menú de
  // sugerencias solo aparece después, no junto con el saludo.
  useEffect(() => {
    setMessages((m) => (m.length <= 1 ? [] : m))
    setShowMenu(false)
    setGreeting(true)
    const t = setTimeout(() => {
      setMessages((m) => (m.length === 0 ? [isInside ? INSIDE_GREETING : OUTSIDE_GREETING] : m))
      setGreeting(false)
      setShowMenu(true)
    }, 700)
    return () => clearTimeout(t)
  }, [isInside])

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  // Fuera del dashboard, el bot responde con FAQ locales — sin red, sin
  // costo por token, y 100% predecible. Dentro del dashboard sigue usando
  // la API con contexto real de la cuenta (ver buildInsideContext arriba).
  const sendOutside = async (text) => {
    setLoading(true)
    await wait(600)
    const match = matchFaq(text)
    if (match) {
      setMessages((m) => [...m, { role: 'assistant', content: match.answer, link: match.link }])
    } else {
      setMessages((m) => [...m, { role: 'assistant', content: FAQ_FALLBACK.content, link: FAQ_FALLBACK.link }])
    }
    setLoading(false)
    setShowMenu(true)
  }

  // Atajo para las sugerencias que aparecen junto al saludo: evita
  // depender de matchFaq (que reconoce texto libre) cuando ya sabemos
  // exactamente qué entrada de la FAQ corresponde.
  const askSuggested = async (entry) => {
    setShowMenu(false)
    setMessages((m) => [...m, { role: 'user', content: entry.prompt }])
    setLoading(true)
    await wait(600)
    setMessages((m) => [...m, { role: 'assistant', content: entry.answer, link: entry.link }])
    setLoading(false)
    setShowMenu(true)
  }

  const handleLogoutFromChat = async () => {
    setShowMenu(false)
    setLoading(true)
    await signOutUser()
    await wait(500)
    setMessages((m) => [...m, { role: 'assistant', content: 'Cerraste sesión correctamente. ¡Hasta pronto!' }])
    setLoading(false)
    setShowMenu(true)
  }

  // Lleva al chat privado con la cuenta de soporte. Su uid se busca por
  // correo (esa cuenta no aparece en ningún directorio).
  const handleTalkToSupport = async () => {
    setShowMenu(false)
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'profiles'), where('email', '==', SUPPORT_ACCOUNT_EMAIL)))
      const supportUid = snap.docs[0]?.id
      if (!supportUid) throw new Error('sin soporte')
      setOpen(false)
      navigate(`/app/mensajes?to=${supportUid}`)
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'No pude abrir el chat con soporte ahora mismo. Intenta de nuevo en un momento o escribe en la mesa de dudas y onboarding.', link: { to: `/app/comunidad/${SUPPORT_GROUP_SLUG}`, label: 'Ir a la mesa de dudas' } }])
    } finally {
      setLoading(false)
      setShowMenu(true)
    }
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
        content: 'No pudimos enviar tu retroalimentación, intenta de nuevo o escríbenos directamente:',
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
      const context = await buildInsideContext(profile, groups, user?.uid, myInitiatives)
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
      setMessages((m) => [...m, { role: 'assistant', content: `No pude responder justo ahora, intenta de nuevo, o escríbenos a ${SUPPORT_EMAIL}.` }])
    } finally {
      setLoading(false)
      setShowMenu(true)
    }
  }

  const submit = (text) => {
    if (!text || loading || greeting) return
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

  const send = (e) => {
    e.preventDefault()
    submit(input.trim())
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
                    <li><button type="button" onClick={handleTalkToSupport}>Hablar con soporte (chat privado)</button></li>
                  )}
                  {isInside && (
                    <li><button type="button" onClick={() => submit('¿Qué me recomiendas según mi perfil?')}>¿Qué me recomiendas?</button></li>
                  )}
                  {isInside && (
                    <li>
                      <Link to={`/app/comunidad/${SUPPORT_GROUP_SLUG}`} onClick={() => setOpen(false)}>Mesa de dudas y onboarding</Link>
                    </li>
                  )}
                  <li><button type="button" onClick={() => setFeedbackOpen(true)}>Enviar retroalimentación</button></li>
                  {!isInside && user && (
                    <li><button type="button" onClick={handleLogoutFromChat}>Cerrar sesión</button></li>
                  )}
                </ul>
              </div>
            ) : null}
            {(loading || greeting) && <div className="nexo-chatbot-msg nexo-chatbot-msg-assistant nexo-chatbot-typing">Escribiendo…</div>}
            <div ref={bottomRef} />
          </div>
          <form className="nexo-chatbot-input" onSubmit={send}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              disabled={loading || greeting}
            />
            <button type="submit" disabled={loading || greeting || !input.trim()}>Enviar</button>
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
