import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  collection, doc, getDoc, setDoc, writeBatch, increment,
  onSnapshot, query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from './AuthContext.jsx'
import { useProfile } from './ProfileContext.jsx'

// Chat directo real entre dos cuentas — a diferencia de las mesas de
// trabajo (MessagesContext, demo local), esto vive en Firestore bajo
// conversations/{uidA_uidB}/messages, así que ambas personas ven la
// misma conversación. El id de la conversación es siempre los dos uids
// ordenados y unidos con "_", para que nunca existan dos conversaciones
// distintas para el mismo par de personas.
const DirectMessagesContext = createContext(null)

function conversationId(uidA, uidB) {
  return [uidA, uidB].sort().join('_')
}

export function DirectMessagesProvider({ children }) {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    if (!user) {
      setConversations([])
      return
    }
    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ ...d.data(), docId: d.id }))
        .sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0))
      setConversations(list)
    })
    return unsub
  }, [user])

  // Devuelve el id de la conversación con esa persona, creándola si es la
  // primera vez que se hablan. Guarda los nombres ya resueltos (name no
  // se puede editar después de registrarse, así que nunca queda viejo).
  const getOrCreateConversation = async (otherUid) => {
    if (!user || !otherUid || otherUid === user.uid) return null
    const convId = conversationId(user.uid, otherUid)
    const ref = doc(db, 'conversations', convId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const otherSnap = await getDoc(doc(db, 'profiles', otherUid))
      const otherName = otherSnap.exists() ? otherSnap.data().name : 'Alguien'
      await setDoc(ref, {
        participants: [user.uid, otherUid].sort(),
        participantNames: { [user.uid]: profile.name || 'Tú', [otherUid]: otherName },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: '',
        lastSenderUid: '',
        messageCount: 0,
      })
    }
    return convId
  }

  const sendDirectMessage = async (convId, text) => {
    const trimmed = text.trim()
    if (!user || !convId || !trimmed) return
    const batch = writeBatch(db)
    const msgRef = doc(collection(db, 'conversations', convId, 'messages'))
    batch.set(msgRef, { senderUid: user.uid, text: trimmed, createdAt: serverTimestamp() })
    batch.update(doc(db, 'conversations', convId), {
      lastMessage: trimmed,
      lastSenderUid: user.uid,
      updatedAt: serverTimestamp(),
      messageCount: increment(1),
    })
    await batch.commit()
  }

  const value = { conversations, getOrCreateConversation, sendDirectMessage }

  return <DirectMessagesContext.Provider value={value}>{children}</DirectMessagesContext.Provider>
}

export function useDirectMessages() {
  const ctx = useContext(DirectMessagesContext)
  if (!ctx) throw new Error('useDirectMessages debe usarse dentro de <DirectMessagesProvider>')
  return ctx
}
