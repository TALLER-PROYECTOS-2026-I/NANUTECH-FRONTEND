import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    // 1. Ignorar carpetas de compilación y dependencias
    ignores: ["**/dist/**", "**/node_modules/**", "**/build/**"],
  },
  // 2. Configuración base para JS y TS
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        // SOLUCIÓN AL ERROR DE TSCONFIG:
        // Busca el tsconfig.json más cercano a cada archivo
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      // 3. Reglas básicas para que el CI pase pero ayude
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // No necesario en React moderno
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  }
);