import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase.js'

// Trae los perfiles reales para una lista de uids (ej. interesados en un
// emprendimiento, o sus miembros ligados) — no vive en un hook por cada
// página, para no repetir el mismo Promise.all(getDoc) tres veces.
export function useProfilesByUids(uids) {
  const [people, setPeople] = useState([])

  useEffect(() => {
    let cancelled = false
    if (!uids || uids.length === 0) {
      setPeople([])
      return
    }
    Promise.all(uids.map((uid) => getDoc(doc(db, 'profiles', uid)))).then((snaps) => {
      if (cancelled) return
      setPeople(snaps.filter((s) => s.exists()).map((s) => ({ uid: s.id, ...s.data() })))
    })
    return () => { cancelled = true }
  }, [JSON.stringify(uids)])

  return people
}
