import React from 'react'
import { Link } from 'react-router-dom'
import { useProfilesByUids } from '../lib/useProfilesByUids.js'
import { initials } from '../data/currentUser.js'

// Quiénes tienen cuenta ligada a un emprendimiento (el dueño y, si los
// agregó, cofundadores con cuentas distintas) — sirve como "contacto": en
// vez de un correo suelto, se ve y se contacta a la persona real. Se usa
// tanto en el dossier público/app (solo lectura) como en "Mi emprendimiento"
// (donde el dueño también puede quitar a alguien).
export default function MembersContacts({ ownerUid, memberUids, onRemove, canManage = false, linkToProfiles = false }) {
  const people = useProfilesByUids(memberUids)
  if (people.length === 0) return null

  return (
    <div className="contact-block">
      <span className="kicker">Contacto</span>
      <div className="tile-grid" style={{ margin: '10px 0 0' }}>
        {people.map((p) => (
          <div className="tile" key={p.uid}>
            <span className="app-profile-avatar" style={{ marginBottom: 8 }}>
              {p.photo ? <img src={p.photo} alt="" /> : initials(p.name)}
            </span>
            <span className="tile-title">{p.name || 'Sin nombre'}{p.uid === ownerUid ? ' · Dueño' : ''}</span>
            {linkToProfiles && p.username ? (
              <Link to={`/app/personas/${p.username}`} className="tile-text link-arrow">@{p.username}</Link>
            ) : (
              <p className="tile-text">@{p.username}</p>
            )}
            {canManage && p.uid !== ownerUid && (
              <button type="button" className="link-arrow" onClick={() => onRemove(p.uid)}>Quitar</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
