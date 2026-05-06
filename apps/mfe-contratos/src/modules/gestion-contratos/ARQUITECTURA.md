# 🏗️ Arquitectura del Módulo HU06

## Diagrama de Componentes

```
GestionContratosPage (Componente Principal)
│
├─── Encabezado
│    ├─ Título: "Gestión de Contratos"
│    └─ Botón: "+ Nuevo Contrato"
│
├─── ResumenTarjetas
│    ├─ Tarjeta: Total Contratos (14)
│    ├─ Tarjeta: Contratos Activos (8)
│    ├─ Tarjeta: Contratos Vencidos (4)
│    └─ Tarjeta: Camiones Asignados (8)
│
├─── GraficaContratos
│    ├─ Pie Chart (Distribución por Estado)
│    │  ├─ Activos: 8
│    │  ├─ Vencidos: 4
│    │  └─ Suspendidos: 2
│    │
│    └─ Bar Chart (Tipo de Servicio)
│       ├─ Por Viaje: 4
│       ├─ Por Hora: 5
│       ├─ Por Tonelada: 4
│       └─ Por Tonelada Km: 1
│
└─── TablaContratos
     ├─ Buscador (cliente/código)
     ├─ Tabla con columnas
     │  ├─ Código
     │  ├─ Cliente
     │  ├─ Tipo Servicio
     │  ├─ Tarifa
     │  ├─ Fecha Inicio
     │  ├─ Fecha Fin
     │  ├─ Estado (badge)
     │  └─ Acciones (Ver)
     │
     └─ Paginación
        ├─ Botón Anterior
        ├─ Números de página (1-5)
        └─ Botón Siguiente
```

## Flujo de Datos

```
┌──────────────────────────────────────────────────────────┐
│              GestionContratosPage (State)                │
│  - pagina: 1                                             │
│  - busqueda: ""                                          │
└──────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ResumenTarjetas    GraficaContratos    TablaContratos
   (mockContratos)    (mockContratos)     (pagina, busqueda)
        │                  │                  │
        │                  │                  ▼
        │                  │            obtenerContratos()
        │                  │            (servicios.ts)
        │                  │                  │
        ▼                  ▼                  ▼
calcularResumen()    calcularDatosGrafica()  PaginacionDatos
     ▼                    ▼                      │
ResumenDatos          [DatosGrafica]            ▼
{                                          TablaContratos
  totalContratos,                          (Renderización)
  contratosActivos,
  contratosVencidos,
  camionesAsignados
}
```

## Dependencias Entre Archivos

```
index.ts (Exporta todo)
  │
  ├─── types.ts (Define tipos)
  │    │
  │    ├─ Contrato
  │    ├─ EstadoContrato
  │    ├─ TipoServicio
  │    ├─ ResumenDatos
  │    └─ DatosGrafica
  │
  ├─── mockData.ts (Datos + cálculos)
  │    │
  │    ├─ mockContratos (array)
  │    ├─ calcularResumen()
  │    ├─ calcularDatosGraficaEstado()
  │    └─ calcularDatosGraficaTipoServicio()
  │
  ├─── services.ts (Lógica de negocio)
  │    │
  │    ├─ obtenerContratos(pagina, porPagina, busqueda)
  │    ├─ obtenerColorbadgeEstado()
  │    ├─ obtenerTextoEstado()
  │    └─ [Funciones utilitarias]
  │
  └─── components/
       │
       ├─ GestionContratosPage.tsx (Orquestador)
       │  ├─ Imports: ResumenTarjetas, GraficaContratos, TablaContratos
       │  ├─ Imports: mockData, services
       │  └─ Estado: pagina, busqueda
       │
       ├─ ResumenTarjetas.tsx
       │  ├─ Props: datos (ResumenDatos)
       │  └─ Renderiza: 4 tarjetas
       │
       ├─ GraficaContratos.tsx
       │  ├─ Props: datosEstado[], datosTipoServicio[]
       │  ├─ SVG PieChart (interno)
       │  ├─ SVG BarChart (interno)
       │  └─ Renderiza: 2 gráficas
       │
       └─ TablaContratos.tsx
          ├─ Props: datos, pagina, busqueda, callbacks
          ├─ Renderiza: Buscador + Tabla + Paginación
          └─ Callbacks: onBusquedaChange, onPaginaChange, onVer
```

## Flujo de Interacción del Usuario

