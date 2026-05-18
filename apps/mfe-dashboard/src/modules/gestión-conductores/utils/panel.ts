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

const estadosOperacionales: EstadoOperacional[] = [
  'DISPONIBLE',
  'EN_RUTA',
  'DESCANSANDO',
  'DE_PERMISO',
];

export const buildPanelConductores = (
  conductores: readonly ConductorDashboard[],
): PanelConductores => {
  const totalConductores = conductores.length;
  const conductoresActivos = conductores.filter((conductor) => conductor.activo).length;
  const enRuta = conductores.filter((conductor) => conductor.estadoOperacional === 'EN_RUTA').length;
  const disponibles = conductores.filter(
    (conductor) =>
      conductor.estadoContrato === 'ACTIVO' &&
      conductor.activo &&
      conductor.estadoOperacional === 'DISPONIBLE',
  ).length;

  const activos = conductores.filter((conductor) => conductor.estadoContrato === 'ACTIVO').length;
  const inactivos = conductores.filter((conductor) => conductor.estadoContrato === 'INACTIVO').length;
  const suspendidos = conductores.filter((conductor) => conductor.estadoContrato === 'SUSPENDIDO').length;

  const contrato: SegmentoGrafica[] = [
    { key: 'ACTIVO', label: 'Activos', value: activos, color: '#10b981' },
    { key: 'INACTIVO', label: 'Inactivos', value: inactivos, color: '#ef4444' },
    { key: 'SUSPENDIDO', label: 'Suspendidos', value: suspendidos, color: '#f97316' },
  ];

  const operacional: SegmentoGrafica[] = estadosOperacionales.map((estado) => ({
    key: estado,
    label: ESTADO_OPERACIONAL_LABEL[estado],
    value: conductores.filter((conductor) => conductor.estadoOperacional === estado).length,
    color: ESTADO_OPERACIONAL_COLOR[estado],
  }));

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
