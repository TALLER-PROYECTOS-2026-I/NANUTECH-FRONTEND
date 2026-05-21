import {
  ESTADO_OPERACIONAL_COLOR,
  ESTADO_OPERACIONAL_LABEL,
} from '../constants';
import type {
  ConductorDashboard,
  EstadoOperacional,
  PanelConductores,
  SegmentoGrafica,
} from '../types';

// Estados que se muestran en la grafica operacional del HU10.
const estadosOperacionales: EstadoOperacional[] = [
  'DISPONIBLE',
  'EN_RUTA',
  'DESCANSANDO',
  'DE_PERMISO',
];

// Construye un panel completo usando solo una lista de conductores.
export const buildPanelConductores = (
  conductores: readonly ConductorDashboard[],
): PanelConductores => {
  // Total de filas recibidas.
  const totalConductores = conductores.length;
  // Conductores activos segun estado contractual normalizado.
  const conductoresActivos = conductores.filter((conductor) => conductor.activo).length;
  // Conductores con jornada activa o camion asignado en ruta.
  const enRuta = conductores.filter((conductor) => conductor.estadoOperacional === 'EN_RUTA').length;
  // Regla HU10: disponible = contrato activo + sin jornada en ruta + estado DISPONIBLE.
  const disponibles = conductores.filter(
    (conductor) =>
      conductor.estadoContrato === 'ACTIVO' &&
      conductor.activo &&
      conductor.estadoOperacional === 'DISPONIBLE',
  ).length;

  // Segmentos para grafica de estado de contrato.
  const activos = conductores.filter((conductor) => conductor.estadoContrato === 'ACTIVO').length;
  const inactivos = conductores.filter((conductor) => conductor.estadoContrato === 'INACTIVO').length;
  const suspendidos = conductores.filter((conductor) => conductor.estadoContrato === 'SUSPENDIDO').length;

  // Pie chart de distribucion contractual.
  const contrato: SegmentoGrafica[] = [
    { key: 'ACTIVO', label: 'Activos', value: activos, color: '#10b981' },
    { key: 'INACTIVO', label: 'Inactivos', value: inactivos, color: '#ef4444' },
    { key: 'SUSPENDIDO', label: 'Suspendidos', value: suspendidos, color: '#f97316' },
  ];

  // Bar chart de estado operacional.
  const operacional: SegmentoGrafica[] = estadosOperacionales.map((estado) => ({
    key: estado,
    label: ESTADO_OPERACIONAL_LABEL[estado],
    value: conductores.filter((conductor) => conductor.estadoOperacional === estado).length,
    color: ESTADO_OPERACIONAL_COLOR[estado],
  }));

  // Devuelve el objeto unico que consume la pagina.
  return {
    resumen: {
      totalConductores,
      conductoresActivos,
      disponibles,
      enRuta,
    },
    graficas: {
      contrato,
      operacional,
    },
    conductores: [...conductores],
  };
};
