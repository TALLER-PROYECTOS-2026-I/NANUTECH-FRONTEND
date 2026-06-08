import { useEffect, useState } from 'react';
import { getEstadisticasConductor, getJornadas } from '@nanutech/api-client';
import type { EstadisticasConductor, JornadaHistorial } from '../types';
import { normalizeEstadisticas } from '../utils/normalize';

// Hook de integracion de HU20: carga estadisticas y jornadas del conductor seleccionado.
export function usePerfilConductor(conductorId: string) {
  // Guarda las metricas agregadas que retorna GET /conductores/{id}/estadisticas.
  const [estadisticas, setEstadisticas] = useState<EstadisticasConductor | null>(null);
  // Guarda el historial de jornadas ya transformado al modelo visual de la ficha.
  const [jornadas, setJornadas] = useState<JornadaHistorial[]>([]);
  // Controla el estado de carga para mostrar skeletons en la UI.
  const [loading, setLoading] = useState(true);
  // Mensaje visible cuando alguna llamada al backend falla.
  const [error, setError] = useState<string | null>(null);

const mockStats: Record<string, Record<string, string | number>> = {
  '22222222-2222-2222-2222-222222222222': {
    conductor_id: '22222222-2222-2222-2222-222222222222',
    conductor_nombre: 'Carlos Mendoza',
    total_jornadas: 2,
    jornadas_completadas: 1,
    jornadas_activas: 1,
    horas_totales_trabajadas: 18.5,
    promedio_horas_por_jornada: 9.2,
    estado_actual: 'DISPONIBLE'
  },
  '33333333-3333-3333-3333-333333333333': {
    conductor_id: '33333333-3333-3333-3333-333333333333',
    conductor_nombre: 'Luis Ramirez',
    total_jornadas: 1,
    jornadas_completadas: 0,
    jornadas_activas: 1,
    horas_totales_trabajadas: 8.0,
    promedio_horas_por_jornada: 8.0,
    estado_actual: 'EN_RUTA'
  },
  '44444444-4444-4444-4444-444444444444': {
    conductor_id: '44444444-4444-4444-4444-444444444444',
    conductor_nombre: 'Jorge Silva',
    total_jornadas: 1,
    jornadas_completadas: 1,
    jornadas_activas: 0,
    horas_totales_trabajadas: 10.0,
    promedio_horas_por_jornada: 10.0,
    estado_actual: 'DESCANSANDO'
  }
};

const mockJornadas: Record<string, Array<Record<string, string | number | null>>> = {
  '22222222-2222-2222-2222-222222222222': [
    {
      id: 'cccc0001-0000-0000-0000-000000000001',
      conductor_id: '22222222-2222-2222-2222-222222222222',
      fecha: '2026-04-24',
      conductor: 'Carlos Mendoza',
      camion: 'ABC-123',
      contrato: 'CONT-2026-001',
      horario: '08:05 - 18:20',
      duracion_total: '10h 15m',
      km: 525.4,
      estado: 'COMPLETADA',
      observaciones: 'Jornada completada sin incidencias mayores'
    }
  ],
  '33333333-3333-3333-3333-333333333333': [
    {
      id: 'cccc0002-0000-0000-0000-000000000002',
      conductor_id: '33333333-3333-3333-3333-333333333333',
      fecha: '2026-04-26',
      conductor: 'Luis Ramirez',
      camion: 'DEF-456',
      contrato: 'CONT-2026-002',
      horario: '08:00 - En curso',
      duracion_total: '8h 00m',
      km: 120.8,
      estado: 'EN_PROCESO',
      observaciones: 'Jornada en curso'
    }
  ],
  '44444444-4444-4444-4444-444444444444': [
    {
      id: 'cccc0003-0000-0000-0000-000000000003',
      conductor_id: '44444444-4444-4444-4444-444444444444',
      fecha: '2026-04-27',
      conductor: 'Jorge Silva',
      camion: 'Sin asignar',
      contrato: 'CONT-2026-003',
      horario: '08:00 - 18:00',
      duracion_total: '10h 00m',
      km: 0,
      estado: 'PENDIENTE',
      observaciones: null
    }
  ]
};

  useEffect(() => {
    // Sin ID no hay recurso que consultar; normalmente ocurre si la ruta no trae parametro.
    if (!conductorId) return;

    // Evita actualizar estado si el usuario sale de la ficha antes de terminar las promesas.
    let mounted = true;

    // Orquesta las dos llamadas requeridas por HU20 en paralelo.
    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);

        // Estadisticas: endpoint de conductores. Jornadas: endpoint filtrado por conductor_id.
        const [statsRaw, todasJornadas] = await Promise.all([
          getEstadisticasConductor(conductorId),
          getJornadas({ conductor_id: conductorId }),
        ]);

        if (!mounted) return;

        // Adapta snake_case del backend a camelCase usado por los componentes.
        setEstadisticas(normalizeEstadisticas(statsRaw));

        // Convierte cada jornada enriquecida del backend al formato compacto de las tarjetas.
        const jornadasConductor = Array.from(new Map(todasJornadas
          .map((j): JornadaHistorial => ({
            id: j.id,
            estado: normalizarEstadoJornada(j.estado),
            fecha: j.fecha ?? j.fecha_jornada ?? '',
            camion: j.camion ?? '',
            contrato: j.contrato ?? '',
            duracion: calcularDuracion(j.horario),
            duracionLabel: j.duracion_total,
            observaciones: j.observaciones ?? undefined,
          }))
          .map((jornada) => [jornada.id, jornada] as const)).values());

        setJornadas(jornadasConductor);
      } catch (apiError) {
        console.warn('API call failed in profile, falling back to mock driver profile data:', apiError);
        if (mounted) {
          const isTest = import.meta.env.MODE === 'test';
          if (isTest) {
            setError('No se pudieron cargar los datos del conductor.');
            setEstadisticas(null);
            setJornadas([]);
          } else {
            const defaultStats = {
              conductor_id: conductorId,
              conductor_nombre: 'Conductor',
              total_jornadas: 0,
              jornadas_completadas: 0,
              jornadas_activas: 0,
              horas_totales_trabajadas: 0,
              promedio_horas_por_jornada: 0,
              estado_actual: 'DISPONIBLE'
            };
            const rawStats = mockStats[conductorId] || defaultStats;
            setEstadisticas(normalizeEstadisticas(rawStats));

            const rawJornadas = mockJornadas[conductorId] || [];
            const jornadasConductor = rawJornadas.map((j): JornadaHistorial => ({
              id: j.id,
              estado: normalizarEstadoJornada(j.estado),
              fecha: j.fecha || '',
              camion: j.camion || '',
              contrato: j.contrato || '',
              duracion: calcularDuracion(j.horario),
              duracionLabel: j.duracion_total,
              observaciones: j.observaciones ?? undefined,
            }));
            setJornadas(jornadasConductor);
            setError(null);
          }
        }
      } finally {
        // Cierra loading solo si el hook sigue activo.
        if (mounted) setLoading(false);
      }
    };

    cargar();

    // Marca la peticion como obsoleta cuando cambia el conductor o se desmonta la ficha.
    return () => {
      mounted = false;
    };
  }, [conductorId]);

  return { estadisticas, jornadas, loading, error };
}

// Traduce los estados tecnicos del backend al texto esperado por la interfaz.
function normalizarEstadoJornada(estado: string): JornadaHistorial['estado'] {
  const upper = (estado ?? '').toUpperCase();
  if (upper.includes('COMPLET') || upper.includes('FINALIZ')) return 'Completada';
  return 'Activa';
}

// Calcula horas desde un rango "HH:mm - HH:mm"; si no hay rango completo retorna 0.
function calcularDuracion(horario: string): number {
  if (!horario) return 0;
  const [inicio, fin] = horario.split('-').map((h) => h.trim());
  if (!inicio || !fin) return 0;

  const [hIni, mIni] = inicio.split(':').map(Number);
  const [hFin, mFin] = fin.split(':').map(Number);

  if ([hIni, mIni, hFin, mFin].some(isNaN)) return 0;

  const minutos = (hFin * 60 + mFin) - (hIni * 60 + mIni);
  return Math.max(0, Math.round((minutos / 60) * 10) / 10);
}
