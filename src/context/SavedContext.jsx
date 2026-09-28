import React, { createContext, useContext, useEffect, useState } from 'react'

// "Guardar" un emprendimiento es un marcador personal, solo de este
// navegador (no hay backend detrás, ni falta que le hace). Unirse a una
// mesa de trabajo, inscribirse a un evento o marcar "me interesa" en un
// emprendimiento SÍ son reales — viven en Firestore (ver ProfileContext,
// Eventos.jsx e InitiativeDetail.jsx respectivamente).
const STORAGE_KEY = 'nexo:saved:v1'

const SavedContext = createContext(null)

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { initiatives: [] }
    const parsed = JSON.parse(raw)
    return { initiatives: parsed.initiatives ?? [] }
  } catch {
    return { initiatives: [] }
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

  const toggleInitiative = (slug) => {
    setSaved((prev) => {
      const list = prev.initiatives
      const next = list.includes(slug) ? list.filter((x) => x !== slug) : [...list, slug]
      return { ...prev, initiatives: next }
    })
  }

  const value = {
    saved,
    toggleInitiative,
    isInitiativeSaved: (slug) => saved.initiatives.includes(slug),
  }

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved() {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved debe usarse dentro de <SavedProvider>')
  return ctx
}
