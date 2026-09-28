import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import MembersContacts from '../components/MembersContacts.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useProfilesByUids } from '../lib/useProfilesByUids.js'
import { initials } from '../data/currentUser.js'
import { getCityName } from '../data/cities.js'
import { kindFor, PROFILE_TYPES_WITHOUT_OWN_INITIATIVE } from '../lib/initiativeKind.js'

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
  const people = useProfilesByUids(uids)
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

function AddMemberForm({ onAdd, noun }) {
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || busy) return
    setBusy(true)
    setStatus(null)
    const result = await onAdd(username)
    setBusy(false)
    if (result?.error) {
      setStatus({ type: 'error', text: result.error })
    } else {
      setStatus({ type: 'ok', text: 'Cuenta ligada correctamente.' })
      setUsername('')
    }
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 16 }}>
      <label className="form-field">
        <span>Ligar otra cuenta a {noun === 'institución/organización' ? 'esta' : 'este'} {noun} (ej. un cofundador)</span>
        <div className="resource-add-row">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@usuario"
            disabled={busy}
          />
          <button type="submit" className="btn btn-ghost" disabled={busy}>{busy ? 'Ligando…' : 'Ligar cuenta'}</button>
        </div>
      </label>
      {status && (
        <p style={{ color: status.type === 'error' ? '#c0392b' : 'inherit', fontSize: 13.5, marginTop: 6 }}>
          {status.text}
        </p>
      )}
    </form>
  )
}

export default function MyInitiative() {
  const { myInitiative, addInitiativeMember, removeInitiativeMember } = useUserContent()
  const { user } = useAuth()
  const { profile } = useProfile()

  if (!myInitiative) {
    if (PROFILE_TYPES_WITHOUT_OWN_INITIATIVE.includes(profile.profileType)) {
      return (
        <DashboardLayout eyebrow="Emprendimientos" title="No aplica para tu tipo de perfil">
          <div className="empty-state">
            <p>
              {profile.profileType === 'mentor'
                ? 'Como mentor/a no registras un emprendimiento propio — tu área de expertise ya está en tu perfil, para que otros te encuentren.'
                : 'Como voluntario/a no registras un emprendimiento propio — puedes explorar el catálogo y contactar a quienes sí tienen uno.'}
            </p>
            <Link to="/app/iniciativas" className="btn btn-primary" style={{ marginTop: 16 }}>Explorar emprendimientos →</Link>
          </div>
        </DashboardLayout>
      )
    }
    const kind = kindFor(profile.profileType)
    return (
      <DashboardLayout eyebrow={kind.eyebrow} title={kind.my} subtitle={`Todavía no has registrado ${kind.un} ${kind.noun} propi${kind.un === 'una' ? 'a' : 'o'}.`}>
        <div className="empty-state">
          <p>Cuando registres {kind.un} {kind.noun}, va a vivir aquí — con su propio dossier y contacto.</p>
          <Link to="/app/iniciativas/nueva" className="btn btn-primary" style={{ marginTop: 16 }}>Registrar {kind.my.toLowerCase()} →</Link>
        </div>
      </DashboardLayout>
    )
  }

  const {
    stage, title, org, city, link, odsLabel, odsSecondaryLabel, industryLabel, industrySecondaryLabel,
    need, desc, longDesc, collaborators, impact, foundedDate, ownerUid, ownerProfileType, memberUids, interestedBy, resources,
  } = myInitiative

  const running = timeRunning(foundedDate)
  const isOwner = Boolean(user && ownerUid === user.uid)
  const kind = kindFor(ownerProfileType)

  return (
    <DashboardLayout eyebrow={kind.eyebrow} title={kind.my}>
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
                      {r.type === 'video' ? '▶' : r.type === 'file' ? '📎' : '🔗'} {r.label}
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

          <MembersContacts ownerUid={ownerUid} memberUids={memberUids} onRemove={removeInitiativeMember} canManage={isOwner} linkToProfiles />
        </div>

        {isOwner && <AddMemberForm onAdd={addInitiativeMember} noun={kind.noun} />}

        <InterestedPeople uids={interestedBy} />

        <div className="form-actions" style={{ marginTop: 32 }}>
          <Link to="/app/iniciativas/nueva" className="btn btn-ghost">Editar {kind.my.toLowerCase()}</Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
