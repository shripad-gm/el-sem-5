import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: process.env.VITE_API_URL || 'https://civic-monitor.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/users': {
        target: process.env.VITE_API_URL || 'https://civic-monitor.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/issues': {
        target: process.env.VITE_API_URL || 'https://civic-monitor.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/geo': {
        target: process.env.VITE_API_URL || 'https://civic-monitor.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      // ❌ REMOVE /admin proxy
    },
  },
})
