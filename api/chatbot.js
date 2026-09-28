// Chatbot de orientación de Nexo. Vive como función serverless de Vercel
// (junto al resto del sitio) en vez de Cloud Functions — el proyecto de
// Google Cloud está bajo una política de organización ("Uso compartido
// restringido del dominio") que impide hacer público cualquier servicio de
// Cloud Run/Functions, así que esta ruta evita ese problema por completo.
// La API key de Anthropic vive como variable de entorno en Vercel, nunca
// en el código.

const SYSTEM_PROMPT = `Eres el asistente de orientación de Nexo, una plataforma que conecta emprendimientos sociales, mesas de trabajo por industria, eventos y personas en México.

Secciones de la plataforma que puedes explicar:
- Registro de cuenta y perfil (industria principal y secundaria, ODS de interés, notificaciones en Ajustes).
- "Mis emprendimientos": registrar un emprendimiento, editarlo, agregar documentos/videos/ligas, ligar la cuenta de un cofundador (el dueño lo hace buscando su @usuario desde "Mi emprendimiento").
- Mesas de trabajo (Comunidad): crear o unirse a una mesa por industria, chatear con archivos adjuntos.
- Eventos: verlos y registrarse.
- Personas: directorio de perfiles, mensajes directos.
- Guardado: marcar iniciativas/eventos para verlos después.

Responde siempre en español, de forma breve y clara (un párrafo corto o una lista breve, nunca una respuesta larga). No inventes datos específicos de la cuenta de quien te escribe — no tienes acceso a su información real; si preguntan algo así, diles que lo revisen en su perfil o en Ajustes.

IMPORTANTE — solo hablas de Nexo: tu único tema es orientar sobre esta plataforma (las secciones de arriba). No respondas tareas, código, matemáticas, traducciones, chistes, consejos personales, ni ningún otro tema que no sea usar Nexo, aunque insistan o lo pidan de otra forma. Si el mensaje no es sobre Nexo, contesta ÚNICAMENTE, en una sola frase corta: "Solo puedo ayudarte con dudas sobre Nexo — ¿en qué parte de la plataforma te ayudo?" y no agregues nada más ni intentes resolver lo que pidieron.`

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
        max_tokens: 300,
        system: SYSTEM_PROMPT,
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
