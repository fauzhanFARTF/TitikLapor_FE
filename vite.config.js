import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy dev supaya browser melihat FE & API pada origin yang sama —
      // tidak perlu preflight CORS dan cookie tetap first-party.
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      '/media': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Leaflet dipisah agar halaman non-peta tidak ikut mengunduhnya.
        manualChunks: {
          leaflet: ['leaflet', 'leaflet.heat', 'leaflet.markercluster'],
          vendor: ['vue', 'vue-router', 'pinia', 'axios'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
