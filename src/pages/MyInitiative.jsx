import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { kindFor, PROFILE_TYPES_WITHOUT_OWN_INITIATIVE } from '../lib/initiativeKind.js'

// Lista de TODOS los emprendimientos/iniciativas de los que esta cuenta es
// dueña o cofundadora — antes era un solo registro ("mi emprendimiento"),
// ahora una cuenta puede tener varios a la vez. El dossier completo (con
// gestión de cofundadores, editar, etc.) vive en InitiativeDetail — esta
// página solo lista y enlaza a cada uno.
export default function MyInitiative() {
  const { myInitiatives } = useUserContent()
  const { profile } = useProfile()
  const kind = kindFor(profile.profileType, profile.subtype)

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

  if (myInitiatives.length === 0) {
    return (
      <DashboardLayout
        eyebrow={kind.eyebrow}
        title={kind.myPlural}
        subtitle={`Todavía no has registrado ${kind.un} ${kind.noun} propi${kind.un === 'una' ? 'a' : 'o'}.`}
      >
        <div className="empty-state">
          <p>Cuando registres {kind.un} {kind.noun}, va a vivir aquí — con su propio dossier y contacto.</p>
          <Link to="/app/iniciativas/nueva" className="btn btn-primary" style={{ marginTop: 16 }}>Registrar {kind.my.toLowerCase()} →</Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      eyebrow={kind.eyebrow}
      title={kind.myPlural}
      subtitle="Todo lo que registraste o en lo que te ligaron como cofundador/a — cada uno con su propio dossier."
    >
      <div className="catalog-grid">
        {myInitiatives.map((i) => (
          <InitiativeCard key={i.docId} initiative={i} basePath="/app/iniciativas" />
        ))}
      </div>
      <div className="form-actions" style={{ marginTop: 28 }}>
        <Link to="/app/iniciativas/nueva" className="btn btn-primary">Registrar otro {kind.noun} →</Link>
      </div>
    </DashboardLayout>
  )
}
