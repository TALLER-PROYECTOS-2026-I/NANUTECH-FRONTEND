import type { EstadoContrato, EstadoOperacional } from '../types';

export const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const toStringValue = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

export const normalizeEstadoContrato = (value: unknown, activo?: unknown): EstadoContrato => {
  const estado = toStringValue(value).toUpperCase();

  if (estado.includes('INACTIVO') || activo === false) return 'INACTIVO';
  if (estado.includes('SUSPEND')) return 'SUSPENDIDO';
  return 'ACTIVO';
};

export const normalizeEstadoOperacional = (value: unknown): EstadoOperacional => {
  const estado = toStringValue(value).toUpperCase().replace(/\s+/g, '_');

  if (estado.includes('RUTA') || estado.includes('JORNADA')) return 'EN_RUTA';
  if (estado.includes('DESCANS')) return 'DESCANSANDO';
  if (estado.includes('PERMISO')) return 'DE_PERMISO';
  if (estado.includes('DISPON')) return 'DISPONIBLE';
  return 'SIN_ASIGNAR';
};

export const formatFechaLarga = (date: Date) =>
  date.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const formatHora = (date: Date) =>
  date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
