import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

// Zona pública (landing) — usa Header/Footer, vive en rutas sueltas.
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NewInitiative from './pages/NewInitiative.jsx'
import InitiativeDetail from './pages/InitiativeDetail.jsx'
import NotFound from './pages/NotFound.jsx'

// Zona post-login — todo vive bajo /app/*, con el shell de Sidebar.
import Dashboard from './pages/Dashboard.jsx'
import Iniciativas from './pages/Iniciativas.jsx'
import Personas from './pages/Personas.jsx'
import PersonProfile from './pages/PersonProfile.jsx'
import Recursos from './pages/Recursos.jsx'
import Comunidad from './pages/Comunidad.jsx'
import Eventos from './pages/Eventos.jsx'
import Mensajes from './pages/Mensajes.jsx'
import Saved from './pages/Saved.jsx'

// React Router doesn't scroll for you. This mimics normal <a href="#x">
// behaviour: scroll to the hash target on route change, otherwise go top.
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }))
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        {/* ── Zona pública / landing ──────────────────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/iniciativas/nueva" element={<NewInitiative variant="public" />} />
        <Route path="/iniciativas/:slug" element={<InitiativeDetail variant="public" />} />

        {/* ── Zona post-login — separada de la landing ────────── */}
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/iniciativas" element={<Iniciativas />} />
        <Route path="/app/iniciativas/nueva" element={<NewInitiative variant="app" />} />
        <Route path="/app/iniciativas/:slug" element={<InitiativeDetail variant="app" />} />
        <Route path="/app/personas" element={<Personas />} />
        <Route path="/app/personas/:slug" element={<PersonProfile />} />
        <Route path="/app/recursos" element={<Recursos />} />
        <Route path="/app/comunidad" element={<Comunidad />} />
        <Route path="/app/eventos" element={<Eventos />} />
        <Route path="/app/mensajes" element={<Mensajes />} />
        <Route path="/app/guardado" element={<Saved />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
