import React, { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_PROFILE } from '../data/currentUser.js'

// Perfil de quien usa el dashboard. Sin backend: vive en este navegador
// (localStorage), pero a diferencia del resto de los formularios "demo"
// del sitio, este SÍ se guarda de verdad — es lo que alimenta la tarjeta
// del sidebar y la página de Ajustes.
const STORAGE_KEY = 'nexo:profile:v1'

const ProfileContext = createContext(null)

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROFILE
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_PROFILE, ...parsed }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(readStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // localStorage puede fallar en modo privado — no es crítico, se pierde al recargar.
    }
  }, [profile])

  const updateProfile = (patch) => setProfile((p) => ({ ...p, ...patch }))

  const value = { profile, updateProfile }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile debe usarse dentro de <ProfileProvider>')
  return ctx
}
