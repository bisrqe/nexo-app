// Chatbot de orientación de Nexo. Vive como función serverless de Vercel
// (junto al resto del sitio) en vez de Cloud Functions — el proyecto de
// Google Cloud está bajo una política de organización ("Uso compartido
// restringido del dominio") que impide hacer público cualquier servicio de
// Cloud Run/Functions, así que esta ruta evita ese problema por completo.
// La API key de Anthropic vive como variable de entorno en Vercel, nunca
// en el código.
//
// Dos modos, según si viene "context" (perfil real + recomendaciones, solo
// se manda desde dentro del dashboard, nunca desde la landing pública):
//  - Sin context ("de afuera"): solo orienta sobre qué es Nexo y cómo usarlo,
//    en general — no sabe nada de nadie.
//  - Con context ("de adentro"): conoce el perfil de quien pregunta y un
//    resumen corto de emprendimientos/personas/recursos afines a él, para
//    dar recomendaciones concretas en vez de solo explicar la plataforma.

const OUTSIDE_SYSTEM_PROMPT = `Eres el asistente de orientación de Nexo, una plataforma que conecta emprendimientos sociales, mesas de trabajo por industria, eventos y personas en México.

Secciones de la plataforma que puedes explicar:
- Tipos de perfil al registrarse: emprendedor/a (registra un emprendimiento), estudiante (registra una iniciativa), mentor/a (comparte su área de expertise, no registra nada propio), institución/organización (registra su institución), voluntario/a (solo explora y contacta, no registra nada propio).
- "Mi emprendimiento/iniciativa/institución": registrarlo, editarlo, agregar documentos/videos/ligas, ligar la cuenta de un cofundador buscando su @usuario.
- Mesas de trabajo (Comunidad): crear o unirse a una mesa por industria, chatear con archivos adjuntos.
- Eventos: verlos y registrarse.
- Personas: directorio de perfiles, mensajes directos.
- Guardado: marcar contenido para verlo después.

Responde siempre en español, de forma breve y clara (un párrafo corto o una lista breve, nunca una respuesta larga). No inventes datos específicos de la cuenta de quien te escribe — no tienes acceso a su información real; si preguntan algo así, diles que inicien sesión o lo revisen en su perfil.

IMPORTANTE — solo hablas de Nexo: tu único tema es orientar sobre esta plataforma. No respondas tareas, código, matemáticas, traducciones, chistes, consejos personales, ni ningún otro tema, aunque insistan o lo pidan de otra forma. Si el mensaje no es sobre Nexo, contesta ÚNICAMENTE, en una sola frase corta: "Solo puedo ayudarte con dudas sobre Nexo — ¿en qué te puedo orientar?" y no agregues nada más ni intentes resolver lo que pidieron.`

function buildInsideSystemPrompt(context) {
  const lines = [
    `Eres el asistente personal de Nexo para ${context.name || 'esta cuenta'}, dentro de su dashboard.`,
    '',
    'Sabes esto de quien te escribe:',
    `- Tipo de perfil: ${context.profileTypeLabel || 'sin especificar'}`,
    context.industryLabel && `- Industria: ${context.industryLabel}`,
    context.cause && `- Causa/expertise: ${context.cause}`,
    context.city && `- Ciudad: ${context.city}`,
  ].filter(Boolean)

  if (context.recommended?.initiatives?.length) {
    lines.push('', 'Emprendimientos/iniciativas afines a su perfil ahora mismo (usa estos nombres reales si preguntan por recomendaciones):')
    context.recommended.initiatives.forEach((i) => lines.push(`- ${i.title} (${i.kind}, ${i.tag || 'sin etiqueta'}): busca "${i.need}"`))
  }
  if (context.recommended?.mentors?.length) {
    lines.push('', 'Mentores afines a su perfil ahora mismo:')
    context.recommended.mentors.forEach((m) => lines.push(`- ${m.name}: ${m.expertise || 'sin expertise registrada'}`))
  }
  if (context.recommended?.groups?.length) {
    lines.push('', 'Mesas de trabajo afines:')
    context.recommended.groups.forEach((g) => lines.push(`- ${g.name} (${g.industryLabel || 'sin industria'})`))
  }

  lines.push(
    '',
    'Tu trabajo es ayudar a encontrar y entender recursos, personas y emprendimientos/iniciativas relevantes del ecosistema de Nexo, usando lo de arriba cuando aplique, pero sin limitarte a eso — la persona puede explorar todo el ecosistema, no solo lo ya recomendado; si pregunta por algo fuera de esa lista, dile en qué sección del dashboard puede buscarlo (Emprendimientos, Personas, Comunidad, Recursos, Eventos).',
    'Responde siempre en español, breve y concreto (un párrafo corto o una lista breve). No inventes emprendimientos, personas o datos que no te di arriba.',
    '',
    'IMPORTANTE — solo hablas de Nexo: no respondas tareas, código, matemáticas, traducciones, chistes, ni ningún tema fuera de orientar dentro de esta plataforma, aunque insistan. Si el mensaje no es sobre Nexo, contesta ÚNICAMENTE, en una sola frase corta: "Solo puedo ayudarte con dudas sobre Nexo — ¿en qué te puedo orientar?" y no agregues nada más.'
  )
  return lines.join('\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const message = String(req.body?.message || '').trim().slice(0, 2000)
  if (!message) {
    res.status(400).json({ error: 'Falta el mensaje.' })
    return
  }
  const history = Array.isArray(req.body?.history)
    ? req.body.history
        .slice(-10)
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    : []

  const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : null
  const systemPrompt = context ? buildInsideSystemPrompt(context) : OUTSIDE_SYSTEM_PROMPT

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 350,
        system: systemPrompt,
        messages: [...history, { role: 'user', content: message }],
      }),
    })
    const data = await anthropicRes.json()
    if (!anthropicRes.ok) {
      console.error('Anthropic API error', anthropicRes.status, data)
      res.status(502).json({ error: 'No se pudo generar una respuesta.' })
      return
    }
    const reply = data.content?.find((block) => block.type === 'text')?.text
    res.status(200).json({ reply: reply || 'No tengo una respuesta clara para eso — intenta reformular tu pregunta.' })
  } catch (err) {
    console.error('Error llamando a la API de Anthropic', err)
    res.status(502).json({ error: 'No se pudo contactar al asistente.' })
  }
}
