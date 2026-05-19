import { useMemo, useState } from 'react';
import type { FiltroJornada, JornadaHistorial } from '../types';

export function useFiltroJornadas(jornadas: JornadaHistorial[]) {
  const [filtro, setFiltro] = useState<FiltroJornada>('TODAS');
  const [busqueda, setBusqueda] = useState('');

  const totales = useMemo(() => ({
    todas: jornadas.length,
    completadas: jornadas.filter((j) => j.estado === 'Completada').length,
    activas: jornadas.filter((j) => j.estado === 'Activa').length,
  }), [jornadas]);

  const jornadasFiltradas = useMemo(() => {
    const texto = busqueda.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    return jornadas.filter((j) => {
      const coincideFiltro =
        filtro === 'TODAS' ||
        (filtro === 'COMPLETADAS' && j.estado === 'Completada') ||
        (filtro === 'ACTIVAS' && j.estado === 'Activa');

      const coincideBusqueda =
        !texto ||
        j.contrato.toLowerCase().includes(texto) ||
        j.camion.toLowerCase().includes(texto) ||
        (j.observaciones ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(texto);

      return coincideFiltro && coincideBusqueda;
    });
  }, [jornadas, filtro, busqueda]);

  return { filtro, setFiltro, busqueda, setBusqueda, jornadasFiltradas, totales };
}
