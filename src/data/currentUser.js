// Usuario "con sesión iniciada" — mock. Igual que el resto del proyecto,
// no hay autenticación real todavía, así que esto solo simula cómo se ve
// el perfil de quien está usando el dashboard.

export const CURRENT_USER = {
  name: 'Diego Marín',
  role: 'Coordinador de proyectos',
  location: 'Monterrey, Nuevo León',
  email: 'diego.marin@example.org',
  odsLabel: 'ODS 17 · Alianzas',
  bio: 'Conecta colectivos y voluntarios con las iniciativas del mapa. Todavía no hay backend: este perfil es un ejemplo de cómo se va a ver una vez que conectemos cuentas reales.',
}

export function initials(name) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}
