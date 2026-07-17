import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NewInitiative from './pages/NewInitiative.jsx'
import InitiativeDetail from './pages/InitiativeDetail.jsx'
import NotFound from './pages/NotFound.jsx'

// React Router doesn't scroll for you. This mimics normal <a href="#x">
// behaviour: scroll to the hash target on route change, otherwise go top.
function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        // wait a frame so the new page has painted before measuring position
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
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/iniciativas/nueva" element={<NewInitiative />} />
        <Route path="/iniciativas/:slug" element={<InitiativeDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
