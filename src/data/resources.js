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

// ── Ubicación de cada recurso: región + estado ─────────────────────────────
// Los recursos de arriba están organizados por ciudad (mty, cdmx, gdl); cada
// uno se ubica además en su región y estado para poder filtrarlos igual que
// el resto de Nexo (ver src/data/cities.js). scope: 'estatal' (aplica en un
// estado), 'nacional' (todo el país o remoto) o 'internacional'.
const ZONE_LOCATION = {
  mty: { regionId: 'norte', state: 'Nuevo León' },
  cdmx: { regionId: 'centro', state: 'Ciudad de México' },
  gdl: { regionId: 'occidente', state: 'Jalisco' },
}

// Por verificar: estados donde no se encontró una convocatoria 2026
// confirmada — se listan como apoyo (la vía existe) pero marcados "sin
// convocatoria abierta" y sin enlace específico.
const NO_CALL_NOTE = 'No hay convocatoria abierta confirmada en 2026. '
function pendingState(regionId, state, hint) {
  return {
    id: `se-${state.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]+/g, '-')}`,
    title: `Secretaría de Desarrollo Económico de ${state}`,
    category: 'Apoyo estatal',
    desc: `${NO_CALL_NOTE}${hint}`,
    link: '',
    scope: 'estatal', regionId, state, noOpenCall: true,
  }
}
const CONSULT = 'Consulta el portal de la Secretaría de Economía o Desarrollo Económico estatal e Impulso Nafin.'
const CONSULT_SUR = 'Consulta el portal estatal, Impulso Nafin y FINABIEN.'

// Recursos del directorio "Resources for Entrepreneurship Mexico" (oct 2026).
// Montos y fechas vienen de comunicados y notas de prensa 2025–2026 — las
// convocatorias cambian cada año, hay que confirmar bases en el enlace.
const e = (id, regionId, state, title, category, desc, link, extra = {}) => ({ id, scope: 'estatal', regionId, state, title, category, desc, link, ...extra })
const n = (id, title, category, desc, link, extra = {}) => ({ id, scope: 'nacional', title, category, desc, link, ...extra })
const w = (id, title, category, desc, link, extra = {}) => ({ id, scope: 'internacional', title, category, desc, link, ...extra })

