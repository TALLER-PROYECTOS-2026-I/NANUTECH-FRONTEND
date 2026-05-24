import { useMemo, useState } from 'react';
import type { FiltroJornada, JornadaHistorial } from '../types';

// Hook local de HU20 para filtrar el historial mostrado en la ficha del conductor.
export function useFiltroJornadas(jornadas: JornadaHistorial[]) {
  // Filtro por estado: todas, completadas o activas.
  const [filtro, setFiltro] = useState<FiltroJornada>('TODAS');
  // Texto libre usado sobre contrato, camion u observaciones.
  const [busqueda, setBusqueda] = useState('');

  // Calcula contadores para pintar las tabs sin recalcular en cada render.
  const totales = useMemo(() => ({
    todas: jornadas.length,
    completadas: jornadas.filter((j) => j.estado === 'Completada').length,
    activas: jornadas.filter((j) => j.estado === 'Activa').length,
  }), [jornadas]);

  // Aplica filtros en memoria sobre las jornadas ya devueltas por el backend.
  const jornadasFiltradas = useMemo(() => {
    // Normaliza acentos para que busquedas como "mecanico" encuentren "mecánico".
    const texto = busqueda.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    return jornadas.filter((j) => {
      // Decide si la jornada pertenece a la tab seleccionada.
      const coincideFiltro =
        filtro === 'TODAS' ||
        (filtro === 'COMPLETADAS' && j.estado === 'Completada') ||
        (filtro === 'ACTIVAS' && j.estado === 'Activa');

      // Busca en los campos visibles de la tarjeta.
      const coincideBusqueda =
        !texto ||
        j.contrato.toLowerCase().includes(texto) ||
        j.camion.toLowerCase().includes(texto) ||
        (j.observaciones ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(texto);

      // Una jornada se muestra solo si cumple estado y texto libre.
      return coincideFiltro && coincideBusqueda;
    });
  }, [jornadas, filtro, busqueda]);

  // Expone estado y resultados para que la pagina no conozca la logica de filtrado.
  return { filtro, setFiltro, busqueda, setBusqueda, jornadasFiltradas, totales };
}
