import { useEffect, useState } from 'react';
import { getEstadisticasConductor, getJornadas } from '@nanutech/api-client';
import type { EstadisticasConductor, JornadaHistorial } from '../types';
import { normalizeEstadisticas } from '../utils/normalize';

export function usePerfilConductor(conductorId: string) {
  const [estadisticas, setEstadisticas] = useState<EstadisticasConductor | null>(null);
  const [jornadas, setJornadas] = useState<JornadaHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conductorId) return;

    let mounted = true;

    const cargar = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRaw, todasJornadas] = await Promise.all([
          getEstadisticasConductor(conductorId),
          getJornadas(),
        ]);

        if (!mounted) return;

        setEstadisticas(normalizeEstadisticas(statsRaw));

        const jornadasConductor = todasJornadas
          .filter((j) => j.conductor === conductorId)
          .map((j): JornadaHistorial => ({
            id: j.id,
            estado: normalizarEstadoJornada(j.estado),
            fecha: j.fecha ?? j.fecha_jornada ?? '',
            camion: j.camion ?? '',
            contrato: j.contrato ?? '',
            duracion: calcularDuracion(j.horario),
            observaciones: j.observaciones ?? undefined,
          }));

        setJornadas(jornadasConductor);
      } catch {
        if (mounted) setError('No se pudieron cargar los datos del conductor.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    cargar();

    return () => {
      mounted = false;
    };
  }, [conductorId]);

  return { estadisticas, jornadas, loading, error };
}

function normalizarEstadoJornada(estado: string): string {
  const upper = (estado ?? '').toUpperCase();
  if (upper.includes('COMPLET') || upper === 'FINALIZADO') return 'Completada';
  if (upper.includes('PROGRESO') || upper === 'EN_PROGRESO' || upper === 'ACTIVA') return 'Activa';
  return estado;
}

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
