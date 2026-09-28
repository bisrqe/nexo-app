// Forma por defecto del perfil — lo que se ve antes de que cargue el doc
// real de Firestore (profiles/{uid}), o cuando no hay sesión iniciada (las
// páginas públicas que llaman a useProfile() reciben esta forma vacía en
// vez de tronar).
//
// name, birthDate y gender se capturan una sola vez, al registrarse, y no
// son editables después — por eso viven aquí igual que el resto, pero
// Ajustes.jsx los muestra como solo lectura.

export const DEFAULT_PROFILE = {
  name: '',
  username: '',
  email: '',
  birthDate: '',
  gender: '',
  occupation: '',
  location: '',
  city: '',
  profileType: 'emprendedor',
  industry: '',
  industryLabel: '',
  industrySecondary: '',
  industrySecondaryLabel: '',
  interests: [],
  linkedin: '',
  bio: '',
  photo: null,
  joinedGroups: [],
  notificationPrefs: {
    onMessage: true,
    onGroupActivity: true,
    onInterest: true,
    marketing: false,
  },
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
