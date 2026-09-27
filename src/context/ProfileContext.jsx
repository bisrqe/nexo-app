import React, { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { DEFAULT_PROFILE } from '../data/currentUser.js'
import { useAuth } from './AuthContext.jsx'

// Perfil de quien usa el dashboard. Vive en Firestore, en profiles/{uid} —
// un documento por cuenta real. Sin sesión, se expone DEFAULT_PROFILE de
// solo lectura para que las páginas públicas que llaman a useProfile() no
// truenen (ej. la vista previa de "nueva iniciativa" fuera del dashboard).
const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(DEFAULT_PROFILE)
      setProfileLoading(false)
      return
    }
    setProfileLoading(true)
    const ref = doc(db, 'profiles', user.uid)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setProfile(snap.exists() ? { ...DEFAULT_PROFILE, ...snap.data() } : DEFAULT_PROFILE)
        setProfileLoading(false)
      },
      () => setProfileLoading(false)
    )
    return unsub
  }, [user])

  const updateProfile = async (patch) => {
    if (!user) return
    await setDoc(doc(db, 'profiles', user.uid), patch, { merge: true })
  }

  // Unirse/salir de una mesa de trabajo — a diferencia de "guardado" (que
  // solo vive en este navegador), esto queda en el perfil real para que
  // el conteo de miembros y el panel de KPIs reflejen membresías de verdad.
  const toggleJoinedGroup = async (groupId) => {
    if (!user) return
    const joined = profile.joinedGroups?.includes(groupId)
    await updateDoc(doc(db, 'profiles', user.uid), {
      joinedGroups: joined ? arrayRemove(groupId) : arrayUnion(groupId),
    })
  }

  const value = { profile, updateProfile, profileLoading, toggleJoinedGroup }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile debe usarse dentro de <ProfileProvider>')
  return ctx
}
