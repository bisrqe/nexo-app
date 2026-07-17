// Datos de ejemplo (mock). No hay base de datos todavía — esto vive
// solo en el bundle del front y sirve para mostrar cómo se vería el
// catálogo, los filtros y el detalle de cada iniciativa.

export const ODS_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ods2', label: 'ODS 2 · Hambre cero' },
  { id: 'ods4', label: 'ODS 4 · Educación' },
  { id: 'ods6', label: 'ODS 6 · Agua limpia' },
  { id: 'ods8', label: 'ODS 8 · Trabajo digno' },
  { id: 'ods12', label: 'ODS 12 · Consumo responsable' },
  { id: 'ods13', label: 'ODS 13 · Clima' },
]

export const NEED_FILTERS = [
  { id: 'fondeo', label: 'Busca fondeo' },
  { id: 'mentoria', label: 'Busca mentoría' },
]

export const INITIATIVES = [
  {
    id: 14,
    slug: 'huertos-urbanos-escolares',
    stage: 'Idea',
    title: 'Huertos urbanos escolares',
    org: 'Colectivo Raíz',
    location: 'Guadalajara, Jalisco',
    ods: ['ods2'],
    odsLabel: 'ODS 2 · Hambre cero',
    needTag: 'mentoria',
    need: 'Agrónomos',
    desc: 'Convierte espacios ociosos en primarias públicas en huertos que abastecen el comedor escolar.',
    longDesc:
      'Trabajamos con cinco primarias públicas de la zona metropolitana para transformar patios sin uso en huertos productivos. El objetivo es que cada escuela cubra al menos el 15% de los insumos frescos de su comedor y que el huerto se use como aula viva de ciencias naturales. Ya tenemos el convenio con dos escuelas firmado; nos falta diseño técnico del sistema de riego y un plan de rotación de cultivos.',
    contact: 'raiz.colectivo@example.org',
  },
  {
    id: 31,
    slug: 'alfabetizacion-digital-60-mas',
    stage: 'En marcha',
    title: 'Alfabetización digital 60+',
    org: 'Puente Comunitario',
    location: 'Monterrey, Nuevo León',
    ods: ['ods4'],
    odsLabel: 'ODS 4 · Educación',
    needTag: 'mentoria',
    need: 'Voluntarios',
    desc: 'Talleres para adultos mayores enfocados en trámites, salud y contacto familiar en línea.',
    longDesc:
      'Damos talleres semanales de dos horas en tres centros comunitarios, enfocados en lo que la gente mayor realmente necesita: hacer una videollamada, sacar una cita médica en línea, usar la banca digital sin caer en fraudes. Llevamos 8 meses activos y más de 140 personas graduadas. Buscamos voluntarios que puedan dar sesiones una vez por semana — no se necesita experiencia docente, solo paciencia.',
    contact: 'hola@puentecomunitario.example',
  },
  {
    id: 7,
    slug: 'trazabilidad-residuos-textiles',
    stage: 'Escalando',
    title: 'Trazabilidad de residuos textiles',
    org: 'Loop MX',
    location: 'Ciudad de México',
    ods: ['ods12'],
    odsLabel: 'ODS 12 · Consumo responsable',
    needTag: 'fondeo',
    need: 'Inversión',
    desc: 'Plataforma para que marcas de moda documenten y reduzcan su huella de desperdicio.',
    longDesc:
      'Loop MX es un software que conecta a marcas de ropa con recicladores textiles certificados, documentando cada kilogramo de desperdicio evitado para reportes de sostenibilidad. Ya trabajamos con 6 marcas medianas y estamos cerrando una ronda semilla para escalar el equipo de operaciones y cubrir la zona del Bajío.',
    contact: 'inversion@loopmx.example',
  },
  {
    id: 22,
    slug: 'red-captacion-pluvial',
    stage: 'Prototipo',
    title: 'Red de captación pluvial',
    org: 'Aguacero Comunitario',
    location: 'Oaxaca de Juárez, Oaxaca',
    ods: ['ods6'],
    odsLabel: 'ODS 6 · Agua limpia',
    needTag: 'mentoria',
    need: 'Ingeniería civil',
    desc: 'Sistema de bajo costo para barrios sin acceso constante a agua potable.',
    longDesc:
      'Diseñamos un sistema modular de captación e infiltración pluvial pensado para instalarse con materiales locales y mano de obra comunitaria. Ya construimos un primer prototipo funcional en una vivienda piloto; necesitamos revisión estructural de un ingeniero civil antes de replicarlo en el resto del barrio.',
    contact: 'aguacero.comunitario@example.org',
  },
]

export function getInitiativeBySlug(slug) {
  return INITIATIVES.find((i) => i.slug === slug)
}
