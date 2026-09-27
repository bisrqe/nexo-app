import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'
import { db } from '../lib/firebase.js'
import { initials } from '../data/currentUser.js'
import { getCityName } from '../data/cities.js'

function timeRunning(foundedDate) {
  if (!foundedDate) return null
  const start = new Date(foundedDate + 'T00:00:00')
  if (Number.isNaN(start.getTime())) return null
  const months = Math.max(0, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
  if (months < 1) return 'Menos de un mes en marcha'
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'} en marcha`
  const years = Math.floor(months / 12)
  const restMonths = months % 12
  return `${years} ${years === 1 ? 'año' : 'años'}${restMonths ? ` y ${restMonths} ${restMonths === 1 ? 'mes' : 'meses'}` : ''} en marcha`
}

function InterestedPeople({ uids }) {
  const [people, setPeople] = useState([])

  useEffect(() => {
    let cancelled = false
    if (!uids || uids.length === 0) {
      setPeople([])
      return
    }
    Promise.all(uids.map((uid) => getDoc(doc(db, 'profiles', uid)))).then((snaps) => {
      if (cancelled) return
      setPeople(snaps.filter((s) => s.exists()).map((s) => ({ uid: s.id, ...s.data() })))
    })
    return () => { cancelled = true }
  }, [uids])

  if (!uids || uids.length === 0) return null

  return (
    <div style={{ marginTop: 40 }}>
      <span className="kicker">Personas interesadas</span>
      <div className="tile-grid" style={{ margin: '16px 0 0' }}>
        {people.map((p) => (
          <div className="tile" key={p.uid}>
            <span className="app-profile-avatar" style={{ marginBottom: 8 }}>
              {p.photo ? <img src={p.photo} alt="" /> : initials(p.name)}
            </span>
            <span className="tile-title">{p.name || 'Sin nombre'}</span>
            <p className="tile-text">{p.occupation}{p.city ? ` — ${getCityName(p.city)}` : ''}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MyInitiative() {
  const { myInitiative } = useUserContent()

  if (!myInitiative) {
    return (
      <DashboardLayout eyebrow="Emprendimientos" title="Mi emprendimiento" subtitle="Todavía no has registrado un emprendimiento propio.">
        <div className="empty-state">
          <p>Cuando registres un emprendimiento, va a vivir aquí — con su propio dossier y contacto.</p>
          <Link to="/app/iniciativas/nueva" className="btn btn-primary" style={{ marginTop: 16 }}>Registrar mi emprendimiento →</Link>
        </div>
      </DashboardLayout>
    )
  }

  const {
    stage, title, org, city, link, odsLabel, odsSecondaryLabel, industryLabel, industrySecondaryLabel,
    need, desc, longDesc, collaborators, impact, foundedDate, contact, interestedBy, resources,
  } = myInitiative

  const running = timeRunning(foundedDate)

  return (
    <DashboardLayout eyebrow="Emprendimientos" title="Mi emprendimiento">
      <div className="in">
        <div className="detail-head">
          <div className="cat-id">{stage?.toUpperCase()}</div>
          <h1 className="detail-title">{title}</h1>
          <p className="cat-org">{org} — {getCityName(city) || 'Ciudad por definir'}</p>
          <div className="cat-tags">
            <span>{odsLabel}</span>
            {odsSecondaryLabel && <span>{odsSecondaryLabel}</span>}
            {industryLabel && <span>{industryLabel}</span>}
            {industrySecondaryLabel && <span>{industrySecondaryLabel}</span>}
          </div>
          {running && <p className="settings-card-desc" style={{ marginTop: 10 }}>{running}</p>}
        </div>

        <div className="detail-body">
          <p className="detail-lede">{desc}</p>
          {longDesc && longDesc !== desc && <p>{longDesc}</p>}
          {impact && (
            <p><b>Impacto: </b>{impact}</p>
          )}
          {collaborators?.length > 0 && (
            <p><b>Colaboradores: </b>{collaborators.join(', ')}</p>
          )}
          {link && (
            <p><a href={link} target="_blank" rel="noreferrer" className="link-arrow">Visitar sitio →</a></p>
          )}
          {resources?.length > 0 && (
            <div className="resource-group" style={{ marginTop: 20 }}>
              <span className="kicker">Documentos y ligas</span>
              <ul className="resource-link-list" style={{ marginTop: 10 }}>
                {resources.map((r, i) => (
                  <li key={`${r.url}-${i}`}>
                    <a href={r.url} target="_blank" rel="noreferrer">
                      {r.type === 'video' ? '▶' : '🔗'} {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="detail-side">
          <div className="need-block">
            <span className="kicker">Busca ahora</span>
            <p className="need-big">{need}</p>
          </div>

          <div className="contact-block">
            <span className="kicker">Contacto</span>
            <a href={`mailto:${contact}`} className="btn btn-gold btn-lg">{contact}</a>
          </div>
        </div>

        <InterestedPeople uids={interestedBy} />

        <div className="form-actions" style={{ marginTop: 32 }}>
          <Link to="/app/iniciativas/nueva" className="btn btn-ghost">Editar mi emprendimiento</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
