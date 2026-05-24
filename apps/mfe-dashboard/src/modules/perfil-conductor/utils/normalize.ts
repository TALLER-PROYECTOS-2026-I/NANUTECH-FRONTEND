import type { EstadisticasConductorApi } from '@nanutech/api-client';
import type { EstadisticasConductor } from '../types';

// Convierte el contrato snake_case del backend al modelo camelCase usado por HU20.
export function normalizeEstadisticas(raw: EstadisticasConductorApi): EstadisticasConductor {
  return {
    // Total acumulado de jornadas del conductor.
    totalJornadas: raw.total_jornadas,
    // Jornadas finalizadas correctamente.
    jornadasCompletadas: raw.jornadas_completadas,
    // Jornadas actualmente registradas como activas.
    jornadasActivas: raw.jornadas_activas,
    // Horas totales trabajadas ya calculadas por backend.
    horasTotalesTrabajadas: raw.horas_totales_trabajadas,
    // Promedio de horas por jornada completada.
    promedioHorasPorJornada: raw.promedio_horas_por_jornada,
    // Estado operativo actual del conductor.
    estadoActual: raw.estado_actual,
  };
}
