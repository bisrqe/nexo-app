import React from 'react'
import { Link } from 'react-router-dom'
import { useSaved } from '../context/SavedContext.jsx'
import NavIcon from './NavIcon.jsx'
import { kindFor, projectTypeFor } from '../lib/initiativeKind.js'
import { locationLabel } from '../data/cities.js'

const TAG_LABEL_KEY_BY_PROJECT_TYPE = {
  iniciativas: 'odsLabel',
  instituciones: 'causeLabel',
  emprendimientos: 'industryLabel',
}

export default function InitiativeCard({ initiative, basePath = '/iniciativas', allowSave = true }) {
  const { id, slug, stage, isProfileCard, title, desc, odsLabel, industryLabel, causeLabel, need, ownerProfileType, ownerProfileSubtype, logoUrl, metrics, link } = initiative
  const projectType = projectTypeFor(ownerProfileType, ownerProfileSubtype)
  const tagKey = TAG_LABEL_KEY_BY_PROJECT_TYPE[projectType]
  const tagLabel = { odsLabel, industryLabel, causeLabel }[tagKey] || odsLabel || industryLabel || causeLabel
  const kind = kindFor(ownerProfileType, ownerProfileSubtype)
  const { isInitiativeSaved, toggleInitiative } = useSaved()
  const location = locationLabel(initiative)
  const topMetrics = (metrics || []).slice(0, 2)
  const isPreview = slug === 'vista-previa'
  const saved = !isPreview && !isProfileCard && isInitiativeSaved(slug)

  return (
    <div className="cat-card">
      <div className="cat-top-row">
        <div className="cat-id">
          {isProfileCard ? (
            'PERFIL INSTITUCIONAL'
          ) : (
            <>
              N° {String(id).padStart(3, '0')} - {(stage || '').toUpperCase()}
              {projectType !== 'emprendimientos' && ` · ${kind.Noun.toUpperCase()}`}
            </>
          )}
        </div>
        {!isPreview && !isProfileCard && allowSave && (
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
      {location && <div className="cat-location">{location}</div>}
      <p className="cat-desc">{desc}</p>
      {topMetrics.length > 0 && (
        <div className="cat-metrics">
          {topMetrics.map((m, i) => (
            <div className="cat-metric" key={`${m.label}-${i}`}>
              <span className="cat-metric-value">{m.value}</span>
              <span className="cat-metric-label">{m.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="cat-tags"><span>{tagLabel}</span></div>
      <div className="cat-foot">
        <span className="need-badge">Busca: {need}</span>
        <div className="cat-foot-links">
          {/* El sitio es parte de lo que el dossier público esconde tras iniciar
              sesión — por eso solo se enlaza desde las tarjetas del dashboard. */}
          {link && allowSave && (
            <a className="cat-site-link" href={link} target="_blank" rel="noreferrer">Visitar sitio ↗</a>
          )}
          {!isPreview && (
            isProfileCard ? (
              <Link className="link-arrow" to={`/app/personas/${slug}`}>Ver perfil →</Link>
            ) : (
              <Link className="link-arrow" to={`${basePath}/${slug}`}>Ver dossier →</Link>
            )
          )}
        </div>
      </div>
    </div>
  )
}
