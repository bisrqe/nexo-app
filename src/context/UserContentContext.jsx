import React, { createContext, useContext, useEffect, useState } from 'react'

// Contenido creado por quien usa el dashboard: eventos y mesas de trabajo
// que agrega, y su propia iniciativa. Sin backend: vive en este navegador
// (localStorage), igual que "Guardado".
const STORAGE_KEY = 'nexo:userContent:v1'

const UserContentContext = createContext(null)

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { events: [], groups: [], myInitiative: null }
    const parsed = JSON.parse(raw)
    return {
      events: parsed.events ?? [],
      groups: parsed.groups ?? [],
      myInitiative: parsed.myInitiative ?? null,
    }
  } catch {
    return { events: [], groups: [], myInitiative: null }
  }
}

export function UserContentProvider({ children }) {
  const [state, setState] = useState(readStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage puede fallar en modo privado — no es crítico, se pierde al recargar.
    }
  }, [state])

  const addEvent = (event) => {
    setState((s) => ({ ...s, events: [...s.events, event] }))
  }

  const addGroup = (group) => {
    setState((s) => ({ ...s, groups: [...s.groups, group] }))
  }

  const setMyInitiative = (initiative) => {
    setState((s) => ({ ...s, myInitiative: initiative }))
  }

  const value = {
    myEvents: state.events,
    addEvent,
    myGroups: state.groups,
    addGroup,
    myInitiative: state.myInitiative,
    setMyInitiative,
  }

  return <UserContentContext.Provider value={value}>{children}</UserContentContext.Provider>
}

export function useUserContent() {
  const ctx = useContext(UserContentContext)
  if (!ctx) throw new Error('useUserContent debe usarse dentro de <UserContentProvider>')
  return ctx
}
