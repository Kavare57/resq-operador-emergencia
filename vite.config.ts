import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Escuchar en todas las interfaces
    strictPort: true, // Si el puerto está ocupado, fallar en lugar de usar otro
    open: false,
    cors: true, // Habilitar CORS
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8000/api'),
  },
})
