import React, { createContext, useCallback, useContext, useState } from 'react'

// Avisos no bloqueantes (errores, confirmaciones) en el lenguaje visual
// del resto de la app — reemplaza los alert() nativos, que rompen la
// continuidad visual justo en los momentos donde más importa dar confianza.
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, { type = 'error', duration = 5000 } = {}) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((list) => [...list, { id, message, type }])
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const dismissToast = (id) => setToasts((list) => list.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className={`toast toast-${t.type}`} key={t.id}>
            <span>{t.message}</span>
            <button type="button" className="toast-close" onClick={() => dismissToast(t.id)} aria-label="Cerrar aviso">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
