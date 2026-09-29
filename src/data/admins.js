// Cuentas con acceso al panel de KPIs (además de todo lo que ve cualquier
// miembro). No es una bandera en el perfil (evitaría que alguien la edite
// desde su propio doc de Firestore) — es una lista fija de correos.
export const ADMIN_EMAILS = ['bismarck@bisrqe.com']

// Cuentas que pueden aprobar/rechazar los recursos que sugiere cualquier
// persona con sesión (ver Recursos.jsx) — un rol aparte del admin de KPIs,
// aunque hoy tengan el mismo correo.
export const RESOURCE_APPROVER_EMAILS = ['bismarck@bisrqe.com']
