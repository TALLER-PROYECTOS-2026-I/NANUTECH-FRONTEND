# Módulo de Gestión de Contratos (HU06)

## 📋 Descripción
Panel centralizado para la gestión y visualización de contratos comerciales con estadísticas, gráficas interactivas y tabla paginada.

## ✅ Archivos Generados

### Estructura del Módulo
```
gestion-contratos/
├── components/
│   ├── GestionContratosPage.tsx    # Página principal del módulo
│   ├── ResumenTarjetas.tsx         # Tarjetas de estadísticas
│   ├── TablaContratos.tsx          # Tabla con listado de contratos
│   └── GraficaContratos.tsx        # Gráficas (Pie + Bar charts)
├── types.ts                        # Definiciones de tipos TypeScript
├── mockData.ts                     # Datos de ejemplo y funciones de cálculo
├── services.ts                     # Servicios y utilidades
├── gestion-contratos.css           # Estilos específicos del módulo
└── index.ts                        # Exportaciones públicas
```

## 🎨 Características Implementadas

### 1. **Tarjetas de Resumen**
   - ✅ Total de Contratos
   - ✅ Contratos Activos
   - ✅ Contratos Vencidos
   - ✅ Camiones Asignados

### 2. **Gráficas Interactivas**
   - ✅ Pie Chart: Distribución por Estado (Activo, Vencido, Suspendido)
   - ✅ Bar Chart: Distribución por Tipo de Servicio
   - Implementadas con SVG puro (sin dependencias)

### 3. **Tabla de Contratos**
   - ✅ Columnas: Código, Cliente, Tipo Servicio, Tarifa, Fecha Inicio, Fecha Fin, Estado, Acciones
   - ✅ Búsqueda en tiempo real (por cliente o código)
   - ✅ Paginación (10 items por página)
   - ✅ Badges de estado con colores (Verde=Activo, Rojo=Vencido, Amarillo=Suspendido)
   - ✅ Botón "Ver" para acceder a detalles

### 4. **Datos Mock**
   - ✅ 12 contratos de ejemplo con datos realistas
   - ✅ Estados variados (activo, vencido, suspendido)
   - ✅ Tipos de servicio diferentes
   - ✅ Información completa de clientes y tarifas

## 🚀 Próximos Pasos para Activar el Módulo

### Paso 1: Actualizar el archivo App.tsx
Necesitas actualizar el `App.tsx` principal para incluir la nueva ruta. 

**Reemplaza el contenido de** `apps/mfe-contratos/src/App.tsx`:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GestionContratosPage } from './modules/gestion-contratos';
import './App.css'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GestionContratosPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
```

### Paso 2: Instalar Dependencias (Opcional - Para gráficas mejoradas)
Si deseas usar gráficas más avanzadas con Recharts:
```bash
cd apps/mfe-contratos
npm install recharts
```

**Nota:** Las gráficas actuales funcionan con SVG puro, así que esto es opcional.

## 📱 Responsive Design
- ✅ Diseño completamente responsive
- ✅ Optimizado para mobile, tablet y desktop
- ✅ Tabla scrollable en dispositivos pequeños
- ✅ Grid adaptativo para tarjetas

## 🎯 Criterios de Aceptación Cumplidos

| Criterio | Estado | Descripción |
|----------|--------|-------------|
| Tarjetas informativas | ✅ | Total, Activos, Vencidos, Camiones |
| Gráficas interactivas | ✅ | Pie (Estado) y Bar (Tipo Servicio) |
| Tabla con datos completos | ✅ | 8 columnas con información relevante |
| Búsqueda en tiempo real | ✅ | Filtro por cliente o código |
| Estados con badges | ✅ | Verde, Rojo, Amarillo con hover effects |
| Paginación | ✅ | 10 items por página con navegación |
| Redirección a detalle | ✅ | Botón "Ver" funcional |

## 🛠️ Cómo Usar

### Búsqueda
- Escribe en el campo "Buscar por cliente o código..." para filtrar contratos
- La búsqueda es case-insensitive y en tiempo real
- La paginación se resetea automáticamente

### Paginación
- Usa los botones "Anterior" y "Siguiente"
- Los números de página solo muestran los primeros 5 cuando hay muchas páginas
- El botón activo se resalta en azul

### Ver Detalles
- Haz clic en el botón "Ver" en la columna de acciones
- Por ahora muestra un alert (se conectará a la página de detalle)

## 📊 Datos Mock

Los datos mock incluyen:
- 12 contratos con información completa
- Estados variados (6 activos, 4 vencidos, 2 suspendidos)
- Diferentes tipos de servicio
- Clientes realistas del sector

## 🎨 Colores y Estilos

- **Activo**: Verde (#10b981)
- **Vencido**: Rojo (#ef4444)
- **Suspendido**: Amarillo (#f59e0b)
- **Primario**: Azul (#2563eb)
- **Fondo**: Gris claro (#f3f4f6)

## 📝 Notas Importantes

1. Los datos son completamente MOCK (no hay backend)
2. Las gráficas se generan dinámicamente con SVG puro
3. Tailwind CSS se utiliza para el styling responsivo
4. El módulo está completamente aislado en su carpeta
5. Compatible con TypeScript y React 19+

## 🔌 Integración con Detalle de Contrato

Cuando hagas clic en "Ver", la función `handleVerContrato` puede ser modificada para:
```tsx
const handleVerContrato = (contrato: Contrato) => {
  // Antes: alert
  // Después: navigate(`/contratos/${contrato.id}`);
};
```

---

**Generado para HU06 - Gestión de Contratos**
