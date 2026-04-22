import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/uploads': 'http://localhost:5000',
      '/api': 'http://localhost:5000'
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://recruitment-agency-management-system-production.up.railway.app/api')
  }
})
