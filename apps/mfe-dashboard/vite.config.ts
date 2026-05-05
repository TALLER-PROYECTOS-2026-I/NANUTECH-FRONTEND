/// <reference types="vitest" />

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "dashboard_app",
      filename: "remoteEntry.js",
      // Aquí "exponemos" el componente App de este microfrontend
      exposes: {
        "./Dashboard": "./src/App.tsx",
      },
      shared: ["react", "react-dom", "recharts"], // Compartimos React, ReactDOM y Recharts para evitar cargar varias versiones en la app final
    }),
  ],
  server: {
    port: 3001, // Le asignamos un puerto fijo
  },
  preview: {
    // Configuración para el comando "vite preview"
    port: 3001,
  },
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
  //Agregamos esta nueva sección para Vitest
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    coverage: {                          // ← agrega esto
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      reportsDirectory: "./coverage",
      reportOnFailure: true,
      include: [
        "src/App.tsx",
        "src/modules/dashboard-admin/**/*.{ts,tsx}",
        "src/modules/monitoreo-camiones/*/.{ts,tsx}",
      ],
      exclude: ["src/main.tsx", "src/**/*.d.ts", "src/**/index.ts"],
    },
  },
});
