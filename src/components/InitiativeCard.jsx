import React from 'react'
import { Link } from 'react-router-dom'
import { useSaved } from '../context/SavedContext.jsx'
import NavIcon from './NavIcon.jsx'

export default function InitiativeCard({ initiative }) {
  const { id, slug, stage, title, org, desc, odsLabel, need } = initiative
  const { isInitiativeSaved, toggleInitiative } = useSaved()
  const saved = slug !== 'vista-previa' && isInitiativeSaved(slug)

  return (
    <div className="cat-card">
      <div className="cat-top-row">
        <div className="cat-id">N° {String(id).padStart(3, '0')} — {stage.toUpperCase()}</div>
        {slug !== 'vista-previa' && (
          <button
            className={`save-btn ${saved ? 'saved' : ''}`}
            onClick={() => toggleInitiative(slug)}
            aria-label={saved ? 'Quitar de guardados' : 'Guardar iniciativa'}
            title={saved ? 'Quitar de guardados' : 'Guardar'}
          >
            <NavIcon name="bookmark" size={15} />
          </button>
        )}
      </div>
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
