// Correos personalizados de Nexo. Corre con permisos de administrador
// (bypassa las reglas de Firestore) — por eso vive aquí y no en el
// cliente. Cada trigger revisa las preferencias de notificación del
// destinatario antes de mandar nada.
const { setGlobalOptions } = require('firebase-functions/v2')
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { defineSecret } = require('firebase-functions/params')
const logger = require('firebase-functions/logger')
const admin = require('firebase-admin')
const { renderEmail, htmlToText, APP_URL } = require('./emailTemplate')

admin.initializeApp()
const db = admin.firestore()

setGlobalOptions({ region: 'us-central1', maxInstances: 10 })

// Mismo dominio que src/context/AuthContext.jsx (AUTH_ACTION_URL) — tiene
// que estar en "Authorized domains" del proyecto de Firebase Auth.
const AUTH_ACTION_URL = 'https://nexohub.mx'

const RESEND_API_KEY = defineSecret('RESEND_API_KEY')
// Requiere que nexohub.mx esté verificado como dominio en Resend (Resend
// dashboard → Domains → Add Domain → agregar los registros DNS que dé ahí).
// Mientras no esté verificado, sendEmail falla en silencio (solo queda el
// error en los logs de la función) y no se manda ningún correo.
const FROM = 'Nexo <notificaciones@nexohub.mx>'
const SUPPORT_EMAIL = 'support@nexohub.mx'

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

// Siempre manda html y text juntos: si quien llama solo trae html (o no usa
// renderEmail), el texto plano se deriva de él. reply_to apunta al buzón de
// soporte para que responder a un correo automático llegue a alguien.
async function sendEmail({ to, subject, html, text }) {
  if (!to) return
  const plainText = text || htmlToText(html)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY.value()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html, text: plainText, reply_to: SUPPORT_EMAIL }),
    })
    if (!res.ok) logger.error('Resend error', res.status, await res.text())
  } catch (err) {
    logger.error('Error enviando correo', err)
  }
}

// Alguien te manda un mensaje directo.
exports.onDirectMessage = onDocumentCreated(
  { document: 'conversations/{convId}/messages/{msgId}', secrets: [RESEND_API_KEY] },
  async (event) => {
    const msg = event.data.data()
    const convSnap = await db.doc(`conversations/${event.params.convId}`).get()
    if (!convSnap.exists) return
    const conv = convSnap.data()
    const recipientUid = (conv.participants || []).find((p) => p !== msg.senderUid)
    if (!recipientUid) return

    const profileSnap = await db.doc(`profiles/${recipientUid}`).get()
    if (!profileSnap.exists) return
    const profile = profileSnap.data()
    if (profile.notificationPrefs?.onMessage === false || !profile.email) return

    const senderName = conv.participantNames?.[msg.senderUid] || 'Alguien'
    const body = msg.text
      ? `<blockquote style="margin:0; padding-left:12px; border-left:3px solid rgba(16,27,38,.14); color:#5E6672;">${escapeHtml(msg.text)}</blockquote>`
      : `<p style="margin:0;">Te mandó un archivo${msg.fileName ? `: <b>${escapeHtml(msg.fileName)}</b>` : ''}.</p>`

    await sendEmail({
      to: profile.email,
      subject: `${senderName} te escribió en Nexo`,
      ...renderEmail({
        preheader: `${senderName} te mandó un mensaje directo en Nexo`,
        heading: `${escapeHtml(senderName)} te escribió`,
        bodyHtml: body,
        cta: { href: `${APP_URL}/app/mensajes`, label: 'Responder →' },
      }),
    })
  }
)

// Alguien se une a una mesa de trabajo que creaste.
exports.onGroupJoin = onDocumentUpdated(
  { document: 'profiles/{uid}', secrets: [RESEND_API_KEY] },
  async (event) => {
    const before = event.data.before.data().joinedGroups || []
    const after = event.data.after.data().joinedGroups || []
    const newGroups = after.filter((id) => !before.includes(id))
    if (newGroups.length === 0) return

    const joinerName = event.data.after.data().name || 'Alguien'

    for (const groupId of newGroups) {
      const groupSnap = await db.doc(`groups/${groupId}`).get()
      if (!groupSnap.exists) continue
      const group = groupSnap.data()
      if (group.ownerUid === event.params.uid) continue // se auto-unió al crearla

      const ownerSnap = await db.doc(`profiles/${group.ownerUid}`).get()
      if (!ownerSnap.exists) continue
      const owner = ownerSnap.data()
      if (owner.notificationPrefs?.onGroupActivity === false || !owner.email) continue

      await sendEmail({
        to: owner.email,
        subject: `${joinerName} se unió a tu mesa "${group.name}"`,
        ...renderEmail({
          preheader: `${joinerName} se unió a tu mesa de trabajo en Nexo`,
          heading: 'Nueva persona en tu mesa de trabajo',
          bodyHtml: `<p style="margin:0;"><b>${escapeHtml(joinerName)}</b> se unió a tu mesa de trabajo <b>${escapeHtml(group.name)}</b> en Nexo.</p>`,
          cta: { href: `${APP_URL}/app/comunidad/${group.slug}`, label: 'Ver mesa →' },
        }),
      })
    }
  }
)

