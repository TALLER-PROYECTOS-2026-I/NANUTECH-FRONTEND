import type { EstadisticasConductorApi } from '@nanutech/api-client';
import type { EstadisticasConductor } from '../types';

export function normalizeEstadisticas(raw: EstadisticasConductorApi): EstadisticasConductor {
  return {
    totalJornadas: raw.total_jornadas,
    jornadasCompletadas: raw.jornadas_completadas,
    jornadasActivas: raw.jornadas_activas,
    horasTotalesTrabajadas: raw.horas_totales_trabajadas,
    promedioHorasPorJornada: raw.promedio_horas_por_jornada,
    estadoActual: raw.estado_actual,
  };
}
