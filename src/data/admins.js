// Cuentas con acceso al panel de KPIs (además de todo lo que ve cualquier
// miembro). No es una bandera en el perfil (evitaría que alguien la edite
// desde su propio doc de Firestore) — es una lista fija de correos.
//
// La cuenta de soporte (support@nexohub.mx) tiene exactamente los mismos
// permisos que la cuenta principal — pero solo cuenta como staff cuando su
// correo está VERIFICADO: sin eso, cualquiera podría registrarse con esa
// dirección antes que el equipo y quedarse con permisos de admin. Las
// reglas de Firestore (firestore.rules, isStaff) aplican la misma condición.
export const SUPPORT_EMAIL = 'support@nexohub.mx'

const PRIMARY_ADMIN_EMAIL = 'bismarck@bisrqe.com'

export function isStaffUser(user) {
  if (!user?.email) return false
  if (user.email === PRIMARY_ADMIN_EMAIL) return true
  return user.email === SUPPORT_EMAIL && user.emailVerified === true
}

// Cuentas que pueden aprobar/rechazar los recursos que sugiere cualquier
// persona con sesión (ver Recursos.jsx) — mismo grupo que admin hoy, pero
// se deja como función aparte por si algún día deja de coincidir.
export const isResourceApproverUser = isStaffUser

// La mesa de dudas y onboarding la dueña la cuenta de soporte — ver
// ensureSupportGroup en GroupsContext.jsx.
export function isSupportAccount(user) {
  return Boolean(user?.email === SUPPORT_EMAIL && user.emailVerified === true)
}
