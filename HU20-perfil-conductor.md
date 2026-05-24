# HU20 — Perfil Técnico del Conductor

## Descripción general

Implementar la página **Perfil del Conductor** dentro del MFE `mfe-dashboard`, accesible desde la tabla de conductores al hacer clic en el botón "Ver" de cada fila. La página muestra la información personal del conductor, el camión asignado actualmente, sus estadísticas de jornadas y el historial completo de jornadas con búsqueda y filtros.

---

## Ubicación en el proyecto

```
apps/mfe-dashboard/src/modules/perfil-conductor/   ← módulo a desarrollar (actualmente vacío)
packages/api-client/src/services/conductores/       ← agregar función de estadísticas
```

---

## Flujo de navegación

1. El admin está en `/conductores` (lista de conductores).
2. Hace clic en el ícono de ojo ("Ver") de un conductor en `ConductoresTable`.
3. Se navega a `/conductores/:id` con el objeto `ConductorDashboard` pasado por **navigation state** (`navigate('/conductores/:id', { state: { conductor } })`).
4. La página `PerfilConductorPage` lee el `id` desde `useParams()` y los datos del conductor desde `useLocation().state`.
5. El botón **"Volver al listado"** navega de regreso a `/conductores`.

> La ruta `conductores/:id` ya existe en `App.tsx` pero apunta a `GestionConductoresPage`. Debe cambiarse para apuntar a `PerfilConductorPage`.

---

## API

### 1. Estadísticas del conductor

```
GET /conductores/:id
```

**Response `200 OK`:**

```json
{
  "success": true,
  "message": "Estadísticas del conductor obtenidas correctamente",
  "data": {
    "conductor_id": "22222222-2222-2222-2222-222222222222",
    "conductor_nombre": "Carlos Mendoza",
    "total_jornadas": 2,
    "jornadas_completadas": 1,
    "jornadas_activas": 0,
    "horas_totales_trabajadas": 10.3,
    "promedio_horas_por_jornada": 10.3,
    "estado_actual": "INACTIVO"
  }
}
```

> Este endpoint devuelve únicamente las **estadísticas**. Los datos personales del conductor (DNI, teléfono, email, licencia, fecha de contrato, camión asignado) se obtienen del **navigation state** que viene de la lista de conductores.

### 2. Historial de jornadas del conductor

```
GET /jornadas?conductor_id=:id
```

> Usar el endpoint existente `getJornadas()` en `packages/api-client/src/services/registrojornada/jornadas.ts` filtrando por `conductor_id`, o agregar un nuevo parámetro de query si el backend lo soporta. Si no hay filtro en el backend, filtrar en el frontend con `.filter(j => j.conductor === id)`.

---

## Tipos a crear

**`apps/mfe-dashboard/src/modules/perfil-conductor/types.ts`**

```ts
export type EstadisticasConductorApi = {
  conductor_id: string;
  conductor_nombre: string;
  total_jornadas: number;
  jornadas_completadas: number;
  jornadas_activas: number;
  horas_totales_trabajadas: number;
  promedio_horas_por_jornada: number;
  estado_actual: string;
};

export type EstadisticasConductor = {
  totalJornadas: number;
  jornadasCompletadas: number;
  jornadasActivas: number;
  horasTotalesTrabajadas: number;
  promedioHorasPorJornada: number;
  estadoActual: string;
};

export type JornadaHistorial = {
  id: string;
  estado: 'Completada' | 'Activa' | string;
  fecha: string;
  camion: string;
  contrato: string;
  duracion: number; // horas
  observaciones?: string;
};

export type FiltroJornada = 'TODAS' | 'COMPLETADAS' | 'ACTIVAS';
```

---

## Servicio API a crear

**`packages/api-client/src/services/conductores/conductorPerfil.ts`**

