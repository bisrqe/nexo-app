import React, { useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout.jsx'
import BarChart from '../components/charts/BarChart.jsx'
import DonutChart from '../components/charts/DonutChart.jsx'
import { useFirestoreCollection } from '../hooks/useFirestoreCollection.js'
import { computeKpis } from '../lib/kpis.js'

export default function AdminKPIs() {
  const profiles = useFirestoreCollection('profiles')
  const initiatives = useFirestoreCollection('initiatives')
  const events = useFirestoreCollection('events')
  const conversations = useFirestoreCollection('conversations')
  const groups = useFirestoreCollection('groups')
  const [downloading, setDownloading] = useState(false)

  const kpis = useMemo(
    () => computeKpis({ profiles, initiatives, events, conversations, groups }),
    [profiles, initiatives, events, conversations, groups]
  )
  const { totals } = kpis

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { downloadKpiPdf } = await import('../lib/pdfReport.js')
      await downloadKpiPdf(kpis)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <DashboardLayout
      eyebrow="Solo admin"
      title="Panel de KPIs"
      subtitle="Métricas reales de la plataforma — perfiles, emprendimientos y eventos guardados en Firestore. No incluye el contenido de ejemplo del catálogo."
    >
      <div className="kpi-toolbar">
        <button type="button" className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Generando PDF…' : 'Descargar reporte en PDF →'}
        </button>
      </div>

      <div className="kpi-stat-grid">
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.profiles}</span>
          <span className="kpi-stat-label">Miembros registrados</span>
        </div>
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.initiatives}</span>
          <span className="kpi-stat-label">Emprendimientos activos</span>
        </div>
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.events}</span>
          <span className="kpi-stat-label">Eventos creados</span>
        </div>
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.interest}</span>
          <span className="kpi-stat-label">Total de "Me interesa"</span>
        </div>
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.connections}</span>
          <span className="kpi-stat-label">Conexiones realizadas</span>
        </div>
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.connectedPeople}</span>
          <span className="kpi-stat-label">Personas que interactuaron entre sí</span>
        </div>
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.cities}</span>
          <span className="kpi-stat-label">Ciudades con actividad</span>
        </div>
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.directConversations}</span>
          <span className="kpi-stat-label">Chats directos iniciados</span>
        </div>
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.directMessages}</span>
          <span className="kpi-stat-label">Mensajes directos enviados</span>
        </div>
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.groups}</span>
          <span className="kpi-stat-label">Mesas de trabajo creadas</span>
        </div>
        <div className="kpi-stat-card">
          <span className="kpi-stat-num">{totals.groupMessages}</span>
          <span className="kpi-stat-label">Mensajes en mesas de trabajo</span>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Emprendimientos por industria</h3>
          <BarChart data={kpis.initiativesByIndustry} color="var(--navy)" />
        </div>
        <div className="kpi-card">
          <h3>Emprendimientos por ODS</h3>
          <BarChart data={kpis.initiativesByOds} color="var(--indigo)" />
        </div>
        <div className="kpi-card">
          <h3>Emprendimientos por etapa</h3>
          <DonutChart data={kpis.initiativesByStage} />
        </div>
        <div className="kpi-card">
          <h3>Miembros por ciudad</h3>
          <BarChart data={kpis.profilesByCity} color="var(--navy)" />
        </div>
        <div className="kpi-card">
          <h3>Miembros por tipo de perfil</h3>
          <DonutChart data={kpis.profilesByType} />
        </div>
        <div className="kpi-card">
          <h3>Mesas de trabajo — membresías reales</h3>
          <BarChart data={kpis.groupMembership} color="var(--gold-ink)" emptyLabel="Nadie se ha unido a una mesa todavía." />
        </div>
        <div className="kpi-card">
          <h3>Eventos por ciudad</h3>
          <BarChart data={kpis.eventsByCity} color="var(--indigo)" />
        </div>
      </div>

      <div className="kpi-card" style={{ marginTop: 28 }}>
        <h3>Emprendimientos con más interés</h3>
        {kpis.topInitiatives.length === 0 ? (
          <p className="kpi-empty">Todavía nadie ha marcado "Me interesa" en ningún emprendimiento.</p>
        ) : (
          <div className="kpi-table-wrap">
            <table className="kpi-table">
              <thead>
                <tr>
                  <th>Emprendimiento</th>
                  <th>Organización</th>
                  <th>Industria</th>
                  <th>Interesados</th>
                </tr>
              </thead>
              <tbody>
                {kpis.topInitiatives.map((i) => (
                  <tr key={i.title}>
                    <td>{i.title}</td>
                    <td>{i.org}</td>
                    <td>{i.industryLabel}</td>
                    <td>{i.interest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="kpi-card" style={{ marginTop: 28 }}>
        <h3>Actividad por usuario</h3>
        <p className="settings-card-desc" style={{ marginBottom: 16 }}>
          Actividad registrada (emprendimientos creados, interés mostrado, eventos, mesas unidas) — todavía no se rastrea tiempo de sesión.
        </p>
        {kpis.activityRanking.length === 0 ? (
          <p className="kpi-empty">Todavía no hay actividad registrada.</p>
        ) : (
          <div className="kpi-table-wrap">
            <table className="kpi-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Ciudad</th>
                  <th>Emprendimientos</th>
                  <th>Interés mostrado</th>
                  <th>Eventos</th>
                  <th>Mesas unidas</th>
                </tr>
              </thead>
              <tbody>
                {kpis.activityRanking.map((a) => (
                  <tr key={a.uid}>
                    <td>{a.name}</td>
                    <td>{a.city || '—'}</td>
                    <td>{a.initiatives}</td>
                    <td>{a.interestShown}</td>
                    <td>{a.events}</td>
                    <td>{a.groupsJoined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </DashboardLayout>
  )
}