// Alguien marca "Me interesa" en tu emprendimiento.
exports.onInitiativeInterest = onDocumentUpdated(
  { document: 'initiatives/{id}', secrets: [RESEND_API_KEY] },
  async (event) => {
    const before = event.data.before.data().interestedBy || []
    const after = event.data.after.data()
    const afterInterested = after.interestedBy || []
    const newInterested = afterInterested.filter((uid) => !before.includes(uid))
    if (newInterested.length === 0 || !after.ownerUid) return

    const ownerSnap = await db.doc(`profiles/${after.ownerUid}`).get()
    if (!ownerSnap.exists) return
    const owner = ownerSnap.data()
    if (owner.notificationPrefs?.onInterest === false || !owner.email) return

    for (const uid of newInterested) {
      const interestedSnap = await db.doc(`profiles/${uid}`).get()
      const interestedData = interestedSnap.exists ? interestedSnap.data() : {}
      const interestedName = interestedData.name || 'Alguien'
      const interestedUsername = interestedData.username || ''
      const interestedEmail = interestedData.email || ''
      await sendEmail({
        to: owner.email,
        subject: `${interestedName} está interesado en "${after.title}"`,
        ...renderEmail({
          preheader: `${interestedName} marcó "Me interesa" en ${after.title}`,
          heading: 'Nuevo interés en tu emprendimiento',
          bodyHtml: `
            <p style="margin:0 0 4px;"><b>${escapeHtml(interestedName)}</b> marcó "Me interesa" en tu emprendimiento <b>${escapeHtml(after.title)}</b>.</p>
            ${interestedUsername ? `<p style="margin:0 0 4px; color:#5E6672;"><b>Usuario:</b> @${escapeHtml(interestedUsername)}</p>` : ''}
            ${interestedEmail ? `<p style="margin:0; color:#5E6672;"><b>Correo:</b> ${escapeHtml(interestedEmail)}</p>` : ''}
          `,
          cta: { href: `${APP_URL}/app/mi-iniciativa`, label: 'Ver quién más →' },
        }),
      })
    }
  }
)

// Alguien sin permiso de admin sugiere un recurso desde el panel de
// Recursos — queda guardado como "pending" (ver firestore.rules) y aquí se
// le avisa al equipo por correo para que entre a aprobarlo o borrarlo.
exports.onResourceSuggested = onDocumentCreated(
  { document: 'resources/{id}', secrets: [RESEND_API_KEY] },
  async (event) => {
    const resource = event.data.data()
    if (resource.status !== 'pending') return

    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `Nuevo recurso sugerido: "${resource.title}"`,
      ...renderEmail({
        preheader: `${resource.submittedByName || 'Alguien'} sugirió un recurso nuevo en Nexo`,
        heading: 'Recurso pendiente de aprobación',
        bodyHtml: `
          <p style="margin:0 0 4px;"><b>Sugerido por:</b> ${escapeHtml(resource.submittedByName || 'Alguien')}${resource.submittedByEmail ? ` (${escapeHtml(resource.submittedByEmail)})` : ''}</p>
          <p style="margin:0 0 4px;"><b>Nombre:</b> ${escapeHtml(resource.title)}</p>
          <p style="margin:0 0 4px;"><b>Categoría:</b> ${escapeHtml(resource.category || '—')}</p>
          <p style="margin:0 0 4px;"><b>Zona:</b> ${escapeHtml(resource.scope && resource.scope !== 'estatal' ? resource.scope : [resource.state, resource.regionId].filter(Boolean).join(' · ') || resource.region || '—')}</p>
          <p style="margin:0 0 16px;"><b>Liga:</b> ${escapeHtml(resource.link || '—')}</p>
          <blockquote style="margin:0; padding-left:12px; border-left:3px solid rgba(16,27,38,.14); color:#5E6672;">${escapeHtml(resource.desc)}</blockquote>
        `,
        cta: { href: `${APP_URL}/app/recursos`, label: 'Revisar en Nexo →' },
        footerNote: 'Este correo es interno — se manda solo al equipo de Nexo cuando alguien sugiere un recurso nuevo.',
      }),
    })
  }
)

