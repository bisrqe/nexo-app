import React, { createContext, useContext, useEffect, useState } from 'react'
import { collection, doc, onSnapshot, query, where, addDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from './AuthContext.jsx'

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
  const [groups, setGroups] = useState(readGroups)
  const [myEvents, setMyEvents] = useState([])
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
      setMyEvents([])
      setMyInitiativeState(null)
      return
    }
    const eventsQuery = query(collection(db, 'events'), where('ownerUid', '==', user.uid))
    const unsubEvents = onSnapshot(eventsQuery, (snap) => {
      setMyEvents(snap.docs.map((d) => ({ ...d.data(), id: d.id })))
    })

    const initiativesQuery = query(collection(db, 'initiatives'), where('ownerUid', '==', user.uid))
    const unsubInitiatives = onSnapshot(initiativesQuery, (snap) => {
      setMyInitiativeState(snap.empty ? null : { ...snap.docs[0].data(), docId: snap.docs[0].id })
    })

    return () => {
      unsubEvents()
      unsubInitiatives()
    }
  }, [user])

  const addEvent = async (event) => {
    if (!user) return
    await addDoc(collection(db, 'events'), { ...event, ownerUid: user.uid, createdAt: serverTimestamp() })
  }

  const addGroup = (group) => setGroups((g) => [...g, group])

  const setMyInitiative = async (initiative) => {
    if (!user) return
    const ref = myInitiative ? doc(db, 'initiatives', myInitiative.docId) : doc(collection(db, 'initiatives'))
    await setDoc(ref, { ...initiative, ownerUid: user.uid, updatedAt: serverTimestamp() }, { merge: true })
  }

  const value = {
    myEvents,
    addEvent,
    myGroups: groups,
    addGroup,
    myInitiative,
    setMyInitiative,
  }

  return <UserContentContext.Provider value={value}>{children}</UserContentContext.Provider>
}

export function useUserContent() {
  const ctx = useContext(UserContentContext)
  if (!ctx) throw new Error('useUserContent debe usarse dentro de <UserContentProvider>')
  return ctx
}