```ts
import apiClient from '../../../index';
import type { EstadisticasConductorApi } from '../../../../../../apps/mfe-dashboard/src/modules/perfil-conductor/types';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getEstadisticasConductor = async (
  conductorId: string,
): Promise<EstadisticasConductorApi> => {
  const response = await apiClient.get<ApiResponse<EstadisticasConductorApi>>(
    `/conductores/${conductorId}`,
  );
  return response.data.data;
};
```

> Exportar también desde `packages/api-client/index.ts`.

---

## Estructura de archivos a crear

```
apps/mfe-dashboard/src/modules/perfil-conductor/
├── index.ts                          ← export PerfilConductorPage (actualmente vacío)
├── types.ts                          ← tipos del módulo
├── hooks/
│   ├── usePerfilConductor.ts         ← lógica principal (stats + jornadas)
│   └── useFiltroJornadas.ts          ← filtro + búsqueda del historial
├── pages/
│   └── PerfilConductorPage.tsx       ← página principal
├── components/
│   ├── ConductorHeader.tsx           ← nombre, licencia, badge de estado
│   ├── InfoCard.tsx                  ← tarjeta de DNI / Teléfono / Email / Contratado
│   ├── CamionAsignadoCard.tsx        ← camión actualmente asignado
│   ├── StatCard.tsx                  ← tarjeta de estadística (Total Jornadas, etc.)
│   ├── JornadaCard.tsx               ← ítem del historial de jornadas
│   └── HistorialJornadas.tsx         ← historial completo con búsqueda y filtros
└── utils/
    └── normalize.ts                  ← normalizar EstadisticasConductorApi → EstadisticasConductor
```

---

## Descripción de cada componente

### `PerfilConductorPage.tsx`
- Lee `id` de `useParams()`.
- Lee `conductor: ConductorDashboard` de `useLocation().state`.
- Si no hay `state` (acceso directo por URL), redirigir a `/conductores` o mostrar fallback.
- Llama a `usePerfilConductor(id)` para obtener estadísticas y jornadas.
- Renderiza todos los sub-componentes.

### `ConductorHeader.tsx`
```
┌─────────────────────────────────────────────────────────┐
│ [👤]  Juan Pérez                           [● En Ruta]  │
│       Licencia: A-III-a-12345678                        │
└─────────────────────────────────────────────────────────┘
```
- Badge de estado usa el `estadoOperacional` del conductor.
- Colores del badge: `EN_RUTA` → verde, `DISPONIBLE` → azul, `DESCANSANDO` → naranja, etc.

### `InfoCard.tsx`
- Props: `label`, `value`, `icon`, `colorClass`.
- 4 instancias en fila: **DNI** (azul), **Teléfono** (verde), **Email** (morado), **Contratado** (naranja).
- Datos vienen del `ConductorDashboard` del navigation state.
- La fecha de contrato debe formatearse como `14 ene. 2023`.

### `CamionAsignadoCard.tsx`
```
┌──────────────────────────────────────────────────────────────┐
│ 🚛 Camión Asignado Actualmente          [Ver Detalle →]      │
│    Unidad operativa del conductor                            │
│  Placa: ABC-123  │ Marca/Modelo: Volvo FH16 │ Año: 2022 │ Cap: 28.0 ton │
└──────────────────────────────────────────────────────────────┘
```
- Si `conductor.camionAsignado` es `null`, mostrar mensaje "Sin camión asignado".
- El botón "Ver Detalle" navega a `/camiones` (o a la ficha del camión si existe la ruta).
- Los datos del camión (marca/modelo, año, capacidad) requerirán un endpoint adicional o vienen del backend en la respuesta del dashboard (a validar con el equipo backend).

### `StatCard.tsx`
Props: `label`, `value`, `sublabel`, `icon`, `color`.
4 instancias:
| Label | Value | Sublabel |
|---|---|---|
| Total Jornadas | `total_jornadas` | `X completadas, Y activas` |
| Horas Totales | `horas_totales_trabajadas` | `Horas trabajadas` |
| Promedio/Jornada | `promedio_horas_por_jornada`h | `Horas por jornada` |
| Estado Actual | `estado_actual` | descripción textual del estado |

