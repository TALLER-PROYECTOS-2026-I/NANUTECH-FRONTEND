# 📘 Guía Git del Equipo

> Flujo de trabajo estándar para desarrollo y documentación de código.

---

## 📋 Tabla de Contenidos

- [Flujo de desarrollo (feature branches)](#-flujo-de-desarrollo-feature-branches)
- [Cómo documentar código ya mergeado a develop](#-cómo-documentar-código-ya-mergeado-a-develop)
- [Reglas de oro](#-reglas-de-oro)

---

## 🚀 Flujo de desarrollo (feature branches)

Cada persona trabaja en su propia rama por funcionalidad (HU). Seguir estos pasos **en orden** evita el 90% de los conflictos.

### Paso 1 — Partir siempre desde `develop` actualizado

```bash
git checkout develop
git pull origin develop
```

> ⚠️ Nunca crear una rama desde código desactualizado.

---

### Paso 2 — Crear tu rama con nombre descriptivo

```bash
git checkout -b feature/nombre-de-la-hu
```

**Ejemplos:**

```bash
git checkout -b feature/login
git checkout -b feature/dashboard
git checkout -b feature/cambio-de-password
```

---

### Paso 3 — Trabajar en tu código

Desarrolla tu funcionalidad normalmente. Haz commits frecuentes y descriptivos:

```bash
git add .
git commit -m "feat: agrega validación de formulario en login"
```

---

### Paso 4 — Actualizar tu rama con lo último de `develop` (hacer esto cada día)

Antes de seguir trabajando o de abrir un PR, traer los cambios nuevos de `develop`:

```bash
git fetch origin
git rebase origin/develop
```

> 💡 Si hay conflictos, resolverlos, luego:
> ```bash
> git add .
> git rebase --continue
> ```

---

### Paso 5 — Subir tu rama y abrir el PR

```bash
git push origin feature/nombre-de-la-hu
```

Luego abrir el **Pull Request** hacia `develop` desde la interfaz de GitHub.

---

## 📝 Cómo documentar código ya mergeado a `devevelop`

Cuando el código ya fue mergeado a `develop` y las ramas originales están desactualizadas o eliminadas, **no tocar las ramas viejas**. Partir desde `develop` directamente.

### Paso 1 — Cada quien crea su propia rama de documentación desde `devevelop`

```bash
git checkout develop
git pull origin develop
git checkout -b docs/comentarios-nombre-funcionalidad
```

**Ejemplos:**

```bash
git checkout -b docs/comentarios-login        # persona de login
git checkout -b docs/comentarios-dashboard    # persona de dashboard
git checkout -b docs/comentarios-password     # persona de password
```

---

### Paso 2 — Comentar solo los archivos de tu funcionalidad

Cada persona comenta **únicamente sus archivos**. No tocar archivos de otros para evitar conflictos.

```bash
# Ejemplo de comentario en una función
git add src/login/authService.js
git commit -m "docs: agrega comentarios a funciones de autenticación"
```

---

### Paso 3 — Subir la rama y abrir el PR hacia `develop`

```bash
git push origin docs/comentarios-nombre-funcionalidad
```

Luego abrir el **Pull Request** hacia `develop`.

---

### Flujo visual

```
dev (con todo el código mergeado)
 ├── docs/comentarios-login       → PR → develop ✅
 ├── docs/comentarios-dashboard   → PR → develop ✅
 └── docs/comentarios-password    → PR → develop ✅
```

> ✅ Con ramas separadas por persona, cada quien es independiente. Si uno se tarda, los demás no se bloquean.

---

## 🏆 Reglas de oro

| Regla | Por qué importa |
|---|---|
| Siempre partir desde `develop` actualizado | Evita trabajar sobre código viejo |
| `fetch` + `rebase` diario | Reduce conflictos al mínimo |
| PRs pequeños y frecuentes | Más fácil de revisar y mergear |
| Cada quien toca solo sus archivos | Evita pisar el trabajo de otros |
| Comentar el código antes del PR | Evita tener que crear ramas de docs después |

---

> 📌 **Tip final:** Establecer como regla del equipo que todo PR debe incluir comentarios en las funciones nuevas antes de mergear a `dev`. Esto evita el problema de raíz.


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

