/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell_app',
      // Aquí le decimos dónde está el microfrontend del dashboard
      remotes: {
        dashboardApp: 'http://localhost:3001/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'recharts'] // Compartimos React, ReactDOM y Recharts para evitar cargar varias versiones en la app final
    })
  ],
  server: {
    port: 3000,
    proxy: {
    '/api': {
      target: 'https://wbda73ufn9.execute-api.us-east-2.amazonaws.com/dev',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  }
})