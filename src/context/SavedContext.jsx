import React, { createContext, useContext, useEffect, useState } from 'react'

// No hay backend: "guardar" algo solo lo recuerda en este navegador
// (localStorage), no en ninguna base de datos ni cuenta de usuario.
// (Unirse a una mesa de trabajo sí es real — vive en profiles/{uid}.joinedGroups,
// ver ProfileContext.jsx.)
const STORAGE_KEY = 'nexo:saved:v1'

const SavedContext = createContext(null)

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { initiatives: [], events: [] }
    const parsed = JSON.parse(raw)
    return {
      initiatives: parsed.initiatives ?? [],
      events: parsed.events ?? [],
    }
  } catch {
    return { initiatives: [], events: [] }
  }
}

export function SavedProvider({ children }) {
  const [saved, setSaved] = useState(readStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // localStorage puede fallar en modo privado — no es crítico.
    }
  }, [saved])

  const toggle = (bucket, id) => {
    setSaved((prev) => {
      const list = prev[bucket]
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
      return { ...prev, [bucket]: next }
    })
  }

  const value = {
    saved,
    toggleInitiative: (slug) => toggle('initiatives', slug),
    toggleEvent: (id) => toggle('events', id),
    isInitiativeSaved: (slug) => saved.initiatives.includes(slug),
    isEventSaved: (id) => saved.events.includes(id),
  }

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved() {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved debe usarse dentro de <SavedProvider>')
  return ctx
}
