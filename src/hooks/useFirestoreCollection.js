import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

// Suscripción en vivo a una colección completa de Firestore — usado para
// mezclar el contenido real (iniciativas, perfiles) con los datos mock
// que ya traía el sitio, en las páginas que muestran "todo el mapa".
//
// Devuelve [docs, loading]: antes de la primera respuesta de Firestore,
// docs ya es [] pero loading sigue en true, para que las páginas puedan
// distinguir "todavía cargando" de "de verdad no hay nada" en vez de
// mostrar el copy de vacío en cada carga, aunque sea por un instante.
export function useFirestoreCollection(name) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsub = onSnapshot(collection(db, name), (snap) => {
      setDocs(snap.docs.map((d) => ({ ...d.data(), docId: d.id })))
      setLoading(false)
    })
    return unsub
  }, [name])

  return [docs, loading]
}
