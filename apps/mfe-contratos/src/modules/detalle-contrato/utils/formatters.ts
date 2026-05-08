import type { TipoServicio } from '@nanutech/api-client';
import { TIPO_SERVICIO_OPTIONS } from '../constants';

// Convierte fechas ISO a un formato legible para el gerente.
export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

// Muestra fecha y hora en las filas del historial.
export const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));

// Normaliza el nombre del esquema de cobro.
export const formatTipoServicio = (tipo: TipoServicio) =>
  TIPO_SERVICIO_OPTIONS.find((option) => option.value === tipo)?.label || tipo;

// Tarifa en moneda, con dos decimales para que quede lista para facturacion.
export const formatMoney = (amount: number, currency: string) =>
  `${currency}. ${Number(amount || 0).toFixed(2)}`;

// Calcula la duracion total del contrato en dias.
export const getDurationDays = (start: string, end: string) => {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
};

// Calcula dias restantes contra la fecha actual.
export const getRemainingDays = (end: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.ceil((endDate.getTime() - today.getTime()) / 86400000);
};
