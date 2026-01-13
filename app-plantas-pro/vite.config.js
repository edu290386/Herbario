import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  server: { https: true }, // Activa el modo HTTPS
  plugins: [react(), mkcert()],
})
