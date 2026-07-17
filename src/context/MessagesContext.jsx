import React, { createContext, useContext, useEffect, useState } from 'react'
import { SEED_MESSAGES } from '../data/messages.js'

// Chat por mesa de trabajo. Sin backend: cada navegador tiene su propia
// copia en localStorage, sembrada con un historial de ejemplo la primera
// vez que se abre cada grupo. Los mensajes que "envías" no le llegan a
// nadie más — es una demo de la interfaz, no mensajería real todavía.
const STORAGE_KEY = 'nexo:messages:v1'

const MessagesContext = createContext(null)

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function MessagesProvider({ children }) {
  const [byGroup, setByGroup] = useState(readStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(byGroup))
    } catch {
      // no es crítico si falla — se pierde al recargar, nada más.
    }
  }, [byGroup])

  const getMessages = (groupId) => byGroup[groupId] ?? SEED_MESSAGES[groupId] ?? []

  const sendMessage = (groupId, text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setByGroup((prev) => {
      const existing = prev[groupId] ?? SEED_MESSAGES[groupId] ?? []
      const next = [
        ...existing,
        { id: `local-${Date.now()}`, author: 'Tú', text: trimmed, time: 'ahora', self: true },
      ]
      return { ...prev, [groupId]: next }
    })
  }

  return (
    <MessagesContext.Provider value={{ getMessages, sendMessage }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error('useMessages debe usarse dentro de <MessagesProvider>')
  return ctx
}
