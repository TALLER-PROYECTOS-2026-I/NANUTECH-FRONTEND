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
        const jornadasConductor = todasJornadas
          .map((j): JornadaHistorial => ({
            id: j.id,
            estado: normalizarEstadoJornada(j.estado),
            fecha: j.fecha ?? j.fecha_jornada ?? '',
            camion: j.camion ?? '',
            contrato: j.contrato ?? '',
            duracion: calcularDuracion(j.horario),
            duracionLabel: j.duracion_total,
            observaciones: j.observaciones ?? undefined,
          }));

        setJornadas(jornadasConductor);
      } catch {
        // Mensaje unico para no exponer detalles tecnicos en la pantalla.
        if (mounted) setError('No se pudieron cargar los datos del conductor.');
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
function normalizarEstadoJornada(estado: string): string {
  const upper = (estado ?? '').toUpperCase();
  if (upper.includes('COMPLET') || upper === 'FINALIZADO') return 'Completada';
  if (upper.includes('PROGRESO') || upper === 'EN_PROGRESO' || upper === 'ACTIVA') return 'Activa';
  return estado;
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
