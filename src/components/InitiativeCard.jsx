import React from 'react'
import { Link } from 'react-router-dom'

export default function InitiativeCard({ initiative }) {
  const { id, slug, stage, title, org, desc, odsLabel, need } = initiative
  return (
    <div className="cat-card">
      <div className="cat-id">N° {String(id).padStart(3, '0')} — {stage.toUpperCase()}</div>
      <div className="cat-title">{title}</div>
      <div className="cat-org">{org}</div>
      <p className="cat-desc">{desc}</p>
      <div className="cat-tags"><span>{odsLabel}</span></div>
      <div className="cat-foot">
        <span className="need-badge">Busca: {need}</span>
        <Link className="link-arrow" to={`/iniciativas/${slug}`}>Ver dossier →</Link>
      </div>
    </div>
  )
}
