import React from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useGroups } from '../context/GroupsContext.jsx'

export default function GroupDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { profile, toggleJoinedGroup } = useProfile()
  const { groups } = useGroups()

  const group = groups.find((g) => g.slug === slug)

  if (!group) {
    return (
      <DashboardLayout eyebrow="Comunidad" title="No encontrada">
        <div className="auth-card">
          <span className="kicker">No encontrada</span>
          <h1 className="auth-title">Esa mesa de trabajo no existe</h1>
          <Link to="/app/comunidad" className="btn btn-primary">Volver a comunidad</Link>
        </div>
      </DashboardLayout>
    )
  }

  const joined = profile.joinedGroups?.includes(group.docId)

  return (
    <DashboardLayout eyebrow="Comunidad" title="Mesa de trabajo">
      <div className="in">
        <Link to="/app/comunidad" className="link-arrow back-link">← Volver a comunidad</Link>

        <div className="detail-head">
          <h1 className="detail-title">{group.name}</h1>
          <div className="cat-tags">
            <span>{group.industryLabel}</span>
            {group.secondaryOdsLabel && <span>{group.secondaryOdsLabel}</span>}
            {group.secondaryTopic && <span>{group.secondaryTopic}</span>}
          </div>
        </div>

        <div className="detail-body">
          <p className="detail-lede">{group.desc}</p>
          {group.about && <p>{group.about}</p>}
        </div>

        <div className="form-actions" style={{ marginTop: 24 }}>
          <button
            type="button"
            className={joined ? 'btn btn-ghost' : 'btn btn-primary'}
            onClick={() => toggleJoinedGroup(group.docId)}
          >
            {joined ? '✓ Ya eres parte' : 'Unirme →'}
          </button>
          {joined && (
            <button type="button" className="btn btn-gold" onClick={() => navigate(`/app/mensajes?group=${group.docId}`)}>
              Ir al chat →
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
