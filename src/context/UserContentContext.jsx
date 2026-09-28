import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  collection, doc, onSnapshot, query, where, addDoc, setDoc, updateDoc,
  getDocs, arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from './AuthContext.jsx'
import { useProfile } from './ProfileContext.jsx'

// Contenido creado por quien usa el dashboard. Las iniciativas y eventos
// propios viven en Firestore (colecciones "initiatives" y "events",
// filtradas por ownerUid) — ya son reales y las ve cualquiera. Las mesas
// de trabajo que cada quien arma en Comunidad siguen siendo locales por
// ahora (no se pidió que fueran compartidas todavía).
const GROUPS_KEY = 'nexo:userContent:groups:v1'

function readGroups() {
  try {
    const raw = localStorage.getItem(GROUPS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const UserContentContext = createContext(null)

export function UserContentProvider({ children }) {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [groups, setGroups] = useState(readGroups)
  const [myInitiative, setMyInitiativeState] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(groups))
    } catch {
      // localStorage puede fallar en modo privado — no es crítico.
    }
  }, [groups])

  useEffect(() => {
    if (!user) {
      setMyInitiativeState(null)
      return
    }
    const initiativesQuery = query(collection(db, 'initiatives'), where('memberUids', 'array-contains', user.uid))
    const unsubInitiatives = onSnapshot(initiativesQuery, (snap) => {
      setMyInitiativeState(snap.empty ? null : { ...snap.docs[0].data(), docId: snap.docs[0].id })
    })

    return unsubInitiatives
  }, [user])

  const addEvent = async (event) => {
    if (!user) return
    await addDoc(collection(db, 'events'), { ...event, ownerUid: user.uid, createdAt: serverTimestamp() })
  }

  const addGroup = (group) => setGroups((g) => [...g, group])

  // Cualquier miembro (no solo el dueño) puede editar el contenido del
  // emprendimiento — por eso solo se fija ownerUid/memberUids al crearlo;
  // en ediciones posteriores no se vuelven a mandar, para no pisarlos con
  // los del uid de quien esté editando en ese momento.
  const setMyInitiative = async (initiative) => {
    if (!user) return
    const ref = myInitiative ? doc(db, 'initiatives', myInitiative.docId) : doc(collection(db, 'initiatives'))
    const patch = { ...initiative, updatedAt: serverTimestamp() }
    if (!myInitiative) {
      patch.ownerUid = user.uid
      patch.memberUids = [user.uid]
      patch.ownerProfileType = profile.profileType
    }
    await setDoc(ref, patch, { merge: true })
  }

  // Ligar una cuenta distinta (ej. un cofundador) al mismo emprendimiento
  // — solo el dueño puede hacerlo, buscando por @usuario.
  const addInitiativeMember = async (username) => {
    if (!user || !myInitiative || myInitiative.ownerUid !== user.uid) {
      return { error: 'Solo el dueño del emprendimiento puede agregar personas.' }
    }
    const clean = (username || '').trim().replace(/^@/, '')
    if (!clean) return { error: 'Escribe un nombre de usuario.' }
    const snap = await getDocs(query(collection(db, 'profiles'), where('username', '==', clean)))
    if (snap.empty) return { error: 'No encontramos ninguna cuenta con ese usuario.' }
    const uid = snap.docs[0].id
    if ((myInitiative.memberUids || []).includes(uid)) return { error: 'Esa cuenta ya está ligada a este emprendimiento.' }
    await updateDoc(doc(db, 'initiatives', myInitiative.docId), { memberUids: arrayUnion(uid) })
    return { ok: true }
  }

  const removeInitiativeMember = async (uid) => {
    if (!user || !myInitiative || myInitiative.ownerUid !== user.uid || uid === myInitiative.ownerUid) return
    await updateDoc(doc(db, 'initiatives', myInitiative.docId), { memberUids: arrayRemove(uid) })
  }

  const value = {
    addEvent,
    myGroups: groups,
    addGroup,
    myInitiative,
    setMyInitiative,
    addInitiativeMember,
    removeInitiativeMember,
  }

  return <UserContentContext.Provider value={value}>{children}</UserContentContext.Provider>
}

export function useUserContent() {
  const ctx = useContext(UserContentContext)
  if (!ctx) throw new Error('useUserContent debe usarse dentro de <UserContentProvider>')
  return ctx
}
