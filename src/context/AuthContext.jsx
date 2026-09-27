import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../lib/firebase.js'
import { ADMIN_EMAILS } from '../data/admins.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password)
  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signOutUser = () => signOut(auth)
  const isAdmin = Boolean(user && ADMIN_EMAILS.includes(user.email))

  return (
    <AuthContext.Provider value={{ user, authLoading, signUp, signIn, signOutUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
