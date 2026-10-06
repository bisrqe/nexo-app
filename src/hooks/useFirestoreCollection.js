import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase.js'

// Suscripción en vivo a una colección de Firestore — usado para mezclar el
// contenido real (iniciativas, perfiles) en las páginas que muestran "todo
// el mapa". `filter` es opcional: [campo, operador, valor] — por ejemplo
// ['profileType', '==', 'mentor'] — para traer solo lo que la página
// necesita en vez de la colección entera (el dashboard solo ocupa mentores,
// no los miles de perfiles).
//
// Devuelve [docs, loading, error]: antes de la primera respuesta de
// Firestore, docs ya es [] pero loading sigue en true, para que las páginas
// puedan distinguir "todavía cargando" de "de verdad no hay nada". Si la
// lectura falla (permisos, red), loading pasa a false y error trae el
// problema — antes se quedaba cargando para siempre sin avisar.
export function useFirestoreCollection(name, filter) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const filterKey = filter ? filter.join('|') : ''

  useEffect(() => {
    setLoading(true)
    setError(null)
    const ref = filter ? query(collection(db, name), where(...filter)) : collection(db, name)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setDocs(snap.docs.map((d) => ({ ...d.data(), docId: d.id })))
        setLoading(false)
      },
      (err) => {
        console.error(`No se pudo leer "${name}"`, err)
        setError(err)
        setLoading(false)
      }
    )
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, filterKey])

  return [docs, loading, error]
}
