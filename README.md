# 🚚 NANU TECH - Frontend Workspace (Monorepo)

Bienvenido al repositorio oficial del ecosistema **Frontend de NANU TECH**.
Este proyecto implementa una arquitectura empresarial basada en **Monorepo con npm Workspaces**, permitiendo gestionar aplicaciones web (Microfrontends) y una aplicación móvil de forma eficiente y escalable.

---

## 🧩 Tecnologías principales

* ⚛️ React 19 + Vite (Microfrontends)
* 📱 React Native + Expo
* 🎨 Tailwind CSS + Shadcn (UI Web)
* 🔐 AWS Cognito (Autenticación)
* 🌐 Axios / Fetch (API Client)
* 🧪 Vitest (Testing)
* 🛡️ Husky + ESLint (Calidad de código)

---

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos dominios principales:

### 📦 Apps (`apps/`)

Aplicaciones finales que consumen los usuarios:

* Dashboard Web
* App del Chofer

### 🔁 Packages (`packages/`)

Código reutilizable compartido:

* Componentes
* Tipos
* Utilidades
* Cliente API

---

## 📁 Estructura del Proyecto

```bash
.
├── apps/
│   ├── shell-app/
│   ├── mfe-flota/
│   ├── mfe-contratos/
│   ├── mfe-dashboard/
│   └── mobile-chofer/
│
├── packages/
│   ├── ui-components/
│   ├── types/
│   ├── utils/
│   └── api-client/
```

---

## 🌐 Ecosistema Web (Microfrontends - React 19 + Vite)

### 🧠 `apps/shell-app/`

**Orquestador principal**

* Maneja autenticación (AWS Cognito)
* Controla estado global
* Renderiza navegación
* ⚠️ No contiene lógica de negocio

---

### 🚛 `apps/mfe-flota/`

**Operaciones (Core del sistema)**

* Asignación de turnos (`NuevaJornada.tsx`)
* CRUD de camiones
* Registro de choferes
* Telemetría y mapas GPS

---

### 📄 `apps/mfe-contratos/`

**Módulo Comercial**

* CRUD de contratos
* Configuración de tarifas
* Gestión de vigencias

---

### 📊 `apps/mfe-dashboard/`

**Módulo Analítico**

* Visualización de datos
* Reportes de:

  * Horas trabajadas
  * Rentabilidad
  * Kilometraje
* ⚠️ Solo lectura

---

## 📱 Ecosistema Móvil (React Native - Expo)

### 🚗 `apps/mobile-chofer/`

**Aplicación del conductor**

* Inicio y fin de jornada
* Registro de timestamps
* Envío de observaciones

---

## 📦 Paquetes Compartidos

### 🎨 `packages/ui-components/`

* Sistema de diseño (**solo Web**)
* Tailwind CSS + Shadcn
* ❌ No usar en móvil

---

### 🧾 `packages/types/`

* Interfaces TypeScript compartidas
* Ejemplo:

  * `Jornada`
  * `Camion`

---

### 🧮 `packages/utils/`

* Funciones puras
* Lógica reutilizable

---

### 🌐 `packages/api-client/`

* Configuración de consumo de APIs
* Integración con AWS API Gateway

---

## ⚠️ Reglas de Oro del Equipo

### 1. 🔒 Aislamiento de dependencias

* ❌ No instalar librerías globalmente si son para un solo módulo.
* ✅ Instalar desde la raíz indicando el workspace (paquete) destino:

```bash
npm install axios -w apps/mfe-flota
```

---

### 2. 🚫 No mezclar Web con Móvil

* Web → HTML (`div`, `span`)
* Mobile → Componentes nativos (`View`, `Text`)
* ✅ Compartir solo:

  * `types`
  * `utils`

---

### 3. 🛡️ Control de calidad (DevSecOps)

Este repositorio usa:

* Husky
* ESLint
* Vitest

❌ No podrás hacer `git push` si:

* Hay errores de lint
* Fallan pruebas

---

## 💻 Comandos Principales

### 📥 Instalación inicial

```bash
npm install
```

---

### ▶️ Levantar el ecosistema Web

```bash
npm run start:ecosystem
```

---

### 📱 Levantar la App Móvil (Expo)

```bash
cd apps/mobile-chofer
npm start
```

* Presiona `w` → navegador
* Escanea QR → Expo Go

---

### 🧪 Ejecutar pruebas

```bash
npm run test:all
```

⚠️ Obligatorio antes de `git push`.

---

## 🔐 Procedimiento de Autenticación y Recuperación de Contraseña

### Endpoints utilizados

- **Login:** `POST /auth/login`
- **Obtener usuario actual:** `GET /auth/me`
- **Recuperar contraseña:** `POST /auth/forgot-password`
- **Confirmar recuperación:** `POST /auth/forgot-password/confirm`

### Flujo sugerido

1. **Login**
   - El usuario ingresa email y contraseña.
   - Se llama a `login(payload)`.
   - Si es exitoso, se almacena el token y se obtiene el usuario con `getMe()`.

2. **Recuperar contraseña**
   - El usuario solicita recuperación con su email.
   - Se llama a `forgotPassword(payload)`.
   - Recibe un código por email.
   - Ingresa el código y la nueva contraseña.
   - Se llama a `forgotPasswordConfirm(payload)`.
   - Si es exitoso, puede iniciar sesión normalmente.

### Ejemplo de uso en el cliente

```ts
import { login, forgotPassword, forgotPasswordConfirm, getMe } from '@nanutech/api-client/src/services/auth.service';

// Login
await login({ email: 'user@mail.com', password: '1234' });

// Recuperar contraseña
await forgotPassword({ email: 'user@mail.com' });

// Confirmar recuperación
await forgotPasswordConfirm({ email: 'user@mail.com', code: '123456', newPassword: 'nuevaClave' });

// Obtener usuario actual
await getMe();
```

---

## 🤝 Buenas prácticas

* Mantén módulos desacoplados
* Reutiliza código desde `packages`
* Respeta la arquitectura
* Prueba tu código antes de subirlo
* Usa commits claros

---

## 📝 Reglas Estrictas para Commits (Conventional Commits)

Este proyecto está protegido por **Commitlint**. No se permiten mensajes genéricos como *"subiendo cambios"*.

Formato obligatorio:

```
tipo: descripción breve y en minúsculas
```

---

### ✅ Tipos permitidos

* 🌟 **feat:** nueva funcionalidad
  `git commit -m "feat: agrega formulario de nueva jornada"`

* 🐛 **fix:** corrección de errores
  `git commit -m "fix: corrige calculo de horas en dashboard"`

* 🛠️ **chore:** mantenimiento o configuración
  `git commit -m "chore: actualiza dependencias de expo"`

* 📚 **docs:** documentación
  `git commit -m "docs: actualiza reglas de commit"`

* 💅 **ui:** cambios visuales
  `git commit -m "ui: mejora estilos del boton principal"`

---

### ❌ Incorrecto

```
git commit -m "arreglando el login"
```

### ✅ Correcto

```
git commit -m "fix: repara validacion de contraseñas en login"
```

