// Catálogos de filtro para emprendimientos — el contenido en sí (antes
// un catálogo de ejemplo) ahora vive solo en Firestore (colección
// "initiatives"), no en este archivo.

export const ODS_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ods1', label: 'ODS 1 · Fin de la pobreza' },
  { id: 'ods2', label: 'ODS 2 · Hambre cero' },
  { id: 'ods3', label: 'ODS 3 · Salud y bienestar' },
  { id: 'ods4', label: 'ODS 4 · Educación de calidad' },
  { id: 'ods5', label: 'ODS 5 · Igualdad de género' },
  { id: 'ods6', label: 'ODS 6 · Agua limpia y saneamiento' },
  { id: 'ods7', label: 'ODS 7 · Energía asequible y no contaminante' },
  { id: 'ods8', label: 'ODS 8 · Trabajo decente y crecimiento económico' },
  { id: 'ods9', label: 'ODS 9 · Industria, innovación e infraestructura' },
  { id: 'ods10', label: 'ODS 10 · Reducción de las desigualdades' },
  { id: 'ods11', label: 'ODS 11 · Ciudades y comunidades sostenibles' },
  { id: 'ods12', label: 'ODS 12 · Producción y consumo responsables' },
  { id: 'ods13', label: 'ODS 13 · Acción por el clima' },
  { id: 'ods14', label: 'ODS 14 · Vida submarina' },
  { id: 'ods15', label: 'ODS 15 · Vida de ecosistemas terrestres' },
  { id: 'ods16', label: 'ODS 16 · Paz, justicia e instituciones sólidas' },
  { id: 'ods17', label: 'ODS 17 · Alianzas para lograr los objetivos' },
  { id: 'otra', label: 'Otra' },
]

export const INDUSTRY_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'agroindustria', label: 'Agroindustria' },
  { id: 'educacion', label: 'Educación' },
  { id: 'salud', label: 'Salud' },
  { id: 'agua', label: 'Agua y saneamiento' },
  { id: 'energia', label: 'Energía' },
  { id: 'manufactura', label: 'Manufactura y moda' },
  { id: 'tecnologia', label: 'Tecnología' },
  { id: 'gobierno', label: 'Gobierno y política pública' },
  { id: 'otra', label: 'Otra' },
]

// Causas comunes que atienden instituciones públicas y organizaciones —
// equivalente a INDUSTRY_FILTERS pero para perfiles "organizacion", cuyo
// dossier no encaja en una industria sino en una causa social.
export const CAUSE_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'educacion', label: 'Educación' },
  { id: 'salud', label: 'Salud' },
  { id: 'medio-ambiente', label: 'Medio ambiente y sustentabilidad' },
  { id: 'igualdad-genero', label: 'Igualdad de género' },
  { id: 'pobreza-desarrollo-social', label: 'Pobreza y desarrollo social' },
  { id: 'seguridad-alimentaria', label: 'Seguridad alimentaria' },
  { id: 'ninez-juventud', label: 'Niñez y juventud' },
  { id: 'adultos-mayores', label: 'Adultos mayores' },
  { id: 'inclusion-discapacidad', label: 'Inclusión y discapacidad' },
  { id: 'derechos-humanos', label: 'Derechos humanos' },
  { id: 'cultura-arte', label: 'Cultura y arte' },
  { id: 'deporte-recreacion', label: 'Deporte y recreación' },
  { id: 'emprendimiento-innovacion', label: 'Emprendimiento e innovación' },
  { id: 'otra', label: 'Otra' },
]
