// Preguntas frecuentes para el asistente de la landing pública — respuestas
// fijas en vez de llamar a la API/LLM, para que el bot público sea 100%
// predecible y no dependa de un costo por token. El chatbot "de adentro"
// del dashboard sigue usando la API (ver Chatbot.jsx); esto solo cubre la
// zona pública.

export const SUPPORT_EMAIL = 'support@nexohub.mx'

export const CHATBOT_FAQ = [
  {
    id: 'que-es',
    prompt: '¿Qué es Nexo?',
    keywords: ['que es nexo', 'que es esto', 'de que se trata', 'de que trata', 'plataforma', 'para que sirve'],
    answer: 'Nexo es el mapa de tu ecosistema de emprendimiento: reúne emprendimientos activos, personas, recursos y eventos en un solo lugar, para que no construyas desde cero ni sola.',
    link: { to: '/como-funciona', label: 'Ver cómo funciona' },
  },
  {
    id: 'registrar',
    prompt: '¿Cómo registro mi emprendimiento?',
    keywords: ['registrar', 'registro', 'crear cuenta', 'como me registro', 'mi emprendimiento', 'sumar mi emprendimiento', 'unirme'],
    answer: 'Puedes crear tu cuenta gratis en unos minutos y registrar tu emprendimiento, tu perfil como mentor/a, o el de tu institución.',
    link: { to: '/register', label: 'Registrarse' },
  },
  {
    id: 'perfiles',
    prompt: '¿Qué tipos de perfil hay?',
    keywords: ['tipo de perfil', 'tipos de perfil', 'mentor', 'estudiante', 'voluntario', 'institucion', 'organizacion'],
    answer: 'Hay varios tipos de perfil — emprendedor/a, estudiante, mentor/a, institución/organización y voluntario/a — cada uno ajustado a lo que puede aportar o necesita.',
    link: { to: '/register', label: 'Ver al registrarse' },
  },
  {
    id: 'catalogo',
    prompt: '¿Cómo veo los emprendimientos?',
    keywords: ['catalogo', 'ver emprendimientos', 'explorar emprendimientos', 'buscar emprendimientos', 'proyectos', 'iniciativas'],
    answer: 'El catálogo público muestra emprendimientos reales en curso, filtrables por industria y por lo que necesitan.',
    link: { to: '/iniciativas', label: 'Explorar emprendimientos' },
  },
  {
    id: 'eventos',
    prompt: '¿Hay eventos próximamente?',
    keywords: ['evento', 'eventos', 'taller', 'talleres', 'hackathon', 'pitch day'],
    answer: 'Organizamos talleres, hackathons y pitch days — los espacios donde el mapa se vuelve conversación real, cara a cara.',
    link: { to: '/eventos', label: 'Ver eventos' },
  },
  {
    id: 'recursos',
    prompt: '¿Qué recursos hay disponibles?',
    keywords: ['recurso', 'recursos', 'financiamiento', 'fondeo', 'mentoria', 'apoyo', 'capital', 'beca', 'incubadora', 'aceleradora'],
    answer: 'Reunimos convocatorias, financiamiento, mentoría y aceleración que ya existen pero nadie sabía dónde buscar — alcance nacional, más lo exclusivo de tu ciudad al iniciar sesión.',
    link: { to: '/recursos', label: 'Ver recursos' },
  },
  {
    id: 'equipo',
    prompt: '¿Quiénes son ustedes?',
    keywords: ['quienes son', 'equipo', 'fundadores', 'contacto', 'nosotros', 'quien esta detras'],
    answer: 'Somos un equipo enfocado en dejar de reconstruir lo que ya existe en el ecosistema de emprendimiento en México.',
    link: { to: '/nosotros', label: 'Conócenos' },
  },
]

export const FAQ_FALLBACK = {
  content: 'No tengo una respuesta preparada para eso todavía. Escríbenos directamente y te ayudamos con gusto:',
  link: { href: `mailto:${SUPPORT_EMAIL}`, label: SUPPORT_EMAIL },
}

const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

// Coincidencia simple por palabra clave (no requiere red ni tokens): la
// pregunta gana la entrada cuya keyword más larga aparezca en el texto, así
// una coincidencia específica ("mi emprendimiento") le gana a una genérica
// ("registro") si ambas aplican.
export function matchFaq(text) {
  const normalized = stripAccents(text.toLowerCase())
  let best = null
  let bestScore = 0
  for (const entry of CHATBOT_FAQ) {
    for (const kw of entry.keywords) {
      const kwNorm = stripAccents(kw)
      if (normalized.includes(kwNorm) && kwNorm.length > bestScore) {
        bestScore = kwNorm.length
        best = entry
      }
    }
  }
  return best
}
