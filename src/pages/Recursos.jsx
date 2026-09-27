import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { RESOURCE_REGIONS, RESOURCES } from '../data/resources.js'
import { useProfile } from '../context/ProfileContext.jsx'

const CITY_TO_REGION = { mty: 'mty', cdmx: 'cdmx', gdl: 'gdl' }

export default function Recursos() {
  const { profile } = useProfile()
  const [region, setRegion] = useState('nacional')
  const [touched, setTouched] = useState(false)

  // Si el perfil ya cargó y tiene una de las tres ciudades con recursos
  // propios, arranca ahí en vez de en "Nacional" — mismo criterio que el
  // resto del dashboard. Deja de aplicar en cuanto la persona elige una
  // pestaña por su cuenta.
  useEffect(() => {
    if (touched) return
    const match = CITY_TO_REGION[profile.city]
    if (match) setRegion(match)
  }, [profile.city, touched])

  const handleSelect = (id) => {
    setTouched(true)
    setRegion(id)
  }

  const items = RESOURCES[region] || []

  return (
    <DashboardLayout
      eyebrow="Aprovechar lo que ya existe"
      title="Recursos"
      subtitle="Convocatorias, financiamiento, mentoría y aceleración — por ciudad, más lo que aplica en todo el país."
    >
      <div className="filters">
        {RESOURCE_REGIONS.map((r) => (
          <button
            key={r.id}
            className={`chip ${region === r.id ? 'active' : ''}`}
            onClick={() => handleSelect(r.id)}
          >
            {r.name}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Todavía no tenemos recursos capturados para esta zona.</p>
        </div>
      ) : (
        <div className="page-grid">
          {items.map((item) => (
            <div className="resource-card" key={item.id}>
              <div className="resource-title">{item.title}</div>
              <div className="resource-org">{item.category}</div>
              <p className="resource-desc">{item.desc}</p>
              <a
                href={`https://${item.link}`}
                target="_blank"
                rel="noreferrer"
                className="resource-tag"
              >
                Visitar sitio →
              </a>
            </div>
          ))}
        </div>
      )}

      <p className="kpi-footnote" style={{ marginTop: 28 }}>
        Varias convocatorias son anuales; las que ya cerraron su edición 2026 quedan como referencia para la
        siguiente ventana. Confirma siempre montos, fechas y bases en el sitio oficial antes de aplicar, y
        desconfía de cualquiera que pida pagos por adelantado.
      </p>
    </DashboardLayout>
  )
}
