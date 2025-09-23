import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
    },
  },
  server: {
    // Dev-time proxy to avoid CORS when backend runs on a different host/port
    proxy: {
      // Proxy any request starting with /api to the backend defined by VITE_API_URL
      // VITE_API_URL may include a path (e.g. http://localhost:8080 or http://localhost:8080/api)
      '^/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Rewrite will remove a duplicated /api prefix if VITE_API_URL already contains /api
        rewrite: (path) => {
          const target = (process.env.VITE_API_URL || '').replace(/\/+$/, '');
          if (target.endsWith('/api')) {
            // strip the leading /api from the proxied path to avoid /api/api
            return path.replace(/^\/api/, '');
          }
          return path;
        }
      }
    }
  }
})
