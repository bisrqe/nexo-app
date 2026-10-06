// Opciones compartidas entre el registro (Register.jsx) y la edición de
// perfil (Ajustes.jsx) — mismas listas en los dos lados para que lo que
// se captura al registrarse sea justo lo que después se puede editar.

export const PROFILE_TYPES = [
  { id: 'emprendedor', label: 'Emprendedor/a' },
  { id: 'estudiante', label: 'Estudiante' },
  { id: 'mentor', label: 'Mentor/a' },
  { id: 'voluntario', label: 'Voluntario/a' },
  { id: 'organizacion', label: 'Institución / organización' },
]

// Subcategoría de perfil — por ahora solo aplica a "estudiante": permite
// marcar que además de estudiante, la persona ya trae un emprendimiento
// propio (estudiante-emprendedor). Ver src/lib/initiativeKind.js
// (isStudentEntrepreneur) para cómo esto reclasifica lo que registra y
// cómo lo priorizan los algoritmos de recomendación.
export const STUDENT_SUBTYPES = [
  { id: '', label: 'Ninguna' },
  { id: 'emprendedor', label: 'Emprendedor/a' },
]

// Segundo perfil — hoy solo un estudiante puede sumar "voluntario/a" a su
// perfil principal (profile.secondaryProfile). Sigue siendo estudiante para
// registrar su iniciativa; el segundo perfil solo suma las recomendaciones
// y la visibilidad de un voluntario (ver profileRoles en lib/initiativeKind.js).
export const SECONDARY_PROFILE_VOLUNTEER = 'voluntario'

// El género solo se usa para recomendar apoyos dirigidos a mujeres (ver
// genderFocusFor en lib/recommend.js). "No binario", "Prefiero no decir" y
// "Otro" no activan ningún criterio por género — a esas cuentas se les
// recomienda únicamente por industria, ODS, región, etapa e intereses.
export const GENDERS = [
  { id: 'femenino', label: 'Femenino' },
  { id: 'masculino', label: 'Masculino' },
  { id: 'no-binario', label: 'No binario' },
  { id: 'prefiero-no-decir', label: 'Prefiero no decir' },
  { id: 'otro', label: 'Otro' },
]
