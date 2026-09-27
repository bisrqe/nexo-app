import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

// Suscripción en vivo a los mensajes de una mesa de trabajo
// (groups/{groupId}/messages) — mismo patrón que useConversationMessages.js.
export function useGroupMessages(groupId) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!groupId) {
      setMessages([])
      return
    }
    const q = query(collection(db, 'groups', groupId, 'messages'), orderBy('createdAt'))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
    })
    return unsub
  }, [groupId])

  return messages
}
