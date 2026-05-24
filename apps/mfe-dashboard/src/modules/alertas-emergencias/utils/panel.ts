import { ESTADO_ORDER } from '../constants';
import type { Incidente, IndicadoresHu19 } from '../types';

// Calcula indicadores desde la lista local para mantener UI consistente tras cambios optimistas.
export const buildIndicadoresFromIncidentes = (incidentes: Incidente[]): IndicadoresHu19 => {
  const panicoActivas = incidentes.filter(
    (incidente) => incidente.tipo === 'PANICO' && incidente.estado === 'ACTIVA',
  ).length;
  const auxilioPendientes = incidentes.filter(
    (incidente) =>
      incidente.tipo === 'AUXILIO_MECANICO' &&
      (incidente.estado === 'ACTIVA' || incidente.estado === 'EN_PROCESO'),
  ).length;
  const totalResueltas = incidentes.filter((incidente) => incidente.estado === 'RESUELTA').length;

  return {
    panicoActivas,
    auxilioPendientes,
    totalResueltas,
    tienePanicoActivo: panicoActivas > 0,
  };
};

// Ordena activos primero, luego en proceso y finalmente resueltos por fecha descendente.
export const sortIncidentes = (incidentes: Incidente[]): Incidente[] =>
  [...incidentes].sort((a, b) => {
    const estadoDiff = ESTADO_ORDER[a.estado] - ESTADO_ORDER[b.estado];
    if (estadoDiff !== 0) return estadoDiff;
    return new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime();
  });

// Reemplaza un incidente actualizado sin perder el resto de la lista.
export const replaceIncidente = (incidentes: Incidente[], updated: Incidente): Incidente[] =>
  sortIncidentes(incidentes.map((incidente) => (incidente.id === updated.id ? updated : incidente)));
