// Mesas de trabajo / comunidad — reemplazan al feed global.
// Cada grupo es un espacio acotado por ODS o sector, no un timeline
// infinito. Mock — sin backend.

export const GROUPS = [
  {
    id: 'g1',
    slug: 'agua-y-saneamiento',
    name: 'Agua y saneamiento',
    odsLabel: 'ODS 6',
    members: 34,
    desc: 'Para quienes trabajan en captación, tratamiento o acceso a agua potable en comunidades.',
    recent: 'Aguacero Comunitario compartió avances de su prototipo en Oaxaca.',
  },
  {
    id: 'g2',
    slug: 'educacion-y-alfabetizacion',
    name: 'Educación y alfabetización',
    odsLabel: 'ODS 4',
    members: 58,
    desc: 'Talleres, tutorías y proyectos de alfabetización digital o tradicional.',
    recent: 'Puente Comunitario busca voluntarios para su siguiente generación de talleres.',
  },
  {
    id: 'g3',
    slug: 'consumo-responsable',
    name: 'Consumo y producción responsables',
    odsLabel: 'ODS 12',
    members: 21,
    desc: 'Economía circular, trazabilidad y reducción de desperdicio.',
    recent: 'Loop MX cerró su ronda semilla — pidió consejo sobre contratación.',
  },
  {
    id: 'g4',
    slug: 'trabajo-digno',
    name: 'Trabajo digno y economía social',
    odsLabel: 'ODS 8',
    members: 45,
    desc: 'Cooperativas, comercio justo y modelos de economía solidaria.',
    recent: 'Se abrió hilo sobre cómo estructurar una cooperativa de reparto.',
  },
  {
    id: 'g5',
    slug: 'gobierno-abierto',
    name: 'Gobierno abierto y alianzas',
    odsLabel: 'ODS 17',
    members: 16,
    desc: 'Vinculación con sector público y diseño de alianzas intersectoriales.',
    recent: 'Nuevo hilo: convocatoria de la Secretaría de Desarrollo Económico de Jalisco.',
  },
]

export function getGroupBySlug(slug) {
  return GROUPS.find((g) => g.slug === slug)
}
