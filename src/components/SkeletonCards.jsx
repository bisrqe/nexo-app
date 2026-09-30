import React from 'react'

// Tarjetas fantasma para el primer instante de carga de una colección de
// Firestore — evita mostrar el copy de "no hay nada" mientras todavía no
// llega la respuesta (ver useFirestoreCollection).
export default function SkeletonCards({ count = 3, gridClassName = 'catalog-grid' }) {
  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skel-card" key={i}>
          <div className="skel-line skel-title" />
          <div className="skel-line skel-org" />
          <div className="skel-line skel-desc" />
          <div className="skel-line skel-desc-short" />
          <div className="skel-line skel-tag" />
        </div>
      ))}
    </div>
  )
}
