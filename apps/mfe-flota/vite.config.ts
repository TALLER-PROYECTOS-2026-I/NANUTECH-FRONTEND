/// <reference types="vitest" />

import { defineConfig } from 'vitest/config' 
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'mfe_flota',
      filename: 'remoteEntry.js',
      exposes: {
        './Dashboard': './src/App.tsx',
      },
      shared: ['react', 'react-dom']
    })
  ],
  server: {
    port: 4173,
  },
  preview: {
    port: 4173,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  }
})