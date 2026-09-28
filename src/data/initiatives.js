// Catálogos de filtro para emprendimientos — el contenido en sí (antes
// un catálogo de ejemplo) ahora vive solo en Firestore (colección
// "initiatives"), no en este archivo.

export const ODS_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ods2', label: 'ODS 2 · Hambre cero' },
  { id: 'ods4', label: 'ODS 4 · Educación' },
  { id: 'ods6', label: 'ODS 6 · Agua limpia' },
  { id: 'ods8', label: 'ODS 8 · Trabajo digno' },
  { id: 'ods12', label: 'ODS 12 · Consumo responsable' },
  { id: 'ods13', label: 'ODS 13 · Clima' },
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
