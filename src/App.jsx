import React, { Suspense, lazy, useEffect } from 'react'
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
import VerifyEmail from './pages/auth-action/VerifyEmail.jsx'
import ResetPassword from './pages/auth-action/ResetPassword.jsx'
import RecoverEmail from './pages/auth-action/RecoverEmail.jsx'
import RevertMfaEnrollment from './pages/auth-action/RevertMfaEnrollment.jsx'
import ActionDispatcher from './pages/auth-action/ActionDispatcher.jsx'
import NotFound from './pages/NotFound.jsx'

// Zona post-login — todo vive bajo /app/*, con el shell de Sidebar. Cada
// página se carga bajo demanda (lazy): antes todo el dashboard viajaba en un
// solo paquete de más de 1 MB, y abrir cualquier página esperaba a bajarlo
// completo — en una conexión lenta eso era justo lo que hacía tardar el
// dashboard.
const Tutorial = lazy(() => import('./pages/Tutorial.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Iniciativas = lazy(() => import('./pages/Iniciativas.jsx'))
const Personas = lazy(() => import('./pages/Personas.jsx'))
const PersonProfile = lazy(() => import('./pages/PersonProfile.jsx'))
const Recursos = lazy(() => import('./pages/Recursos.jsx'))
const Comunidad = lazy(() => import('./pages/Comunidad.jsx'))
const GroupDetail = lazy(() => import('./pages/GroupDetail.jsx'))
const Eventos = lazy(() => import('./pages/Eventos.jsx'))
const Mensajes = lazy(() => import('./pages/Mensajes.jsx'))
const Saved = lazy(() => import('./pages/Saved.jsx'))
const Ajustes = lazy(() => import('./pages/Ajustes.jsx'))
const MyInitiative = lazy(() => import('./pages/MyInitiative.jsx'))
const AdminKPIs = lazy(() => import('./pages/AdminKPIs.jsx'))
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
      <Suspense fallback={<div className="auth-section"><p className="auth-sub">Cargando…</p></div>}>
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

        {/* ── Enlaces de acción de Firebase Auth (correos automáticos) ── */}
        <Route path="/auth/verificar-correo" element={<VerifyEmail />} />
        <Route path="/auth/restablecer-contrasena" element={<ResetPassword />} />
        <Route path="/auth/recuperar-correo" element={<RecoverEmail />} />
        <Route path="/auth/verificacion-dos-pasos" element={<RevertMfaEnrollment />} />
        <Route path="/auth/accion" element={<ActionDispatcher />} />

        {/* ── Zona post-login — separada de la landing, requiere sesión ── */}
        <Route path="/app/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/app/iniciativas" element={<RequireAuth><Iniciativas /></RequireAuth>} />
        <Route path="/app/mi-iniciativa" element={<RequireAuth><MyInitiative /></RequireAuth>} />
        <Route path="/app/iniciativas/nueva" element={<RequireAuth><NewInitiative variant="app" /></RequireAuth>} />
        <Route path="/app/iniciativas/:slug/editar" element={<RequireAuth><NewInitiative variant="app" /></RequireAuth>} />
        <Route path="/app/iniciativas/:slug" element={<RequireAuth><InitiativeDetail variant="app" /></RequireAuth>} />
        <Route path="/app/personas" element={<RequireAuth><Personas /></RequireAuth>} />
        <Route path="/app/personas/:slug" element={<RequireAuth><PersonProfile /></RequireAuth>} />
        <Route path="/app/recursos" element={<RequireAuth><Recursos /></RequireAuth>} />
        <Route path="/app/comunidad" element={<RequireAuth><Comunidad /></RequireAuth>} />
        <Route path="/app/comunidad/:slug" element={<RequireAuth><GroupDetail /></RequireAuth>} />
        <Route path="/app/eventos" element={<RequireAuth><Eventos /></RequireAuth>} />
        <Route path="/app/mensajes" element={<RequireAuth><Mensajes /></RequireAuth>} />
        <Route path="/app/guardado" element={<RequireAuth><Saved /></RequireAuth>} />
        <Route path="/app/tutorial" element={<RequireAuth><Tutorial /></RequireAuth>} />
        <Route path="/app/ajustes" element={<RequireAuth><Ajustes /></RequireAuth>} />
        <Route path="/app/admin" element={<RequireAuth><RequireAdmin><AdminKPIs /></RequireAdmin></RequireAuth>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <Chatbot />
    </>
  )
}
