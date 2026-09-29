import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { doc, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'
import { ADMIN_EMAILS } from '../data/admins.js'

const AuthContext = createContext(null)

// Dominio de las páginas que resuelven los enlaces de los correos de
// Firebase Auth (ver src/pages/auth-action/). nexohub.mx debe estar en la
// lista de "Authorized domains" del proyecto de Firebase Auth, o el envío
// falla con auth/unauthorized-continue-uri.
const AUTH_ACTION_URL = 'https://nexohub.mx'

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
  const resendVerificationEmail = () => auth.currentUser && sendEmailVerification(auth.currentUser, {
    url: `${AUTH_ACTION_URL}/auth/verificar-correo`,
  })
  const sendPasswordReset = (email) => sendPasswordResetEmail(auth, email, {
    url: `${AUTH_ACTION_URL}/auth/restablecer-contrasena`,
  })
  const isAdmin = Boolean(user && ADMIN_EMAILS.includes(user.email))

  // Requiere la contraseña porque Firebase exige un login "reciente" para
  // borrar una cuenta — sin esto tira auth/requires-recent-login. Borra el
  // documento de perfil ANTES del usuario de Auth: las reglas de Firestore
  // necesitan la sesión todavía activa para autorizar ese borrado.
  const deleteAccount = async (password) => {
    const current = auth.currentUser
    if (!current) return
    const credential = EmailAuthProvider.credential(current.email, password)
    await reauthenticateWithCredential(current, credential)
    await deleteDoc(doc(db, 'profiles', current.uid))
    await deleteUser(current)
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, signUp, signIn, signOutUser, resendVerificationEmail, sendPasswordReset, deleteAccount, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
