import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireAuth({ children }) {
  const { user, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) {
    return (
      <div className="auth-section">
        <p className="auth-sub">Cargando…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
