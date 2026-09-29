import React from 'react'
import { Link } from 'react-router-dom'
import { useSaved } from '../context/SavedContext.jsx'
import NavIcon from './NavIcon.jsx'
import { kindFor, projectTypeFor } from '../lib/initiativeKind.js'

const TAG_LABEL_KEY_BY_PROJECT_TYPE = {
  iniciativas: 'odsLabel',
  instituciones: 'causeLabel',
  emprendimientos: 'industryLabel',
}

export default function InitiativeCard({ initiative, basePath = '/iniciativas', allowSave = true }) {
  const { id, slug, stage, title, desc, odsLabel, industryLabel, causeLabel, need, ownerProfileType, ownerProfileSubtype, logoUrl } = initiative
  const projectType = projectTypeFor(ownerProfileType, ownerProfileSubtype)
  const tagKey = TAG_LABEL_KEY_BY_PROJECT_TYPE[projectType]
  const tagLabel = { odsLabel, industryLabel, causeLabel }[tagKey] || odsLabel || industryLabel || causeLabel
  const kind = kindFor(ownerProfileType, ownerProfileSubtype)
  const { isInitiativeSaved, toggleInitiative } = useSaved()
  const isPreview = slug === 'vista-previa'
  const saved = !isPreview && isInitiativeSaved(slug)

  return (
    <div className="cat-card">
      <div className="cat-top-row">
        <div className="cat-id">
          N° {String(id).padStart(3, '0')} — {stage.toUpperCase()}
          {projectType !== 'emprendimientos' && ` · ${kind.Noun.toUpperCase()}`}
        </div>
        {!isPreview && allowSave && (
          <button
            className={`save-btn ${saved ? 'saved' : ''}`}
            onClick={() => toggleInitiative(slug)}
            aria-label={saved ? 'Quitar de guardados' : 'Guardar emprendimiento'}
            title={saved ? 'Quitar de guardados' : 'Guardar'}
          >
            <NavIcon name="bookmark" size={15} />
          </button>
        )}
      </div>
      <div className="cat-title-row">
        {logoUrl && <img src={logoUrl} alt="" className="cat-logo" />}
        <div className="cat-title">{title}</div>
      </div>
      <p className="cat-desc">{desc}</p>
      <div className="cat-tags"><span>{tagLabel}</span></div>
      <div className="cat-foot">
        <span className="need-badge">Busca: {need}</span>
        {!isPreview && (
          <Link className="link-arrow" to={`${basePath}/${slug}`}>Ver dossier →</Link>
        )}
      </div>
    </div>
  )
}