### 1. Búsqueda
```
Usuario escribe en buscador
  │
  ▼
TablaContratos.handleBusquedaChange()
  │
  ▼
GestionContratosPage.setBusqueda()
  │
  ▼
useMemo recalcula obtenerContratos()
  │
  ▼
TablaContratos se renderiza con resultados filtrados
```

### 2. Cambio de Página
```
Usuario hace clic en número de página
  │
  ▼
TablaContratos.onPaginaChange()
  │
  ▼
GestionContratosPage.setPagina()
  │
  ▼
useMemo recalcula obtenerContratos()
  │
  ▼
TablaContratos se renderiza con nueva página
```

### 3. Ver Detalle
```
Usuario hace clic en botón "Ver"
  │
  ▼
TablaContratos.onVer(contrato)
  │
  ▼
GestionContratosPage.handleVerContrato()
  │
  ▼
[Actualmente: alert, Futuro: navigate()]
```

## Estructura de Carpetas (Resultado Final)

```
apps/mfe-contratos/
└── src/
    └── modules/
        └── gestion-contratos/
            ├── components/
            │   ├── GestionContratosPage.tsx
            │   ├── ResumenTarjetas.tsx
            │   ├── TablaContratos.tsx
            │   └── GraficaContratos.tsx
            ├── types.ts
            ├── mockData.ts
            ├── services.ts
            ├── gestion-contratos.css
            ├── index.ts
            ├── README.md
            ├── RESUMEN_GENERACION.md
            ├── PREVIEW.html
            └── ARQUITECTURA.md (este archivo)
```

## Estados y Props Principales

### GestionContratosPage (Estado Local)
```typescript
const [pagina, setPagina] = useState(1);
const [busqueda, setBusqueda] = useState('');
```

### ResumenTarjetas (Props)
```typescript
interface ResumenTarjetasProps {
  datos: ResumenDatos;
}
```

### GraficaContratos (Props)
```typescript
interface GraficaContratosProps {
  datosEstado: DatosGrafica[];
  datosTipoServicio: DatosGrafica[];
}
```

### TablaContratos (Props)
```typescript
interface TablaContratosProps {
  datos: PaginacionDatos;
  pagina: number;
  busqueda: string;
  onPaginaChange: (pagina: number) => void;
  onBusquedaChange: (busqueda: string) => void;
  onVer: (contrato: Contrato) => void;
}
```

## Optimizaciones Implementadas

### 1. useMemo
```typescript
const datosTabla = useMemo(() => {
  return obtenerContratos(pagina, 10, busqueda);
}, [pagina, busqueda]);

const datosResumen = useMemo(() => {
  return calcularResumen(mockContratos);
}, []);
```
- ✅ Evita recálculos innecesarios
- ✅ Solo se recalcula si cambian las dependencias

### 2. Funciones Puras
- ✅ `obtenerContratos()` no modifica estado global
- ✅ `calcularResumen()` es determinística
- ✅ Fácil de testear

### 3. Separación de Responsabilidades
- ✅ `GestionContratosPage`: Orquestación
- ✅ `components`: Renderización
- ✅ `services.ts`: Lógica
- ✅ `mockData.ts`: Datos y cálculos

## Posibles Extensiones Futuras

```
GestionContratosPage
├── + Filtros Avanzados
│  ├─ FilterByState
│  ├─ FilterByDateRange
│  └─ FilterByTipoServicio
│
├── + Acciones en Lote
│  ├─ SelectCheckbox
│  ├─ DeleteMultiple
│  └─ ExportSelected
│
├── + Detalles Modal
│  ├─ Modal Wrapper
│  └─ DetalleCOntratoModal
│
└── + Integración API
   ├─ Reemplazar mockData
   ├─ Loading states
   └─ Error handling
```

## Testing (Estructura preparada)

```typescript
// Fácil de testear
describe('gestion-contratos', () => {
  it('calcula resumen correctamente', () => {
    const resultado = calcularResumen(mockContratos);
    expect(resultado.totalContratos).toBe(14);
  });

  it('filtra contratos por búsqueda', () => {
    const resultado = obtenerContratos(1, 10, 'San Miguel');
    expect(resultado.items[0].cliente).toContain('San Miguel');
  });

  it('pagina correctamente', () => {
    const resultado = obtenerContratos(2, 10, '');
    expect(resultado.pagina).toBe(2);
  });
});
```

---

**Diagrama creado para HU06 - Gestión de Contratos**
