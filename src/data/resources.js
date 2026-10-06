// Recursos reales para emprendimiento en México — capturados de
// "Resources for Entrepreneurship Mexico 2026" (actualizado al 27 de
// septiembre de 2026). Se dividen por ciudad (Monterrey, CDMX,
// Guadalajara) más una pestaña de alcance nacional para lo que no es
// exclusivo de una sola zona.

export const RESOURCE_REGIONS = [
  { id: 'mty', name: 'Monterrey / Nuevo León' },
  { id: 'cdmx', name: 'Ciudad de México' },
  { id: 'gdl', name: 'Guadalajara / Jalisco' },
  { id: 'nacional', name: 'Alcance nacional' },
]

export const RESOURCES = {
  cdmx: [
    {
      id: 'fondeso-capital-semilla',
      title: 'FONDESO – Capital Semilla',
      category: 'Apoyo no reembolsable',
      desc: 'Apoyo único de $25,000 MXN no reembolsable para personas residentes en CDMX que inician un negocio por primera vez. Convocatoria abierta hasta agotar presupuesto del ejercicio; pre-registro con Llave CDMX.',
      link: 'fondeso.cdmx.gob.mx',
    },
    {
      id: 'fondeso-creditos',
      title: 'FONDESO – Créditos para emprendedores y MiPyMEs',
      category: 'Financiamiento',
      desc: 'Créditos de bajo interés (desde 3% anual fijo) de $25,000 a $100,000 para emprendimientos tradicionales y de $100,000 a $200,000 para proyectos de innovación tecnológica; incluye esquemas para mujeres y capacitación gratuita.',
      link: 'fondeso.cdmx.gob.mx',
    },
    {
      id: 'innovaunam',
      title: 'InnovaUNAM',
      category: 'Incubación',
      desc: 'Sistema de incubación de la UNAM que selecciona proyectos de la comunidad universitaria por su viabilidad técnica, financiera, social y ambiental para convertirlos en empresas u organizaciones sociales.',
      link: 'innova.unam.mx/convocatoria-innovaunam',
    },
    {
      id: 'sedeco-cdmx',
      title: 'SEDECO CDMX',
      category: 'Programas estatales',
      desc: 'Secretaría de Desarrollo Económico de la Ciudad de México; concentra programas de fomento a MiPyMEs, ferias, capacitación y vinculación con el ecosistema local.',
      link: 'sedeco.cdmx.gob.mx',
    },
    {
      id: 'impact-hub-cdmx',
      title: 'Impact Hub Ciudad de México',
      category: 'Comunidad / Aceleración',
      desc: 'Red de innovación social con espacio de trabajo, programas de incubación y aceleración para emprendimientos de impacto, y convocatorias con aliados corporativos.',
      link: 'mexicocity.impacthub.net',
    },
  ],

  mty: [
    {
      id: 'impulso-nuevo-leon',
      title: 'Impulso Nuevo León (FOCRECE)',
      category: 'Financiamiento',
      desc: 'Programa estatal de crédito preferencial para MiPyMEs operado por el fideicomiso FOCRECE con NAFIN y banca comercial: microcrédito, equipamiento productivo y crédito empresarial.',
      link: 'impulsonuevoleon.gob.mx',
    },
    {
      id: 'innovafest-monterrey',
      title: 'InnovaFest – Sede Monterrey',
      category: 'Convocatoria',
      desc: 'Estrategia nacional de la Secretaría de Economía para proyectos tecnológicos que atiendan retos sociales, económicos y ambientales. La edición 2026 (registro 9 mar–11 may) ya cerró; vigilar la siguiente.',
      link: 'nl.gob.mx',
    },
    {
      id: 'ella-emprende',
      title: 'Ella Emprende (SE Nuevo León)',
      category: 'Convocatoria',
      desc: 'Apoyos de hasta $150,000 MXN para proyectos de capacitación y asesoría dirigidos a mujeres emprendedoras en Nuevo León. Edición 2026 cerrada (6–20 jul); suele abrir a mitad de año.',
      link: 'nl.gob.mx',
    },
    {
      id: 'hecho-en-nuevo-leon',
      title: 'Hecho en Nuevo León',
      category: 'Distintivo / Aceleración',
      desc: 'Distintivo de origen y calidad de la Secretaría de Economía estatal que funciona como plataforma de profesionalización, acceso a cadenas de suministro y mercados para startups y MiPyMEs.',
      link: 'nl.gob.mx',
    },
    {
      id: 'ieegl-tec',
      title: 'Instituto de Emprendimiento Eugenio Garza Lagüera (Tec)',
      category: 'Incubación / Aceleración',
      desc: 'Red de emprendimiento del Tec de Monterrey con incubación, aceleración, consultorías, parques tecnológicos y laboratorios; abierta a estudiantes, EXATEC y público externo.',
      link: 'emprendimiento.tec.mx/es',
    },
    {
      id: 'enlace-mas-tec',
      title: 'Enlace+ (Tec de Monterrey)',
      category: 'Mentoría para empresas',
      desc: 'Programa del IEEGL con 18 años de trayectoria que fortalece empresas con al menos 4 años de operación y ventas de 20 a 500 mdp mediante consejos consultivos y gobierno corporativo.',
      link: 'emprendimiento.tec.mx/es',
    },
    {
      id: 'ciett-uanl',
      title: 'CIETT – UANL',
      category: 'Incubación / Transferencia',
      desc: 'Centro de Incubación de Empresas y Transferencia de Tecnología de la UANL: modelos de negocio, gestión de fondos, propiedad intelectual y vinculación empresarial.',
      link: 'ciett.uanl.mx',
    },
    {
      id: 'consorcio-uanl-tec',
      title: 'Consorcio UANL–Tec',
      category: 'Grant / Maduración',
      desc: 'Convocatorias conjuntas de innovación, emprendimiento y maduración de tecnologías para equipos liderados por investigadores de UANL y Tec; admite estudiantes de licenciatura y posgrado.',
      link: 'consorciouanltec.mx',
    },
    {
      id: 'incmty',
      title: 'incMTY',
      category: 'Evento / Networking',
      desc: 'Festival de emprendimiento del Tec de Monterrey con paneles, competencias, inversionistas y conexiones internacionales; punto de encuentro del ecosistema regional.',
      link: 'incmty.com',
    },
    {
      id: 'peak-nuevo-leon',
      title: 'Peak Nuevo León – Directorio del ecosistema',
      category: 'Directorio',
      desc: 'Mapa de incubadoras, aceleradoras, fondos y centros de emprendimiento de Nuevo León; útil para identificar aliados por etapa.',
      link: 'peaknl.mx/en/ecosystem',
    },
  ],

  gdl: [
    {
      id: 'projal',
      title: 'PROJAL (antes FOJAL)',
      category: 'Financiamiento',
      desc: 'Banca de desarrollo estatal que sustituye a FOJAL, con ocho programas de crédito y garantías para emprendedores y MiPyMEs de sectores estratégicos de Jalisco.',
      link: 'projal.jalisco.gob.mx',
    },
    {
      id: 'premio-jalisco-emprendimiento',
      title: 'Premio Jalisco al Emprendimiento',
      category: 'Premio',
      desc: 'Estímulos de $190,000 (Alto Impacto, Tradicional, Emprendedora Destacada) y $110,000 (Promesa), más mentoría y acceso a la red REDi. Edición 2026 cerró el 16 de agosto.',
      link: 'sicyt.jalisco.gob.mx',
    },
    {
      id: 'peicyt',
      title: 'Premio Estatal de Innovación, Ciencia y Tecnología (PEICyT)',
      category: 'Premio',
      desc: 'Reconocimiento anual de la SICyT a proyectos de innovación, ciencia y desarrollo tecnológico en Jalisco.',
      link: 'sicyt.jalisco.gob.mx',
    },
    {
      id: 'sicyt-convocatorias',
      title: 'Convocatorias abiertas SICyT Jalisco',
      category: 'Grants / Programas',
      desc: 'Listado oficial de convocatorias vigentes de la Secretaría de Innovación, Ciencia y Tecnología, incluido el Programa de Impulso a la Ciencia y Desarrollo Tecnológico.',
      link: 'sicyt.jalisco.gob.mx',
    },
    {
      id: 'coecytjal',
      title: 'COECyTJAL',
      category: 'Grant / Transferencia',
      desc: 'Consejo Estatal de Ciencia y Tecnología: financia I+D e innovación por convocatoria pública e impulsa emprendimiento de base tecnológica, propiedad intelectual y licenciamiento.',
      link: 'l.coecytjal.org.mx',
    },
    {
      id: 'jalisco-talent-land',
      title: 'Jalisco Talent Land',
      category: 'Evento / Networking',
      desc: 'Uno de los encuentros de tecnología y emprendimiento más grandes del país, con hackatones, retos corporativos y vinculación con inversionistas.',
      link: 'talent-land.mx',
    },
  ],

  nacional: [
    {
      id: 'nafin',
      title: 'NAFIN – Mi Primer Crédito y Crédito PyME',
      category: 'Financiamiento',
      desc: 'Banca de desarrollo con crédito vía banca comercial. Mi Primer Crédito: hasta 5 mdp a 5 años para empresas sin historial bancario; créditos de consolidación, garantías y capacitación gratuita.',
      link: 'nafin.com',
    },
    {
      id: 'bancomext',
      title: 'Bancomext',
      category: 'Financiamiento',
      desc: 'Crédito, garantías y apoyo para empresas exportadoras o con potencial exportador; orientado a negocios ya en operación.',
      link: 'bancomext.com',
    },
    {
      id: 'fira',
      title: 'FIRA',
      category: 'Financiamiento',
      desc: 'Crédito y garantías para proyectos agropecuarios, forestales, pesqueros y rurales, tramitados a través de intermediarios financieros autorizados.',
      link: 'fira.gob.mx',
    },
    {
      id: 'secihti',
      title: 'Secihti – Desarrollo Tecnológico, Vinculación e Innovación',
      category: 'Grant',
      desc: 'Convocatorias federales para proyectos de desarrollo tecnológico e innovación de empresas e instituciones (antes Conahcyt). Publica varias ventanas al año.',
      link: 'secihti.mx/convocatorias',
    },
    {
      id: 'posible',
      title: 'POSiBLE (Fundación Televisa)',
      category: 'Mentoría / Formación',
      desc: 'Programa nacional de formación y mentoría para ideas y negocios en crecimiento; hasta 100 seleccionados asisten a un Campamento Nacional intensivo de 5 días. Convocatoria anual (2026 cerró 3 may).',
      link: 'posible.org.mx',
    },
    {
      id: 'endeavor-mexico',
      title: 'Endeavor México',
      category: 'Mentoría / Red',
      desc: 'Red global que selecciona emprendedores de alto impacto en etapa de escalamiento y los conecta con mentores, inversionistas y talento.',
      link: 'endeavor.org.mx',
    },
    {
      id: 'google-startups-accelerator',
      title: 'Google for Startups Accelerator: Latinoamérica hispanohablante',
      category: 'Aceleración',
      desc: 'Programa de 10 semanas sin toma de capital para startups tecnológicas Seed a Serie A con operación en la región; mentoría técnica de Google y créditos de producto.',
      link: 'startup.google.com/programs/accelerator',
    },
    {
      id: '500-global-latam',
      title: '500 Global – LatAm',
      category: 'Aceleración / Inversión',
      desc: 'Aceleradora e inversionista de etapa temprana con programas para startups hispanohablantes: capital semilla, disciplina de levantamiento y red de inversionistas.',
      link: '500.co',
    },
    {
      id: 'startup-chile',
      title: 'Start-Up Chile',
      category: 'Aceleración / Capital no dilutivo',
      desc: 'Programa del gobierno chileno abierto a fundadores de cualquier país; otorga capital sin toma de participación a cambio de operar en Chile durante el programa.',
      link: 'startupchile.org',
    },
    {
      id: 'santander-x',
      title: 'Santander X',
      category: 'Premios / Comunidad',
      desc: 'Plataforma global del Banco Santander con retos, premios universitarios y recursos para emprendedores; publica convocatorias por país.',
      link: 'santanderx.com',
    },
    {
      id: 'aws-activate',
      title: 'AWS Activate',
      category: 'Créditos en la nube',
      desc: 'Créditos de AWS, soporte técnico y capacitación para startups; acceso directo o a través de aceleradoras e incubadoras aliadas.',
      link: 'aws.amazon.com/activate',
    },
    {
      id: 'google-cloud-startups',
      title: 'Google for Startups Cloud Program',
      category: 'Créditos en la nube',
      desc: 'Hasta US$350,000 en créditos de Google Cloud para startups elegibles, con soporte de expertos y recursos técnicos.',
      link: 'cloud.google.com/startup',
    },
    {
      id: 'microsoft-for-startups',
      title: 'Microsoft for Startups',
      category: 'Créditos en la nube',
      desc: 'Créditos de Azure, herramientas de desarrollo y acceso a mentoría técnica para startups en etapas tempranas.',
      link: 'microsoft.com/en-us/startups',
    },
    {
      id: 'hult-prize',
      title: 'Hult Prize',
      category: 'Competencia universitaria',
      desc: 'Competencia global para emprendimientos sociales universitarios; las rondas inician en campus y culminan con un premio de US$1 millón.',
      link: 'hultprize.org',
    },
    {
      id: 'mit-solve',
      title: 'MIT Solve',
      category: 'Grant / Reto global',
      desc: 'Retos anuales abiertos a innovadores de cualquier país con soluciones tecnológicas a problemas sociales y ambientales; financiamiento y red de apoyo.',
      link: 'solve.mit.edu',
    },
    {
      id: 'echoing-green',
      title: 'Echoing Green Fellowship',
      category: 'Beca / Grant',
      desc: 'Beca para líderes de emprendimientos sociales en etapa temprana: capital semilla, acompañamiento y comunidad global.',
      link: 'echoinggreen.org',
    },
    {
      id: 'cartier-womens-initiative',
      title: "Cartier Women's Initiative",
      category: 'Premio',
      desc: 'Programa internacional para empresas lideradas por mujeres con impacto social o ambiental; incluye financiamiento, coaching y red.',
      link: 'cartierwomensinitiative.com',
    },
    {
      id: 'amexcap',
      title: 'AMEXCAP – Directorio de fondos',
      category: 'Directorio / Inversión',
      desc: 'Asociación Mexicana de Capital Privado; directorio de fondos de venture capital y capital privado activos en México.',
      link: 'amexcap.com',
    },
  ],
}

// Lista plana de los recursos fijos de este archivo, cada uno con su
// `region` (mty/cdmx/gdl/nacional) — mismo formato que los recursos
// capturados a mano en Firestore, para poder ordenarlos y recomendarlos
// juntos (ver recommendResources en lib/recommend.js).
export function flattenResources() {
  return Object.entries(RESOURCES).flatMap(([region, list]) => list.map((r) => ({ ...r, region })))
}
