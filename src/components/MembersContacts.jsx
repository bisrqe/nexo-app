import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProfilesByUids } from '../lib/useProfilesByUids.js'
import { initials } from '../data/currentUser.js'

function CopyEmailButton({ email }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard puede estar bloqueado (permisos, http sin TLS) — el correo
      // ya está visible en texto para copiar a mano, así que no es crítico.
    }
  }

  return (
    <button type="button" className="btn btn-ghost" onClick={copy}>
      {copied ? '✓ Copiado' : 'Copiar correo'}
    </button>
  )
}

// Una tarjeta de contacto por cada cuenta ligada a un emprendimiento (el
// dueño y, si los agregó, cofundadores con cuentas distintas) — en vez de
// un correo suelto, se ve y se contacta a la persona real. Se usa tanto en
// el dossier público/app (solo lectura) como en el propio, donde el dueño
// también puede quitar a alguien.
export default function MembersContacts({ ownerUid, memberUids, onRemove, canManage = false, linkToProfiles = false, ownerLabel = 'Dueño', memberLabel = 'Cofundador/a' }) {
  const people = useProfilesByUids(memberUids)
  if (people.length === 0) return null

  return (
    <>
      {people.map((p) => (
        <div className="dossier-contact" key={p.uid}>
          <div className="dossier-contact-person">
            <span className="dossier-avatar" style={{ width: 48, height: 48, fontSize: 15 }}>
              {p.photo ? <img src={p.photo} alt="" /> : initials(p.name)}
            </span>
            <div>
              {linkToProfiles && p.username ? (
                <Link to={`/app/personas/${p.username}`} className="dossier-contact-name">{p.name || 'Sin nombre'}</Link>
              ) : (
                <div className="dossier-contact-name">{p.name || 'Sin nombre'}</div>
              )}
              <div className="dossier-contact-role">
                {p.uid === ownerUid ? ownerLabel : memberLabel}{p.username ? ` · @${p.username}` : ''}
              </div>
            </div>
          </div>

          {p.email && <span className="dossier-contact-email">{p.email}</span>}

          <div className="dossier-contact-actions">
            {linkToProfiles && p.username && (
              <Link to={`/app/mensajes?to=${p.uid}`} className="btn btn-primary">Enviar mensaje →</Link>
            )}
            {p.email && <CopyEmailButton email={p.email} />}
            {p.linkedin && <a href={p.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost">LinkedIn →</a>}
          </div>

          {canManage && p.uid !== ownerUid && (
            <button type="button" className="link-arrow dossier-contact-remove" onClick={() => onRemove(p.uid)}>Quitar</button>
          )}
        </div>
      ))}
    </>
  )
}
