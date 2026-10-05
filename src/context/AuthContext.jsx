import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { doc, deleteDoc } from 'firebase/firestore'
import { auth, db, functions } from '../lib/firebase.js'
import { ADMIN_EMAILS, RESOURCE_APPROVER_EMAILS } from '../data/admins.js'

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
  // El correo mismo (y el link de acción con handleCodeInApp:true que
  // manda a src/pages/auth-action/) se genera y manda desde funtions/
  // index.js con el Admin SDK — así usamos nuestra propia plantilla de
  // marca en vez de la genérica que Firebase manda por su cuenta.
  const resendVerificationEmail = () => auth.currentUser && httpsCallable(functions, 'sendVerificationEmail')()
  const sendPasswordReset = (email) => httpsCallable(functions, 'sendPasswordResetLink')({ email })
  const isAdmin = Boolean(user && ADMIN_EMAILS.includes(user.email))
  const isResourceApprover = Boolean(user && RESOURCE_APPROVER_EMAILS.includes(user.email))

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
    <AuthContext.Provider value={{ user, authLoading, signUp, signIn, signOutUser, resendVerificationEmail, sendPasswordReset, deleteAccount, isAdmin, isResourceApprover }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
