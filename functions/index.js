// Correos personalizados de Nexo. Corre con permisos de administrador
// (bypassa las reglas de Firestore) — por eso vive aquí y no en el
// cliente. Cada trigger revisa las preferencias de notificación del
// destinatario antes de mandar nada.
const { setGlobalOptions } = require('firebase-functions/v2')
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { defineSecret } = require('firebase-functions/params')
const logger = require('firebase-functions/logger')
const admin = require('firebase-admin')
const { renderEmail, APP_URL } = require('./emailTemplate')

admin.initializeApp()
const db = admin.firestore()

setGlobalOptions({ region: 'us-central1', maxInstances: 10 })

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

async function sendEmail({ to, subject, html }) {
  if (!to) return
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY.value()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
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
      html: renderEmail({
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
        html: renderEmail({
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
      const interestedName = interestedSnap.exists ? interestedSnap.data().name || 'Alguien' : 'Alguien'
      await sendEmail({
        to: owner.email,
        subject: `${interestedName} está interesado en "${after.title}"`,
        html: renderEmail({
          preheader: `${interestedName} marcó "Me interesa" en ${after.title}`,
          heading: 'Nuevo interés en tu emprendimiento',
          bodyHtml: `<p style="margin:0;"><b>${escapeHtml(interestedName)}</b> marcó "Me interesa" en tu emprendimiento <b>${escapeHtml(after.title)}</b>.</p>`,
          cta: { href: `${APP_URL}/app/mi-iniciativa`, label: 'Ver quién más →' },
        }),
      })
    }
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
      html: renderEmail({
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
