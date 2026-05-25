import type { EstadoIncidente, TipoIncidente } from './types';

// Etiquetas legibles por usuario para los estados del backend.
export const ESTADO_LABEL: Record<EstadoIncidente, string> = {
  ACTIVA: 'Activo',
  EN_PROCESO: 'En Proceso',
  RESUELTA: 'Resuelto',
};

// Etiquetas legibles por usuario para los tipos de incidente.
export const TIPO_LABEL: Record<TipoIncidente, string> = {
  PANICO: 'Alerta de Panico SOS',
  AUXILIO_MECANICO: 'Auxilio Mecanico',
  OBSERVACION: 'Observacion',
};

// Orden local para mantener incidentes urgentes arriba al renderizar la respuesta del backend.
export const ESTADO_ORDER: Record<EstadoIncidente, number> = {
  ACTIVA: 0,
  EN_PROCESO: 1,
  RESUELTA: 2,
};

// Clases Tailwind para el badge de estado.
export const ESTADO_BADGE_CLASS: Record<EstadoIncidente, string> = {
  ACTIVA: 'bg-red-100 text-red-700',
  EN_PROCESO: 'bg-blue-100 text-blue-700',
  RESUELTA: 'bg-green-100 text-green-700',
};
