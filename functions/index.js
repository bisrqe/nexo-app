// Correos personalizados de Nexo. Corre con permisos de administrador
// (bypassa las reglas de Firestore) — por eso vive aquí y no en el
// cliente. Cada trigger revisa las preferencias de notificación del
// destinatario antes de mandar nada.
const { setGlobalOptions } = require('firebase-functions/v2')
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore')
const { defineSecret } = require('firebase-functions/params')
const logger = require('firebase-functions/logger')
const admin = require('firebase-admin')

admin.initializeApp()
const db = admin.firestore()

setGlobalOptions({ region: 'us-central1', maxInstances: 10 })

const RESEND_API_KEY = defineSecret('RESEND_API_KEY')
const APP_URL = 'https://nexo-app-mauve.vercel.app'
const FROM = 'Nexo <onboarding@resend.dev>'
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
      ? `<blockquote>${escapeHtml(msg.text)}</blockquote>`
      : `<p>Te mandó un archivo${msg.fileName ? `: <b>${escapeHtml(msg.fileName)}</b>` : ''}.</p>`

    await sendEmail({
      to: profile.email,
      subject: `${senderName} te escribió en Nexo`,
      html: `<p><b>${escapeHtml(senderName)}</b> te mandó un mensaje directo en Nexo:</p>${body}<p><a href="${APP_URL}/app/mensajes">Responder →</a></p>`,
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
        html: `<p><b>${escapeHtml(joinerName)}</b> se unió a tu mesa de trabajo <b>${escapeHtml(group.name)}</b> en Nexo.</p><p><a href="${APP_URL}/app/comunidad/${group.slug}">Ver mesa →</a></p>`,
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
        html: `<p><b>${escapeHtml(interestedName)}</b> marcó "Me interesa" en tu emprendimiento <b>${escapeHtml(after.title)}</b>.</p><p><a href="${APP_URL}/app/mi-iniciativa">Ver quién más →</a></p>`,
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
      html: `<p><b>De:</b> ${from}</p><p><b>Página:</b> ${escapeHtml(feedback.page || '—')}</p><blockquote>${escapeHtml(feedback.message)}</blockquote>`,
    })
  }
)
