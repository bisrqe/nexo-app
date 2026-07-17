import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { GROUPS } from '../data/groups.js'
import { useSaved } from '../context/SavedContext.jsx'

export default function Comunidad() {
  const { isGroupSaved, toggleGroup } = useSaved()

  return (
    <DashboardLayout
      eyebrow="Comunidad"
      title="Mesas de trabajo"
      subtitle="Espacios acotados por ODS o sector — no un timeline infinito. Únete a las que te interesan."
    >
      <div className="page-grid">
        {GROUPS.map((g) => {
          const joined = isGroupSaved(g.id)
          return (
            <div className="group-card" key={g.id}>
              <div className="group-top">
                <div>
                  <div className="group-name">{g.name}</div>
                  <div className="group-meta">{g.odsLabel} — {g.members} miembros</div>
                </div>
              </div>
              <p className="group-desc">{g.desc}</p>
              <p className="group-recent">"{g.recent}"</p>
              <div className="group-foot">
                <button
                  className={joined ? 'btn btn-ghost' : 'btn btn-primary'}
                  onClick={() => toggleGroup(g.id)}
                >
                  {joined ? '✓ Ya eres parte' : 'Unirme →'}
                </button>
                {joined && <Link to="/app/mensajes" className="link-arrow">Ir al chat →</Link>}
              </div>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