// Retroalimentación mandada desde el chatbot (landing o dashboard) — nadie
// la puede leer desde el cliente (ver firestore.rules), así que hasta ahora
// solo se veía entrando a la consola de Firebase. Esto la manda por correo
// al equipo en cuanto se guarda.
exports.onFeedbackCreate = onDocumentCreated(
  { document: 'feedback/{id}', secrets: [RESEND_API_KEY] },
  async (event) => {
    const feedback = event.data.data()
    const from = feedback.email ? escapeHtml(feedback.email) : 'Alguien sin cuenta iniciada'
    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `Nueva retroalimentación en Nexo (${feedback.page || 'página desconocida'})`,
      ...renderEmail({
        preheader: `Retroalimentación de ${from}`,
        heading: 'Nueva retroalimentación',
        bodyHtml: `
          <p style="margin:0 0 4px;"><b>De:</b> ${from}</p>
          <p style="margin:0 0 16px;"><b>Página:</b> ${escapeHtml(feedback.page || '—')}</p>
          <blockquote style="margin:0; padding-left:12px; border-left:3px solid rgba(16,27,38,.14); color:#5E6672;">${escapeHtml(feedback.message)}</blockquote>
        `,
        footerNote: 'Este correo es interno — se manda solo al equipo de Nexo cuando alguien usa "Enviar retroalimentación" en el chatbot.',
      }),
    })
  }
)

// Correos de verificación y restablecimiento de contraseña con control
// total sobre el HTML (en vez de la plantilla genérica que Firebase manda
// por su cuenta) — se genera el link de acción con el Admin SDK y se manda
// con la misma plantilla de marca que el resto de los correos de Nexo.
//
// Va como trigger de Firestore (igual que todos los demás correos de este
// archivo) y no como función onCall: un onCall de 2a generación corre
// sobre Cloud Run y necesita que "allUsers" tenga el rol Cloud Run
// Invoker para que el cliente pueda siquiera alcanzarla — este proyecto
// tiene la política de organización "Uso compartido restringido del
// dominio" (constraints/iam.allowedPolicyMemberDomains), que bloquea
// agregar "allUsers" a cualquier política de IAM sin excepción. Un
// trigger de Firestore no necesita invocación pública: Eventarc lo
// dispara internamente, así que esta restricción no aplica.
// generateEmailVerificationLink/generatePasswordResetLink del Admin SDK
// siempre arman un link al handler genérico que hostea Firebase
// (.firebaseapp.com/__/auth/action?...&continueUrl=...) — handleCodeInApp
// no aplica aquí como sí lo hace con el correo que manda el SDK de
// cliente; continueUrl solo es el botón "Continuar" DESPUÉS de esa
// página genérica, no un reemplazo. Nuestras páginas en
// src/pages/auth-action/ solo necesitan oobCode (ya tienen su propio
// apiKey vía la config de Firebase del cliente), así que se arma el link
// directo a nexohub.mx a mano, en vez del que genera el Admin SDK.
function toCustomActionLink(firebaseGeneratedLink, path) {
  const oobCode = new URL(firebaseGeneratedLink).searchParams.get('oobCode')
  return `${AUTH_ACTION_URL}${path}?mode=${path.includes('verificar') ? 'verifyEmail' : 'resetPassword'}&oobCode=${oobCode}`
}

exports.onAuthEmailRequested = onDocumentCreated(
  { document: 'authEmailRequests/{id}', secrets: [RESEND_API_KEY] },
  async (event) => {
    const req = event.data.data()

    if (req.type === 'verify') {
      const userRecord = await admin.auth().getUser(req.uid)
      if (!userRecord.email || userRecord.emailVerified) return
      const generated = await admin.auth().generateEmailVerificationLink(userRecord.email, {
        url: `${AUTH_ACTION_URL}/auth/verificar-correo`,
      })
      const link = toCustomActionLink(generated, '/auth/verificar-correo')
      await sendEmail({
        to: userRecord.email,
        subject: 'Confirma tu correo en Nexo',
        ...renderEmail({
          preheader: 'Confirma tu correo para asegurar tu cuenta de Nexo.',
          heading: 'Confirma tu correo',
          bodyHtml: '<p style="margin:0;">Un último paso para asegurar tu cuenta — confirma que esta dirección es tuya.</p>',
          cta: { href: link, label: 'Confirmar correo →' },
        }),
      })
      return
    }

    if (req.type === 'reset') {
      // No revelamos si la cuenta existe o no — mismo comportamiento que
      // tenía sendPasswordResetEmail del SDK de cliente, solo que ahora
      // el correo lo mandamos nosotros con nuestra propia plantilla.
      try {
        const generated = await admin.auth().generatePasswordResetLink(req.email, {
          url: `${AUTH_ACTION_URL}/auth/restablecer-contrasena`,
        })
        const link = toCustomActionLink(generated, '/auth/restablecer-contrasena')
        await sendEmail({
          to: req.email,
          subject: 'Restablece tu contraseña de Nexo',
          ...renderEmail({
            preheader: 'Restablece tu contraseña de Nexo.',
            heading: 'Restablece tu contraseña',
            bodyHtml: '<p style="margin:0;">Pediste restablecer tu contraseña. Si no fuiste tú, ignora este correo — tu cuenta sigue segura.</p>',
            cta: { href: link, label: 'Elegir nueva contraseña →' },
          }),
        })
      } catch (err) {
        if (err.code !== 'auth/user-not-found') logger.error('Error generando link de restablecimiento', err)
      }
    }
  }
)
