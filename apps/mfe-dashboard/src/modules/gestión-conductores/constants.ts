import type { DisponibilidadFiltro, EstadoFiltro, EstadoOperacional } from './types';

export const ESTADO_TABS: Array<{ key: EstadoFiltro; label: string }> = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'ACTIVOS', label: 'Activos' },
  { key: 'INACTIVOS', label: 'Inactivos' },
];

export const DISPONIBILIDAD_TABS: Array<{ key: DisponibilidadFiltro; label: string }> = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'DISPONIBLE', label: 'Disponibles' },
  { key: 'EN_RUTA', label: 'En Ruta' },
  { key: 'DESCANSANDO', label: 'Descansando' },
];

export const ESTADO_OPERACIONAL_LABEL: Record<EstadoOperacional, string> = {
  DISPONIBLE: 'Disponible',
  EN_RUTA: 'En Ruta',
  DESCANSANDO: 'Descansando',
  DE_PERMISO: 'De Permiso',
  SIN_ASIGNAR: 'Sin asignar',
};

export const ESTADO_OPERACIONAL_COLOR: Record<EstadoOperacional, string> = {
  DISPONIBLE: '#22c55e',
  EN_RUTA: '#3b82f6',
  DESCANSANDO: '#f97316',
  DE_PERMISO: '#94a3b8',
  SIN_ASIGNAR: '#64748b',
};
