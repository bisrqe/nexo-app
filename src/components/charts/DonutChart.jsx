import React from 'react'

const DEFAULT_COLORS = ['#04448B', '#5962A4', '#FFD77F', '#8A6100', '#101B26', '#8FA6C4']

// Dona hecha con conic-gradient (sin SVG ni librerías) + leyenda con el
// desglose exacto — mismo patrón de datos [{label, value}] que BarChart.
export default function DonutChart({ data, colors = DEFAULT_COLORS, emptyLabel = 'Todavía no hay datos.' }) {
  if (!data || data.length === 0) {
    return <p className="kpi-empty">{emptyLabel}</p>
  }

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  let acc = 0
  const segments = data.map((d, i) => {
    const start = (acc / total) * 360
    acc += d.value
    const end = (acc / total) * 360
    return { ...d, start, end, pct: (d.value / total) * 100, color: colors[i % colors.length] }
  })
  const gradient = segments.map((s) => `${s.color} ${s.start}deg ${s.end}deg`).join(', ')

  return (
    <div className="kpi-donut-wrap">
      <div className="kpi-donut" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="kpi-donut-hole">
          <span className="kpi-donut-total">{total}</span>
        </div>
      </div>
      <ul className="kpi-legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span className="kpi-dot" style={{ background: s.color }} />
            {s.label} <b>{s.value}</b> <span className="kpi-legend-pct">({s.pct.toFixed(0)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
