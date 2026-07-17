import React from 'react'
import Sidebar from './Sidebar.jsx'

export default function DashboardLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <header className="app-topbar">
          <div>
            {eyebrow && <span className="kicker">{eyebrow}</span>}
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </header>
        <div className="app-content">{children}</div>
      </div>
    </div>
  )
}
