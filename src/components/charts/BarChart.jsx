import React from 'react'

// Barras horizontales simples con CSS — nada de librerías de gráficas:
// los datos ya vienen como [{label, value}], así que solo hace falta
// escalar contra el máximo y pintar el ancho.
export default function BarChart({ data, color = 'var(--navy)', emptyLabel = 'Todavía no hay datos.' }) {
  if (!data || data.length === 0) {
    return <p className="kpi-empty">{emptyLabel}</p>
  }
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="kpi-bars">
      {data.map((d) => (
        <div className="kpi-bar-row" key={d.label}>
          <span className="kpi-bar-label">{d.label}</span>
          <div className="kpi-bar-track">
            <div className="kpi-bar-fill" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
          <span className="kpi-bar-value">{d.value}</span>
        </div>
      ))}
    </div>
  )
}
