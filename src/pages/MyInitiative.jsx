import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout.jsx'
import InitiativeCard from '../components/InitiativeCard.jsx'
import { useUserContent } from '../context/UserContentContext.jsx'
import { useProfile } from '../context/ProfileContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { kindFor, myProjectsLabel, PROFILE_TYPES_WITHOUT_OWN_INITIATIVE } from '../lib/initiativeKind.js'

// Lista de TODOS los emprendimientos/iniciativas/instituciones de los que
// esta cuenta es dueña o cofundadora — una cuenta puede tener varios a la
// vez. El dossier completo (con gestión de cofundadores, editar, borrar)
// vive en InitiativeDetail — esta página lista, enlaza y deja borrar los
// propios con un clic.
export default function MyInitiative() {
  const { myInitiatives, deleteInitiative } = useUserContent()
  const { profile } = useProfile()
  const { user } = useAuth()
  const kind = kindFor(profile.profileType, profile.subtype)
  const title = myProjectsLabel(profile, myInitiatives)

  const handleDelete = async (initiative) => {
    if (!window.confirm(`¿Seguro que quieres borrar "${initiative.title}"? Se elimina para siempre, junto con su dossier.`)) return
    try {
      await deleteInitiative(initiative.docId)
    } catch (err) {
      console.error(err)
      window.alert('No se pudo borrar. Solo quien lo registró puede borrarlo — intenta de nuevo.')
    }
  }

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
        title={title}
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
      title={title}
      subtitle="Todo lo que registraste o en lo que te ligaron como cofundador/a — cada uno con su propio dossier."
    >
      <div className="catalog-grid">
        {myInitiatives.map((i) => (
          <div className="my-project-cell" key={i.docId}>
            <InitiativeCard initiative={i} basePath="/app/iniciativas" />
            {i.ownerUid === user?.uid && (
              <button type="button" className="btn btn-ghost-danger my-project-delete" onClick={() => handleDelete(i)}>
                Borrar {kindFor(i.ownerProfileType, i.ownerProfileSubtype).noun}
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="form-actions" style={{ marginTop: 28 }}>
        <Link to="/app/iniciativas/nueva" className="btn btn-primary">Registrar otro {kind.noun} →</Link>
      </div>
    </DashboardLayout>
  )
}
