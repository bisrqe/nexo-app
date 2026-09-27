import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Va dentro de <RequireAuth> — ya sabemos que hay sesión, aquí solo se
// filtra a quien no sea cuenta admin, mandándola de vuelta al dashboard
// normal en vez de a /login.
export default function RequireAdmin({ children }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/app/dashboard" replace />
  return children
}
