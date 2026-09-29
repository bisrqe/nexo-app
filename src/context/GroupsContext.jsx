import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  collection, doc, onSnapshot, updateDoc, deleteDoc, writeBatch,
  getDocs, query, where, arrayUnion, arrayRemove, increment, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from './AuthContext.jsx'
import { useProfile } from './ProfileContext.jsx'

// Mesas de trabajo reales — reemplaza el catálogo mock (src/data/groups.js).
// Cualquier cuenta con sesión puede crear una; "unirse" sigue viviendo en
// profiles/{uid}.joinedGroups (ProfileContext.toggleJoinedGroup), no aquí.
const GroupsContext = createContext(null)

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '') || 'mesa'
}

export function GroupsProvider({ children }) {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [groups, setGroups] = useState([])

  useEffect(() => {
    if (!user) {
      setGroups([])
      return
    }
    const unsub = onSnapshot(collection(db, 'groups'), (snap) => {
      setGroups(snap.docs.map((d) => ({ ...d.data(), docId: d.id })))
    })
    return unsub
  }, [user])

  // Crea la mesa y en el mismo batch se auto-une el dueño a su propia
  // mesa (si no, no podría escribir en su propio chat de grupo). adminUids
  // arranca con solo el dueño — desde ahí se pueden agregar colaboradores
  // con los mismos permisos de administración (editar, borrar, agregar/
  // quitar a otros), igual que memberUids en emprendimientos/iniciativas.
  const createGroup = async (data) => {
    if (!user) return null
    const ref = doc(collection(db, 'groups'))
    const batch = writeBatch(db)
    batch.set(ref, {
      ...data,
      slug: `${slugify(data.name)}-${ref.id.slice(0, 6)}`,
      ownerUid: user.uid,
      adminUids: [user.uid],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: '',
      lastSenderUid: '',
      messageCount: 0,
    })
    batch.update(doc(db, 'profiles', user.uid), { joinedGroups: arrayUnion(ref.id) })
    await batch.commit()
    return ref.id
  }

  const updateGroup = async (groupId, patch) => {
    if (!user) return
    await updateDoc(doc(db, 'groups', groupId), { ...patch, updatedAt: serverTimestamp() })
  }

  // Solo quien ya es admin de la mesa puede borrarla (ver firestore.rules).
  const deleteGroup = async (groupId) => {
    if (!user || !groupId) return
    await deleteDoc(doc(db, 'groups', groupId))
  }

  // Agregar a otra cuenta como admin de la mesa (mismos permisos que el
  // dueño: editar, borrar, agregar/quitar gente) — cualquier admin actual
  // puede hacerlo, no solo el dueño. También la une a la mesa (joinedGroups)
  // para que pueda ver y escribir en su chat.
  const addGroupAdmin = async (group, username) => {
    if (!user || !group?.docId) return { error: 'No se pudo identificar la mesa de trabajo.' }
    if (!(group.adminUids || [group.ownerUid]).includes(user.uid)) {
      return { error: 'Solo quien administra esta mesa puede agregar colaboradores.' }
    }
    const clean = (username || '').trim().replace(/^@/, '')
    if (!clean) return { error: 'Escribe un nombre de usuario.' }
    const snap = await getDocs(query(collection(db, 'profiles'), where('username', '==', clean)))
    if (snap.empty) return { error: 'No encontramos ninguna cuenta con ese usuario.' }
    const uid = snap.docs[0].id
    if ((group.adminUids || []).includes(uid)) return { error: 'Esa cuenta ya administra esta mesa.' }
    const batch = writeBatch(db)
    batch.update(doc(db, 'groups', group.docId), { adminUids: arrayUnion(uid) })
    batch.update(doc(db, 'profiles', uid), { joinedGroups: arrayUnion(group.docId) })
    await batch.commit()
    return { ok: true }
  }

  const removeGroupAdmin = async (group, uid) => {
    if (!user || !group?.docId || uid === group.ownerUid) return
    if (!(group.adminUids || [group.ownerUid]).includes(user.uid)) return
    await updateDoc(doc(db, 'groups', group.docId), { adminUids: arrayRemove(uid) })
  }

  // file, si viene, es { url, name, type } (ver src/lib/uploads.js).
  const sendGroupMessage = async (groupId, text, file) => {
    const trimmed = text.trim()
    if (!user || !groupId || (!trimmed && !file)) return
    const batch = writeBatch(db)
    const msgRef = doc(collection(db, 'groups', groupId, 'messages'))
    const payload = { senderUid: user.uid, senderName: profile.name || 'Alguien', createdAt: serverTimestamp() }
    if (trimmed) payload.text = trimmed
    if (file) {
      payload.fileUrl = file.url
      payload.fileName = file.name
      payload.fileType = file.type
    }
    batch.set(msgRef, payload)
    batch.update(doc(db, 'groups', groupId), {
      lastMessage: trimmed || `📎 ${file?.name || 'Archivo'}`,
      lastSenderUid: user.uid,
      updatedAt: serverTimestamp(),
      messageCount: increment(1),
    })
    await batch.commit()
  }

  const value = { groups, createGroup, updateGroup, deleteGroup, addGroupAdmin, removeGroupAdmin, sendGroupMessage }

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>
}

export function useGroups() {
  const ctx = useContext(GroupsContext)
  if (!ctx) throw new Error('useGroups debe usarse dentro de <GroupsProvider>')
  return ctx
}
