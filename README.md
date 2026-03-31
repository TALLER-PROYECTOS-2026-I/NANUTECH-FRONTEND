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

* ❌ No instalar librerías en la raíz
* ✅ Instalar dentro del workspace correspondiente

Ejemplo:

```bash
cd apps/mfe-flota
npm install axios
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

Instala todas las dependencias y enlaza los workspaces.

---

### ▶️ Levantar el ecosistema Web

```bash
npm run dev
```

Ejecuta el Shell App junto con todos los Microfrontends.

---

### 📱 Levantar la App Móvil (Expo)

```bash
cd apps/mobile-chofer
npm start
```

* Presiona `w` → ver en navegador
* Escanea el QR → usar Expo Go en tu celular

---

### 🧪 Ejecutar pruebas automatizadas

```bash
npm run test:all
```

⚠️ Obligatorio antes de hacer `git push`.

---

## 🤝 Buenas prácticas

* Mantén módulos desacoplados
* Reutiliza código desde `packages`
* Respeta la arquitectura definida
* Prueba tu código antes de subirlo
* Usa commits claros y descriptivos

---

## 📌 Mantenimiento

Documento mantenido por **Abraham Huamán Carlos (Líder Frontend)**.
Para dudas sobre la arquitectura, consultar antes de implementar nuevas funcionalidades.

---

🚀 *Happy coding!*
