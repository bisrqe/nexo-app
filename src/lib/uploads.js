import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase.js'

const MAX_SIZE = 15 * 1024 * 1024 // 15 MB, igual que storage.rules

// Sube un archivo a una carpeta (conversations/{id}, groups/{id},
// initiatives/{id}) y regresa su URL pública de descarga.
export async function uploadFile(folder, file) {
  if (file.size > MAX_SIZE) {
    throw new Error('El archivo pesa más de 15 MB.')
  }
  const path = `${folder}/${Date.now()}-${file.name}`
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file)
  const url = await getDownloadURL(fileRef)
  return { url, name: file.name, type: file.type }
}
