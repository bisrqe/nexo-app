import React, { useEffect, useRef, useState } from 'react'

const GREETING = { role: 'assistant', content: '¡Hola! Soy el asistente de Nexo. Pregúntame cómo registrar tu emprendimiento, unirte a una mesa de trabajo, o cualquier otra duda sobre la plataforma.' }

// Vive montado una sola vez en App.jsx (fuera de <Routes>), así que
// aparece igual en la landing pública y en todo el dashboard.
export default function Chatbot() {
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
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
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
