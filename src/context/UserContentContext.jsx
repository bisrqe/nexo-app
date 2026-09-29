import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  collection, doc, onSnapshot, query, where, addDoc, setDoc, updateDoc,
  getDocs, arrayUnion, arrayRemove, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from './AuthContext.jsx'
import { useProfile } from './ProfileContext.jsx'

// Contenido creado por quien usa el dashboard. Los emprendimientos/
// iniciativas y eventos propios viven en Firestore (colecciones
// "initiatives" y "events", filtradas por memberUids/ownerUid) — ya son
// reales y las ve cualquiera. Las mesas de trabajo que cada quien arma en
// Comunidad siguen siendo locales por ahora (no se pidió que fueran
// compartidas todavía).
//
// Una cuenta puede pertenecer a VARIOS emprendimientos/iniciativas a la
// vez (como dueño de más de uno, o como cofundador de otros) — myInitiatives
// es la lista completa, no un solo registro.
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
  const [myInitiatives, setMyInitiatives] = useState([])

  useEffect(() => {
    try {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(groups))
    } catch {
      // localStorage puede fallar en modo privado — no es crítico.
    }
  }, [groups])

  useEffect(() => {
    if (!user) {
      setMyInitiatives([])
      return
    }
    const initiativesQuery = query(collection(db, 'initiatives'), where('memberUids', 'array-contains', user.uid))
    const unsubInitiatives = onSnapshot(initiativesQuery, (snap) => {
      setMyInitiatives(snap.docs.map((d) => ({ ...d.data(), docId: d.id })))
    })
    return unsubInitiatives
  }, [user])

  const addEvent = async (event) => {
    if (!user) return
    await addDoc(collection(db, 'events'), { ...event, ownerUid: user.uid, createdAt: serverTimestamp() })
  }

  const addGroup = (group) => setGroups((g) => [...g, group])

  // Crea SIEMPRE un emprendimiento/iniciativa nuevo — a diferencia de
  // antes, ya no reemplaza ni edita uno existente, porque una cuenta puede
  // tener varios. ownerProfileType/Subtype quedan fijos al momento de
  // crear (ver isStudentEntrepreneur en initiativeKind.js — de ahí sale la
  // reclasificación para quien tenga subcategoría estudiante-emprendedor).
  const createInitiative = async (initiative) => {
    if (!user) return null
    const ref = doc(collection(db, 'initiatives'))
    await setDoc(ref, {
      ...initiative,
      ownerUid: user.uid,
      memberUids: [user.uid],
      ownerProfileType: profile.profileType,
      ownerProfileSubtype: profile.subtype || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return ref.id
  }

  // Actualiza uno ya existente del que la cuenta sea miembro (dueño o
  // cofundador). Nunca manda ownerUid/memberUids/ownerProfileType(Subtype)
  // — esos solo se fijan al crear, para que editar no los pise con los de
  // quien esté editando en ese momento si es un cofundador distinto al dueño.
  const updateInitiative = async (docId, initiative) => {
    if (!user || !docId) return
    await setDoc(doc(db, 'initiatives', docId), { ...initiative, updatedAt: serverTimestamp() }, { merge: true })
  }

  // Ligar una cuenta distinta (ej. un cofundador) al mismo emprendimiento
  // — solo el dueño puede hacerlo, buscando por @usuario. Recibe el
  // emprendimiento completo (no solo su id) porque quien llama ya lo tiene
  // cargado y así evita otra lectura para validar dueño/duplicados.
  const addInitiativeMember = async (initiative, username) => {
    if (!user || !initiative?.docId) return { error: 'No se pudo identificar el emprendimiento.' }
    if (initiative.ownerUid !== user.uid) return { error: 'Solo el dueño del emprendimiento puede agregar personas.' }
    const clean = (username || '').trim().replace(/^@/, '')
    if (!clean) return { error: 'Escribe un nombre de usuario.' }
    const snap = await getDocs(query(collection(db, 'profiles'), where('username', '==', clean)))
    if (snap.empty) return { error: 'No encontramos ninguna cuenta con ese usuario.' }
    const uid = snap.docs[0].id
    if ((initiative.memberUids || []).includes(uid)) return { error: 'Esa cuenta ya está ligada a este emprendimiento.' }
    await updateDoc(doc(db, 'initiatives', initiative.docId), { memberUids: arrayUnion(uid) })
    return { ok: true }
  }

  const removeInitiativeMember = async (initiative, uid) => {
    if (!user || !initiative?.docId || initiative.ownerUid !== user.uid || uid === initiative.ownerUid) return
    await updateDoc(doc(db, 'initiatives', initiative.docId), { memberUids: arrayRemove(uid) })
  }

  const value = {
    addEvent,
    myGroups: groups,
    addGroup,
    myInitiatives,
    createInitiative,
    updateInitiative,
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
