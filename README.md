🚚 NANU TECH - Frontend Workspace (Monorepo)
¡Bienvenidos al repositorio oficial del ecosistema Frontend de NANU TECH!
Este proyecto utiliza una arquitectura empresarial de Monorepo (npm workspaces) para gestionar tanto nuestras aplicaciones Web (basadas en Microfrontends con React 18 y Vite) como nuestra aplicación Móvil (React Native con Expo).

🏗️ Arquitectura del Proyecto
Para garantizar la escalabilidad y el trabajo en paralelo, el proyecto está dividido en dos grandes áreas:

Apps (apps/): Las aplicaciones finales que consumen los usuarios (El Dashboard Web y la App del Chofer).

Packages (packages/): Código, utilidades y componentes visuales compartidos que alimentan a las Apps.

📁 Estructura de Carpetas y Responsabilidades
Es vital respetar los límites de cada módulo. Antes de crear un archivo o pantalla nueva, revisa a qué dominio pertenece:

🌐 Ecosistema Web (Microfrontends - React 19 + Vite)
apps/shell-app/: El Orquestador. Gestiona el Login (AWS Cognito), el estado global de autenticación y el menú de navegación lateral. No contiene lógica de negocio.

apps/mfe-flota/: Operaciones (El Corazón). Aquí vive el Módulo 1 (Vista Admin) y Módulo 3. Todo lo relacionado a asignar turnos (NuevaJornada.tsx), CRUD de camiones, registro de choferes y telemetría/mapas GPS va aquí.

apps/mfe-contratos/: Comercial. Módulo 2. Exclusivo para el CRUD de contratos legales, configuración de tarifas (por hora/viaje) y vigencias.

apps/mfe-dashboard/: Analítica. Módulo 4. Solo lectura. Cruza los datos de flota y contratos para mostrar gráficos (horas trabajadas, rentabilidad, kilómetros).

📱 Ecosistema Móvil (React Native - Expo)
apps/mobile-chofer/: App del Conductor. Módulo 1 (Vista Móvil). Exclusiva para que el chofer marque su "Inicio/Fin de Turno" con timestamp y envíe observaciones.

📦 Paquetes Compartidos
packages/ui-components/: Sistema de diseño (SOLO WEB). Contiene Tailwind CSS y componentes Shadcn. Prohibido importarlo en la App Móvil.

packages/types/: Interfaces de TypeScript compartidas (interface Jornada, interface Camion).

packages/utils/: Lógica pura y funciones matemáticas.

packages/api-client/: Configuración de Axios/Fetch para conectarnos al API Gateway de AWS.

⚠️ Las 3 Reglas de Oro del Equipo
Aislamiento de Dependencias: NUNCA instales librerías en la raíz del proyecto.

Si necesitas una librería para la web, instálala dentro del microfrontend correspondiente.

Si necesitas una librería para la app del celular (ej. cámara o GPS), abre tu terminal exactamente dentro de apps/mobile-chofer e instálala ahí. Si la instalas globalmente, romperás la compilación de la web.

No mezclar Web con Móvil: La UI nunca se comparte. La web usa HTML (<div>, <span>) y el móvil usa componentes nativos (<View>, <Text>). Solo compartiremos lógica desde las carpetas types o utils.

El Guardián de Calidad (DevSecOps): Este repositorio usa Husky y Vitest. No podrás hacer git push si tu código tiene errores de sintaxis (ESLint) o si rompes alguna prueba unitaria. Asegúrate de probar tu código localmente antes de subirlo.

💻 Comandos Principales para Desarrollo
1. Instalación Inicial (Primer paso para todos)
Al clonar el repositorio, debes instalar todas las dependencias desde la raíz para que el Monorepo enlace los workspaces:

Bash
npm install
2. Levantar el Ecosistema Web
Para encender el Shell App y todos los Microfrontends al mismo tiempo:

Bash
npm run dev
3. Levantar la App Móvil (Expo)
Para correr la app del chofer y probarla en tu celular o navegador web:

Bash
cd apps/mobile-chofer
npm start
# Presiona 'w' para verla en el navegador, o escanea el QR con la app Expo Go en tu celular.
4. Ejecutar Pruebas Automatizadas (Obligatorio antes de cada Push)
Verifica que no has roto el código de tus compañeros:

Bash
npm run test:all
Documento mantenido por Abraham Huamán Carlos (Líder Frontend). Para dudas sobre la arquitectura, consultar antes de programar.