import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import DashboardLayout from '../components/DashboardLayout.jsx'
import { getCityName } from '../data/cities.js'
import { db } from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'

// Vive en dos rutas distintas según de dónde vengas:
//  - /iniciativas/:slug        (variant="public") — parte de la landing, con Header/Footer.
//  - /app/iniciativas/:slug    (variant="app")    — parte del dashboard, nunca te saca a la landing.
// El contenido del dossier es el mismo en ambos casos; solo cambia el
// "chrome" alrededor y a dónde regresa el link de "volver".
export default function InitiativeDetail({ variant = 'public' }) {
  const { slug } = useParams()
  const isApp = variant === 'app'
  const backTo = isApp ? '/app/iniciativas' : '/iniciativas'
  const { user } = useAuth()

  const [remote, setRemote] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    setRemote(undefined)
    getDocs(query(collection(db, 'initiatives'), where('slug', '==', slug))).then((snap) => {
      if (cancelled) return
      setRemote(snap.empty ? null : { ...snap.docs[0].data(), docId: snap.docs[0].id })
    })
    return () => { cancelled = true }
  }, [slug])

  const initiative = remote
  const loading = remote === undefined
  const isOwner = Boolean(user && initiative?.ownerUid && initiative.ownerUid === user.uid)
  const interested = Boolean(user && initiative?.interestedBy?.includes(user.uid))

  const toggleInterest = async () => {
    if (!initiative?.docId || !user) return
    const ref = doc(db, 'initiatives', initiative.docId)
    if (interested) {
      await updateDoc(ref, { interestedBy: arrayRemove(user.uid) })
      setRemote((r) => ({ ...r, interestedBy: (r.interestedBy || []).filter((id) => id !== user.uid) }))
    } else {
      await updateDoc(ref, { interestedBy: arrayUnion(user.uid) })
      setRemote((r) => ({ ...r, interestedBy: [...(r.interestedBy || []), user.uid] }))
    }
  }

  if (loading) {
    const loadingBody = <p className="auth-sub">Cargando…</p>
    return isApp ? (
      <DashboardLayout eyebrow="Emprendimientos" title="Dossier">{loadingBody}</DashboardLayout>
    ) : (
      <>
        <Header />
        <section className="auth-section">{loadingBody}</section>
        <Footer />
      </>
    )
  }

  if (!initiative) {
    const notFound = (
      <div className="auth-card">
        <span className="kicker">No encontrada</span>
        <h1 className="auth-title">Ese emprendimiento no está en el mapa</h1>
        <p className="auth-sub">Puede que se haya movido de nombre, o que todavía no exista.</p>
        <Link to={backTo} className="btn btn-primary">Volver al catálogo</Link>
      </div>
    )
    if (isApp) {
      return (
        <DashboardLayout eyebrow="Emprendimientos" title="No encontrada">
          {notFound}
        </DashboardLayout>
      )
    }
    return (
      <>
        <Header />
        <section className="auth-section">{notFound}</section>
        <Footer />
      </>
    )
  }

  const {
    id, stage, title, org, location, city, link, odsLabel, odsSecondaryLabel,
    industryLabel, industrySecondaryLabel, need, desc, longDesc, collaborators, impact, contact, resources,
  } = initiative

  const body = (
    <div className="in">
      <Link to={backTo} className="link-arrow back-link">← Volver al catálogo</Link>

      <div className="detail-head">
        <div className="cat-id">N° {String(id).padStart(3, '0')} — {stage.toUpperCase()}</div>
        <h1 className="detail-title">{title}</h1>
        <p className="cat-org">{org} — {getCityName(city) || location}</p>
        <div className="cat-tags">
          <span>{odsLabel}</span>
          {odsSecondaryLabel && <span>{odsSecondaryLabel}</span>}
          {industryLabel && <span>{industryLabel}</span>}
          {industrySecondaryLabel && <span>{industrySecondaryLabel}</span>}
        </div>
      </div>

      <div className="detail-body">
        <p className="detail-lede">{desc}</p>
        {longDesc && longDesc !== desc && <p>{longDesc}</p>}
        {impact && <p><b>Impacto: </b>{impact}</p>}
        {collaborators?.length > 0 && <p><b>Colaboradores: </b>{collaborators.join(', ')}</p>}
        {link && <p><a href={link} target="_blank" rel="noreferrer" className="link-arrow">Visitar sitio →</a></p>}
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

        <div className="contact-block">
          <span className="kicker">Contacto directo</span>
          <a href={`mailto:${contact}`} className="btn btn-gold btn-lg">{contact}</a>
          {isApp && user && !isOwner && initiative.docId && (
            <button type="button" className={`btn ${interested ? 'btn-ghost' : 'btn-primary'}`} onClick={toggleInterest}>
              {interested ? '✓ Ya no me interesa' : 'Me interesa →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  if (isApp) {
    return (
      <DashboardLayout eyebrow="Emprendimientos" title="Dossier">
        {body}
      </DashboardLayout>
    )
  }

  return (
    <>
      <Header />
      <section className="detail-section">{body}</section>
      <Footer />
    </>
  )
}
