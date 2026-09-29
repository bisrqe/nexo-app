// Mensajes compartidos por las 4 páginas que resuelven un enlace de acción
// de Firebase Auth (verificar correo, restablecer contraseña, revertir
// cambio de correo, revertir alta de segundo factor). Todas reciben
// ?mode=...&oobCode=... en la URL — Firebase decide el mode, no la página.
export function authActionErrorMessage(err) {
  switch (err?.code) {
    case 'auth/expired-action-code':
      return 'Este enlace ya expiró — solicita uno nuevo.'
    case 'auth/invalid-action-code':
      return 'Este enlace no es válido o ya fue usado.'
    case 'auth/user-disabled':
      return 'Esta cuenta fue deshabilitada.'
    case 'auth/user-not-found':
      return 'No encontramos una cuenta asociada a este enlace.'
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil — usa al menos 6 caracteres.'
    default:
      return 'Este enlace no es válido o ya expiró.'
  }
}
