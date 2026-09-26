// Opciones compartidas entre el registro (Register.jsx) y la edición de
// perfil (Ajustes.jsx) — mismas listas en los dos lados para que lo que
// se captura al registrarse sea justo lo que después se puede editar.

export const PROFILE_TYPES = [
  { id: 'emprendedor', label: 'Emprendedor/a' },
  { id: 'mentor', label: 'Mentor/a' },
  { id: 'inversionista', label: 'Inversionista' },
  { id: 'voluntario', label: 'Voluntario/a' },
  { id: 'organizacion', label: 'Institución / organización' },
]

export const GENDERS = [
  { id: 'femenino', label: 'Femenino' },
  { id: 'masculino', label: 'Masculino' },
  { id: 'no-binario', label: 'No binario' },
  { id: 'prefiero-no-decir', label: 'Prefiero no decir' },
  { id: 'otro', label: 'Otro' },
]
