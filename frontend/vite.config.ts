import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        // Preserve the browser-facing host for the session cookie and WebSocket origin.
        changeOrigin: false,
      },
      '/ws': { target: 'ws://localhost:8080', ws: true },
    },
  },
})
