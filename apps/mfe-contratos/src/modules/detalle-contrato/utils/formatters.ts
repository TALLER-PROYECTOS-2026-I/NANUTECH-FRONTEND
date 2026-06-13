import type { TipoServicio } from '@nanutech/api-client';
import { TIPO_SERVICIO_OPTIONS } from '../constants';

const parseDate = (value?: string) => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const dateOnly = trimmed.split('T')[0];
  const isoLike = /^\d{4}-\d{2}-\d{2}$/.test(dateOnly);
  if (isoLike) {
    const date = new Date(`${dateOnly}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const slashMatch = dateOnly.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// Convierte fechas ISO a un formato legible para el gerente.
export const formatDate = (date: string) => {
  const parsed = parseDate(date);
  if (!parsed) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
};

// Muestra fecha y hora en las filas del historial.
export const formatDateTime = (date: string) => {
  const parsed = parseDate(date);
  if (!parsed) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(parsed);
};

// Normaliza el nombre del esquema de cobro.
export const formatTipoServicio = (tipo: TipoServicio) =>
  TIPO_SERVICIO_OPTIONS.find((option) => option.value === tipo)?.label || tipo;

// Tarifa en moneda, con dos decimales para que quede lista para facturacion.
export const formatMoney = (amount: number, currency: string) =>
  `${currency}. ${Number(amount || 0).toFixed(2)}`;

// Calcula la duracion total del contrato en dias.
export const getDurationDays = (start: string, end: string) => {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate) return 0;

  return Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
};

// Calcula dias restantes contra la fecha actual.
export const getRemainingDays = (end: string) => {
  const endDate = parseDate(end);
  if (!endDate) return Number.POSITIVE_INFINITY;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((endDate.getTime() - today.getTime()) / 86400000);
};
