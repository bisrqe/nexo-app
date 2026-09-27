import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

// Suscripción en vivo a los mensajes de una conversación directa
// (conversations/{convId}/messages), ordenados por fecha de envío.
export function useConversationMessages(convId) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!convId) {
      setMessages([])
      return
    }
    const q = query(collection(db, 'conversations', convId, 'messages'), orderBy('createdAt'))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
    })
    return unsub
  }, [convId])

  return messages
}