### `HistorialJornadas.tsx`
- Recibe la lista de jornadas del conductor.
- Contiene búsqueda por texto (contrato, placa, observaciones).
- Tabs de filtro: **Todas (N)**, **Completadas (N)**, **Activas (N)**.
- Lista de `JornadaCard` con los datos filtrados.
- Muestra `"Mostrando X de Y jornadas registradas"`.

### `JornadaCard.tsx`
```
┌─────────────────────────────────────────────────────┐
│ [Completada]  viernes, 20 de marzo de 2026          [→]│
│ 🚛 ABC-123   📋 CONT-2024-001   ⏱ 15.5 horas       │
│ Observaciones: Ruta Lima-Arequipa completada sin...  │
└─────────────────────────────────────────────────────┘
```
- Badge de estado: `Completada` → verde, `Activa`/`En Progreso` → azul.
- Fecha formateada: `viernes, 20 de marzo de 2026` (`new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })`).

---

## Hook `usePerfilConductor.ts`

```ts
export function usePerfilConductor(conductorId: string) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasConductor | null>(null);
  const [jornadas, setJornadas] = useState<JornadaHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // llamada paralela a getEstadisticasConductor + getJornadas filtradas
  }, [conductorId]);

  return { estadisticas, jornadas, loading, error };
}
```

---

## Cambios en `App.tsx`

```tsx
// Antes:
import GestionConductoresPage from "./modules/gestión-conductores";
<Route path="conductores/:id" element={<GestionConductoresPage />} />

// Después:
import PerfilConductorPage from "./modules/perfil-conductor";
<Route path="conductores/:id" element={<PerfilConductorPage />} />
```

Lo mismo para las rutas absolutas `/dashboard/admin/conductores/:id`.

---

## Cambio en `ConductoresTable.tsx`

El botón "Ver" debe navegar con el state del conductor:

```tsx
const navigate = useNavigate();

// En el onClick del botón:
navigate(`/dashboard/admin/conductores/${conductor.id}`, {
  state: { conductor },
});
```

---

## Checklist de implementación

- [ ] Crear `packages/api-client/src/services/conductores/conductorPerfil.ts`
- [ ] Exportar `getEstadisticasConductor` desde `packages/api-client/index.ts`
- [ ] Crear `apps/mfe-dashboard/src/modules/perfil-conductor/types.ts`
- [ ] Crear `apps/mfe-dashboard/src/modules/perfil-conductor/utils/normalize.ts`
- [ ] Crear hook `usePerfilConductor.ts`
- [ ] Crear hook `useFiltroJornadas.ts`
- [ ] Crear componente `ConductorHeader.tsx`
- [ ] Crear componente `InfoCard.tsx`
- [ ] Crear componente `CamionAsignadoCard.tsx`
- [ ] Crear componente `StatCard.tsx`
- [ ] Crear componente `JornadaCard.tsx`
- [ ] Crear componente `HistorialJornadas.tsx`
- [ ] Crear página `PerfilConductorPage.tsx`
- [ ] Completar `perfil-conductor/index.ts` con el export de la página
- [ ] Actualizar `App.tsx`: ruta `conductores/:id` → `PerfilConductorPage`
- [ ] Actualizar `ConductoresTable.tsx`: botón "Ver" navega con navigation state
- [ ] Validar con backend si `GET /conductores/:id` devuelve también datos personales (DNI, teléfono, email, fecha contrato, camión con detalles) o si se necesita un endpoint adicional

---

## Notas

- El módulo debe seguir el mismo patrón de estilos Tailwind CSS que el resto de `mfe-dashboard`.
- No agregar dependencias externas; usar los componentes de `@nanutech/ui-components` si aplica.
- Mientras el backend no provea los datos del camión (marca, modelo, año, capacidad) en la respuesta del conductor, usar datos del `camionAsignado` del state y completar con una llamada a `GET /camiones/:placa` si existe, o mostrar solo la placa.
