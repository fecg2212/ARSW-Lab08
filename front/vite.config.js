// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendBase = env.VITE_BACKEND_BASE || 'http://localhost:3001'
  const stompBase = env.VITE_STOMP_BASE || backendBase

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendBase,
          changeOrigin: true,
        },
        '/socket.io': {
          target: backendBase,
          changeOrigin: true,
          ws: true,
        },
        '/ws-blueprints': {
          target: stompBase,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
