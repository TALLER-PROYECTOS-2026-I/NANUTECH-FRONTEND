/// <reference types="vitest" />

import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      federation({
        name: "shell_app",
        remotes: {
          dashboardApp:
            env.VITE_DASHBOARD_REMOTE_URL || "http://localhost:3001/assets/remoteEntry.js",
          flotaApp:
            env.VITE_FLOTA_REMOTE_URL || "http://localhost:4173/assets/remoteEntry.js",
          contratosApp:
            env.VITE_CONTRATOS_REMOTE_URL || "http://localhost:4174/assets/remoteEntry.js",
        },
        shared: ["react", "react-dom", "react-router-dom", "recharts"],
      }),
    ],
    server: {
      port: 3000,
    },
    build: {
      modulePreload: false,
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./vitest.setup.ts",
      coverage: {
        provider: "v8",
        reporter: ["text", "json-summary", "json", "lcov"],
        reportsDirectory: "./coverage",
        reportOnFailure: true,
        all: true,
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/main.tsx",
          "src/**/*.d.ts",
          "src/**/types/**",
          "src/**/index.ts",
          "src/**/*.test.{ts,tsx}",
          "src/**/*.spec.{ts,tsx}",
        ],
      },
    },
  };
});