const EXTRA_RESOURCES = [
  // Norte
  e('caintra-creditos', 'norte', 'Nuevo León', 'Caintra – créditos con banca', 'Financiamiento', 'Esquemas de crédito con Santander y Banregio para pymes industriales afiliadas.', 'mexicoindustry.com/categoria.php?e=pymes'),
  e('pa-adelante-coahuila', 'norte', 'Coahuila', "Pa' Adelante", 'Financiamiento', 'Microcréditos de $10,000 a $30,000 con prioridad a jóvenes y mujeres; fondo revolvente de 100 mdp.', 'posta.com.mx/coahuila/que-tramites-y-apoyos-hay-en-coahuila-para-registrar-una-pyme/vl2234195', { genderFocus: 'mujeres' }),
  e('impulso-nafin-coahuila', 'norte', 'Coahuila', 'Impulso Nafin + Coahuila', 'Financiamiento', 'Créditos de $250,000 a 2.5 mdp para mipymes.', 'posta.com.mx/coahuila/que-tramites-y-apoyos-hay-en-coahuila-para-registrar-una-pyme/vl2234195'),
  e('fideapech', 'norte', 'Chihuahua', 'Fideapech', 'Financiamiento', 'Fideicomiso estatal con cinco modalidades de crédito, hasta 5 mdp; trámite digital.', 'fideapech.com'),
  e('impulso-chihuahua-2026', 'norte', 'Chihuahua', 'Impulso Chihuahua 2026', 'Financiamiento', 'Bolsa de 900 mdp con Nafin: créditos sin garantía para mipymes.', 'razon.com.mx/estados/2026/06/16/chihuahua-impulsa-mipymes-con-creditos-de-hasta-5-millones-de-pesos/'),
  e('programa-200-chihuahua', 'norte', 'Chihuahua', 'Programa "200" (municipio de Chihuahua)', 'Financiamiento', '200 créditos de hasta $30,000 al 1.3 % mensual en la capital.', 'tiempo.com.mx/local/programa-200-creditos-emprendedores-chihuahua-fomech-demic-junio-2026/'),
  e('impulsa-bc', 'norte', 'Baja California', 'Impulsa BC', 'Financiamiento', 'Tu Idea Tu Negocio, Emprende Tradicional y Emprende Empresarial: de $10,000 a $500,000, hasta 36 meses.', 'razon.com.mx/estados/2026/01/08/anuncia-gobernadora-de-bc-convocatorias-de-financiamiento-a-emprendedores-2026/'),
  e('ismujeres-bcs', 'norte', 'Baja California Sur', 'Créditos a mujeres emprendedoras (ISMujeres)', 'Financiamiento', 'Hasta $25,000 al 0 % en 18 mensualidades (convocatoria anual).', 'ismujeres.bcs.gob.mx/wp-content/uploads/2025/09/CONVOCATORIA-DE-CREDITOS-2025-.pdf', { genderFocus: 'mujeres' }),
  e('sedeco-sinaloa', 'norte', 'Sinaloa', 'Sedeco – microcréditos', 'Financiamiento', 'Créditos de $5,000 a $300,000; tasa preferente para mujeres.', 'tusbuenasnoticias.com/economia/sinaloa-encima-nacional-generacion-de-empleos/', { genderFocus: 'mujeres' }),
  e('fondo-culiacan-2026', 'norte', 'Sinaloa', 'Fondo municipal-estatal 2026 (Culiacán)', 'Financiamiento', '120 mdp en créditos de $300,000 a 1.5 mdp, con 6 meses de gracia.', 'luznoticias.mx/2026-02-11/sinaloa/gamez-mendivil-anuncia-inversion-de-120-mdp-para-brindar-creditos-a-mipymes-de-culiacan/277741'),
  e('fondo-tamaulipas', 'norte', 'Tamaulipas', 'Fondo Tamaulipas', 'Financiamiento', 'Microcrédito, Microemprendedor y Credibienestar; más de 3 mil apoyos en 2025.', 'posta.com.mx/tamaulipas/fondo-tamaulipas-impulsa-a-mas-de-3-mil-emprendedores-con-microcreditos-y-fortalece-la-economia-familiar/vl2144528'),
  e('hecho-en-tamaulipas', 'norte', 'Tamaulipas', 'Hecho en Tamaulipas', 'Red / comercialización', 'Distintivo de origen para productos locales.', 'posta.com.mx/tamaulipas/hecho-en-tampico-el-sello-que-busca-convertir-a-las-pymes-en-protagonistas-del-desarrollo-industrial/vl2191692'),
  pendingState('norte', 'Sonora', CONSULT),
  pendingState('norte', 'Durango', CONSULT),

  // Occidente y Bajío
  e('fojal', 'occidente', 'Jalisco', 'FOJAL', 'Financiamiento + incubación', 'Fojal Emprende, Avanza y Consolida; incluye el modelo de incubación de la Academia FOJAL.', 'transparencia.info.jalisco.gob.mx/sites/default/files//FOJAL_emprende_Jalisco.pdf'),
  e('tu-puedes-guanajuato', 'occidente', 'Guanajuato', 'Tú Puedes Guanajuato', 'Financiamiento', 'Financiera estatal para mipymes y emprendedores fuera del sistema bancario; bolsa inicial de 400 mdp.', 'publimetro.com.mx/guanajuato/2025/01/28/tu-puedes-guanajuato-financiera-que-apuesta-por-la-inclusion-y-el-crecimiento-economico/'),
  e('creemos-en-ti', 'occidente', 'Guanajuato', 'Creemos en Ti', 'Capital semilla', 'Apoyo único de $7,000 con taller y acompañamiento, por convocatorias regionales.', 'unotv.com/estados/guanajuato/programa-creemos-en-ti-en-guanajuato-como-registrarse-y-obtener-7-mil-pesos/'),
  e('confia-aguascalientes', 'occidente', 'Aguascalientes', 'Programa Confía (Sedecyt)', 'Financiamiento / apoyos', 'Nueve convocatorias para emprendedores y mipymes.', 'eluniversal.com.mx/estados/teresa-jimenez-entrega-apoyos-por-16-mdp-a-emprendedores-y-mipymes/'),
  e('sifia-aguascalientes', 'occidente', 'Aguascalientes', 'Sifia + Nafin/Bancomext', 'Financiamiento / exportación', '1,300 mdp para mipymes que buscan mercados internacionales.', 'elfinanciero.com.mx/estados/2026/04/21/tere-jimenez-anuncia-programa-para-fortalecer-pymes-y-su-expansion-internacional/'),
  e('si-financia-michoacan', 'occidente', 'Michoacán', 'Sí Financia', 'Financiamiento', 'Organismo estatal que concentra los créditos a emprendedores y mipymes.', 'tiendanube.com/blog/apoyos-del-gobierno-de-michoacan-para-iniciar-un-negocio/'),
  e('sueno-michoacano', 'occidente', 'Michoacán', 'Sueño Michoacano Inversión Productiva', 'Financiamiento', 'Coinversión con migrantes para proyectos productivos; convocatoria anual en abril–mayo.', 'tiendanube.com/blog/apoyos-del-gobierno-de-michoacan-para-iniciar-un-negocio/'),
  e('san-luis-emprende', 'occidente', 'San Luis Potosí', 'Estrategia Estatal de Apoyo y Reto San Luis Emprende', 'Competencia + capacitación', 'Concurso que capacita a los 100 mejores proyectos; talleres como Acelera tu Negocio y San Luis Innova. Verifica la edición vigente.', 'elfinanciero.com.mx/bajio/lanza-slp-estrategia-de-apoyo-a-emprendedores-y-mipymes'),
  e('mipymes-zacatecas-2026', 'occidente', 'Zacatecas', 'Programa municipal de mipymes 2026 (capital)', 'Financiamiento', 'Lineamientos 2026 del Ayuntamiento para apoyo a micro, pequeña y mediana empresa.', 'portal.capitaldezacatecas.gob.mx/storage/app/uploads/public/6a3/57a/453/6a357a4532eae366820947.pdf'),
  pendingState('occidente', 'Querétaro', CONSULT),
  pendingState('occidente', 'Colima', CONSULT),
  pendingState('occidente', 'Nayarit', CONSULT),

  // Centro
  e('fondeso-ikal', 'centro', 'Ciudad de México', 'FONDESO – Capital Semilla Ikal', 'Capital semilla', '$25,000 no reembolsables; bolsa 2026 de 100 mdp para unos 4 mil proyectos.', 'chilango.com/noticias/capital-semilla-2026-requisitos-programa-social-cdmx/'),
  e('fondeso-xitopehua', 'centro', 'Ciudad de México', 'FONDESO – Crédito Xitopehua', 'Financiamiento', 'Créditos de $10,000 a $100,000; 0 % de interés en montos de $10,000 a $30,000.', 'sdpnoticias.com/estados/cdmx/fondeso-requisitos-para-recibir-prestamos-de-10-mil-a-30-mil-pesos-con-0-de-interes-de-la-cdmx/'),
  e('startup-mexico', 'centro', 'Ciudad de México', 'Startup México', 'Hub / incubación', 'Campus de emprendimiento con programas de incubación, eventos y conexión corporativa.', 'startupmexico.com'),
  e('ime-edomex', 'centro', 'Estado de México', 'Instituto Mexiquense del Emprendedor', 'Asesoría / financiamiento', 'Ventanilla estatal de apoyos, capacitación y vinculación. Verifica la convocatoria vigente.', 'ime.edomex.gob.mx'),
  e('incentivos-verdes-puebla', 'centro', 'Puebla', 'Incentivos Verdes 2026', 'Subsidio', 'Apoyo a mipymes para instalar paneles solares.', 'mexicoindustry.com/categoria.php?e=pymes'),
  e('impulsa-joven-morelos', 'centro', 'Morelos', 'Impulsa Joven – Incúbate (FIFODEPI)', 'Incubación / apoyo', 'Apoyos para jóvenes de 18 a 29 años vía incubadoras e instituciones académicas del estado.', 'mir.morelos.gob.mx/records/4EA01AF92C6440AFB0811B868464DB40.pdf'),
  e('cultura-emprendedora-tlaxcala', 'centro', 'Tlaxcala', 'Programa de Apoyo a la Cultura Emprendedora', 'Apoyo / capacitación', 'Programa estatal anual con reglas publicadas (edición 2025).', 'publicaciones.tlaxcala.gob.mx/indices/2Ex09102025.pdf'),
  pendingState('centro', 'Hidalgo', 'Consulta el portal de la Secretaría de Desarrollo Económico estatal.'),

  // Sur
  e('fifeo-oaxaca', 'sur', 'Oaxaca', 'Créditos Incluyentes (FIFEO)', 'Financiamiento', 'Fideicomiso de Fomento del Estado: crédito preferencial para mipymes y emprendedores.', 'oaxaca.gob.mx/fifeo/wp-content/uploads/sites/33/2026/01/Programas-y-Proyectos-de-Inversion-4o-Inf-Trim-25-DC.pdf'),
  pendingState('sur', 'Veracruz', CONSULT_SUR),
  pendingState('sur', 'Chiapas', CONSULT_SUR),
  pendingState('sur', 'Guerrero', CONSULT_SUR),

  // Sureste
  e('mujer-transformadora', 'sureste', 'Yucatán', 'Mujer Transformadora', 'Financiamiento', 'Créditos de $25,000 a $75,000 para mujeres, tasa de un dígito y 90 días de gracia; vigente hasta 2030.', 'posta.com.mx/yucatan/entregan-en-yucatan-primeros-financiamientos-del-programa-mujer-transformadora-/vl2175280', { genderFocus: 'mujeres' }),
  e('microcreditos-bienestar-yucatan', 'sureste', 'Yucatán', 'Microcréditos del Bienestar (estatal)', 'Financiamiento', 'Crédito de bajo costo para trabajadores independientes: maquinaria, equipo e insumos.', 'poresto.com/yucatan/2025/12/3/microcreditos-del-bienestar-en-yucatan-requisitos-y-como-solicitarlos.html'),
  e('micromer-merida', 'sureste', 'Yucatán', 'Micromer y créditos municipales (Mérida)', 'Financiamiento', 'Requisitos simplificados en 2026; negocios de reciente creación ya pueden aplicar.', 'poresto.com/yucatan/merida/2026/4/14/como-acceder-a-creditos-para-emprendedores-en-merida-en-2026-requisitos-y-montos.amp.html'),
  pendingState('sureste', 'Tabasco', CONSULT_SUR),
  pendingState('sureste', 'Campeche', CONSULT_SUR),
  pendingState('sureste', 'Quintana Roo', CONSULT_SUR),

  // Alcance nacional y remoto
  n('finabien-tandas', 'FINABIEN – Tandas del Bienestar', 'Financiamiento', 'Para micronegocios, incluso informales: de $6,000 a $45,000 en escalones; 0 % de interés en la primera tanda con pago puntual.', 'news.culturacolectiva.com/noticias/mexico/credito-gobierno-para-negocio-2026-programas-federales/'),
  n('nafin-pyme-joven', 'Nafin – Crédito PyME Joven y garantías', 'Financiamiento', 'Para negocios formales: de $300,000 a 2.5 mdp sin garantía hipotecaria, vía banca comercial; además, cursos gratuitos en línea.', 'nafin.com'),
  n('impulso-nafin-estados', 'Impulso Nafin + Estados', 'Financiamiento', 'Bolsas regionales coordinadas con gobiernos estatales (Chihuahua, Coahuila, Tamaulipas, entre otros) para mipymes.', 'tiendanube.com/blog/apoyos-de-gobierno-para-iniciar-un-negocio/'),
  n('innovafest-premio', 'Premio a la Innovación Mexicana – InnovaFest (SE)', 'Competencia / premio', 'Premios de hasta $250,000 para inventores, investigadores y emprendedores; 2,911 proyectos registrados en 2026.', 'cronica.com.mx/nacional/2026/05/30/innovafest-2026-reconoce-a-24-proyectos-mexicanos-con-hasta-250-mil-pesos/'),
  n('incmty-retos', 'INCmty – convocatorias y retos', 'Competencia / aceleración', 'Concursos de startups para estudiantes, startups y pymes; programas como la Aceleradora PotencIA MX (IA para pymes, con Meta) y vínculo a SXSW.', 'incmty.com'),
  n('ife-accelerator', 'IFE Accelerator (Tec de Monterrey)', 'Aceleración', 'Para startups EdTech: inmersión de un mes en CDMX y Monterrey; red de más de 200 startups.', 'edtech.tec.mx/sites/g/files/vgjovo1926/files/%5BIFE%20Accelerator%2026%5D%20Bases.docx.pdf'),
  n('wayra-mexico', 'Wayra México', 'Aceleración / inversión', 'Para startups tecnológicas: inversión corporativa de Telefónica y acceso a clientes.', 'wayra.com'),
  n('mexico-early-stage-100', 'Mexico Early Stage 100', 'Ranking / visibilidad', 'Ranking de Mexico Tech Week para startups pre-Serie A, con exposición a inversionistas de EE. UU.', ''),
  n('ashoka-mexico', 'Ashoka México', 'Red / fellowship', 'Fellowship para líderes con innovación social sistémica.', 'ashoka.org/es-mx'),
  n('condusef-comparador', 'Comparador de créditos pyme (CONDUSEF)', 'Herramienta', 'Compara tasas y condiciones de créditos bancarios para cualquier negocio.', 'condusef.gob.mx'),

  // Internacional
  w('bid-lab-financiamiento', 'BID Lab – financiamiento', 'Financiamiento / capital', 'Para startups y empresas de impacto en América Latina y el Caribe. Postulación continua; instrumentos reembolsables, no reembolsables y de capital.', 'bogota.gov.co/boletin-oferta-internacional/financiamiento-bid-lab-para-startups-y-empresas-innovadoras'),
  w('bid-convocatorias', 'Convocatorias del BID', 'Convocatorias temáticas', 'Llamados periódicos para organizaciones, investigadores y gobiernos: residuos y metano, investigación sobre IA, entre otros.', 'iadb.org/es/como-trabajar-juntos/convocatorias'),
  w('gobernarte', 'Gobernarte – Premio Pablo Valenti (BID)', 'Premio', 'Reconoce innovación en gestión pública de gobiernos estatales y municipales.', 'iadb.org/es/como-trabajar-juntos/convocatorias'),
  w('wexchange', 'WeXchange (BID Lab)', 'Red / aceleración', 'Para emprendedoras STEM, de pre-semilla a Serie B: conexión con inversionistas y bootcamp con Google.', 'forbesargentina.com/liderazgo/convocatoria-abierta-nuevas-oportunidades-emprendedoras-stem-region-n14295/amp', { genderFocus: 'mujeres' }),
  w('puentes-de-talento', 'Puentes de Talento (BID Lab + Madrid)', 'Programa de inmersión', 'Para fundadores de 23 a 35 años: conexión con el ecosistema europeo vía Madrid; incluye seleccionados mexicanos.', 'iadb.org/es/noticias/bid-lab-y-el-ayuntamiento-de-madrid-impulsan-emprendedores-de-america-latina-en-nueva-edicion-de'),
  w('y-combinator', 'Y Combinator', 'Aceleración / inversión', 'Para startups tecnológicas globales: postulación en línea, varias tandas por año.', 'ycombinator.com'),
  w('founders-inc-blueprint', 'Founders, Inc. – Blueprint', 'Aceleración / inversión', 'Deep tech y hardware: tres meses en San Francisco; $150,000 dólares por 5 % de capital.', 'f.inc/blueprint'),
  w('ashoka-global', 'Ashoka', 'Fellowship', 'Red global de agentes de cambio para emprendedores sociales.', 'ashoka.org/es-mx'),
  w('circular-packaging-challenge', 'Circular Packaging Challenge (Ecoembes)', 'Competencia', 'Para startups de empaque circular: 16 finalistas viajan a Madrid; premios por 16 mil euros.', ''),
  w('coalar-grants', 'COALAR Grants', 'Subvención', 'Para proyectos Australia–América Latina: fondos para educación, emprendimiento, transición energética y pueblos indígenas.', ''),
]

const LEGACY_NATIONAL_ZONE = 'nacional'

function withLocation(r, zone) {
  if (zone === LEGACY_NATIONAL_ZONE) return { ...r, scope: 'nacional' }
  const loc = ZONE_LOCATION[zone]
  return loc ? { ...r, scope: 'estatal', ...loc } : { ...r, scope: 'estatal' }
}

// Todos los recursos fijos (los de arriba + los del directorio), en una
// lista plana con scope/regionId/state — mismo formato que
// normalizeResource deja a los capturados a mano en Firestore.
export function flattenResources() {
  const base = Object.entries(RESOURCES).flatMap(([zone, list]) => list.map((r) => withLocation(r, zone)))
  return [...base, ...EXTRA_RESOURCES]
}

// Los recursos capturados a mano antes de este cambio traen `region` con el
// id de ciudad (mty, cdmx…) o "nacional" — se traducen a región y estado.
// Los nuevos ya traen scope/regionId/state directamente.
export function normalizeResource(r) {
  if (r.scope) return r
  return withLocation(r, r.region)
}
