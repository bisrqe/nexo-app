// Perfil por defecto de quien "tiene sesión iniciada" — mock. Igual que
// el resto del proyecto, no hay autenticación real todavía: esto es el
// punto de partida que se carga la primera vez, y desde Ajustes se puede
// editar de verdad (queda en este navegador vía ProfileContext).
//
// name, birthDate y gender se capturan una sola vez, al registrarse, y no
// son editables después — por eso viven aquí igual que el resto, pero
// Ajustes.jsx los muestra como solo lectura.

export const DEFAULT_PROFILE = {
  name: 'Diego Marín',
  username: 'diego.marin',
  email: 'diego.marin@example.org',
  birthDate: '1996-04-12',
  gender: '',
  occupation: 'Coordinador de proyectos',
  location: 'Monterrey, Nuevo León',
  profileType: 'organizacion',
  interests: [],
  bio: 'Conecta colectivos y voluntarios con las iniciativas del mapa. Todavía no hay backend: este perfil es un ejemplo de cómo se va a ver una vez que conectemos cuentas reales.',
  photo: null,
}

export function initials(name) {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

// Se calcula siempre a partir de birthDate en vez de guardar la edad
// como número suelto — así nunca queda desactualizada.
export function calculateAge(birthDate) {
  if (!birthDate) return null
  const birth = new Date(birthDate + 'T00:00:00')
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
  if (!hasHadBirthdayThisYear) age -= 1
  return age
}
