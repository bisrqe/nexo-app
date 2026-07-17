import React from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { RESOURCE_GROUPS } from '../data/resources.js'

export default function Recursos() {
  return (
    <DashboardLayout
      eyebrow="Aprovechar lo que ya existe"
      title="Recursos"
      subtitle="Mentoría, fondeo, herramientas y aliados institucionales disponibles para la comunidad."
    >
      {RESOURCE_GROUPS.map((group) => (
        <div className="resource-group" key={group.type}>
          <h3>{group.type}</h3>
          <div className="page-grid">
            {group.items.map((item) => (
              <div className="resource-card" key={item.id}>
                <div className="resource-title">{item.title}</div>
                <div className="resource-org">{item.org}</div>
                <p className="resource-desc">{item.desc}</p>
                <span className="resource-tag">{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </DashboardLayout>
  )
}
