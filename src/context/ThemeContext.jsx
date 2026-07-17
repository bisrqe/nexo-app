import React, { createContext, useContext, useEffect, useState } from 'react'

// Controla el modo oscuro del dashboard (todo lo que vive bajo /app).
// Se guarda en este navegador con localStorage — no hay cuenta ni backend
// detrás, así que la preferencia no viaja entre dispositivos todavía.
const STORAGE_KEY = 'nexo:theme:v1'

const ThemeContext = createContext(null)

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // localStorage puede fallar en modo privado — no es crítico, se pierde al recargar.
    }
  }, [theme])

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}
