import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Firebase es lo más pesado y casi nunca cambia — en su propio
        // archivo el navegador lo guarda en caché entre despliegues en vez
        // de volver a bajarlo cada vez que cambia el código de la app.
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        },
      },
    },
  },
})
