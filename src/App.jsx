import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

// Zona pública (landing) — usa Header/Footer, vive en rutas sueltas.
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NewInitiative from './pages/NewInitiative.jsx'
import InitiativeDetail from './pages/InitiativeDetail.jsx'
import IniciativasPublicas from './pages/IniciativasPublicas.jsx'
import ComoFunciona from './pages/ComoFunciona.jsx'
import Nosotros from './pages/Nosotros.jsx'
import EventosPublicos from './pages/EventosPublicos.jsx'
import RecursosPublicos from './pages/RecursosPublicos.jsx'
import NotFound from './pages/NotFound.jsx'

// Zona post-login — todo vive bajo /app/*, con el shell de Sidebar.
import Dashboard from './pages/Dashboard.jsx'
import Iniciativas from './pages/Iniciativas.jsx'
import Personas from './pages/Personas.jsx'
import PersonProfile from './pages/PersonProfile.jsx'
import Recursos from './pages/Recursos.jsx'
import Comunidad from './pages/Comunidad.jsx'
import GroupDetail from './pages/GroupDetail.jsx'
import Eventos from './pages/Eventos.jsx'
import Mensajes from './pages/Mensajes.jsx'
import Saved from './pages/Saved.jsx'
import Ajustes from './pages/Ajustes.jsx'
import MyInitiative from './pages/MyInitiative.jsx'
import AdminKPIs from './pages/AdminKPIs.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import Chatbot from './components/Chatbot.jsx'

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
        <Route path="/iniciativas" element={<IniciativasPublicas />} />
        <Route path="/iniciativas/nueva" element={<NewInitiative variant="public" />} />
        <Route path="/iniciativas/:slug" element={<InitiativeDetail variant="public" />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/eventos" element={<EventosPublicos />} />
        <Route path="/recursos" element={<RecursosPublicos />} />

        {/* ── Zona post-login — separada de la landing, requiere sesión ── */}
        <Route path="/app/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/app/iniciativas" element={<RequireAuth><Iniciativas /></RequireAuth>} />
        <Route path="/app/mi-iniciativa" element={<RequireAuth><MyInitiative /></RequireAuth>} />
        <Route path="/app/iniciativas/nueva" element={<RequireAuth><NewInitiative variant="app" /></RequireAuth>} />
        <Route path="/app/iniciativas/:slug" element={<RequireAuth><InitiativeDetail variant="app" /></RequireAuth>} />
        <Route path="/app/personas" element={<RequireAuth><Personas /></RequireAuth>} />
        <Route path="/app/personas/:slug" element={<RequireAuth><PersonProfile /></RequireAuth>} />
        <Route path="/app/recursos" element={<RequireAuth><Recursos /></RequireAuth>} />
        <Route path="/app/comunidad" element={<RequireAuth><Comunidad /></RequireAuth>} />
        <Route path="/app/comunidad/:slug" element={<RequireAuth><GroupDetail /></RequireAuth>} />
        <Route path="/app/eventos" element={<RequireAuth><Eventos /></RequireAuth>} />
        <Route path="/app/mensajes" element={<RequireAuth><Mensajes /></RequireAuth>} />
        <Route path="/app/guardado" element={<RequireAuth><Saved /></RequireAuth>} />
        <Route path="/app/ajustes" element={<RequireAuth><Ajustes /></RequireAuth>} />
        <Route path="/app/admin" element={<RequireAuth><RequireAdmin><AdminKPIs /></RequireAdmin></RequireAuth>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Chatbot />
    </>
  )
}
