import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

// Suscripción en vivo a una colección completa de Firestore — usado para
// mezclar el contenido real (iniciativas, perfiles) con los datos mock
// que ya traía el sitio, en las páginas que muestran "todo el mapa".
export function useFirestoreCollection(name) {
  const [docs, setDocs] = useState([])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, name), (snap) => {
      setDocs(snap.docs.map((d) => ({ ...d.data(), docId: d.id })))
    })
    return unsub
  }, [name])

  return docs
}
