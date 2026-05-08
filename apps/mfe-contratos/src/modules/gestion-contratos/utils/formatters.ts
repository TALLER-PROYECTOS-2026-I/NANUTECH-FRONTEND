import type { Contrato } from '@nanutech/api-client';

// Convierte el enum tecnico del API en texto entendible para el usuario.
export const tipoServicioLabel = (value?: string) =>
  ({
    POR_VIAJE: 'Por Viaje',
    POR_HORA: 'Por Hora',
    POR_TONELADA: 'Por Tonelada',
    POR_KM: 'Por Kilometro',
    MENSUAL: 'Mensual',
  })[value || ''] || value || '-';

// Muestra el estado comercial en terminos operativos simples.
export const estadoLabel = (estado?: string, activo?: boolean) => {
  if (estado === 'VENCIDO') return 'Vencido';
  if (estado === 'SUSPENDIDO') return 'Suspendido';
  if (estado === 'INACTIVO' || activo === false) return 'Inactivo';
  return 'Activo';
};

// Clases Tailwind para diferenciar visualmente los estados, como pide la HU.
export const estadoBadgeClass = (estado?: string, activo?: boolean) => {
  if (estado === 'VENCIDO') return 'bg-red-500 text-white';
  if (estado === 'SUSPENDIDO') return 'bg-orange-500 text-white';
  if (estado === 'INACTIVO' || activo === false) return 'bg-slate-500 text-white';
  return 'bg-green-500 text-white';
};

// Formatea fechas ISO a formato corto usado en las tablas del dashboard.
export const formatDate = (value?: string) => {
  if (!value) return '-';
  const [date] = value.split('T');
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return value;
  return `${Number(day)}/${Number(month)}/${year}`;
};

// Calcula la tarifa visible: prioriza tarifa del API y si no existe usa distancia x tarifa por KM.
export const formatMoney = (contrato: Contrato) => {
  const moneda = contrato.moneda || 'PEN';
  const symbol = moneda === 'USD' ? 'USD.' : 'PEN.';
  const value =
    contrato.tarifa ??
    contrato.total_referencial ??
    Number(contrato.distancia_estimada_km || 0) * Number(contrato.tarifa_por_km || 0);

  return `${symbol} ${Number(value || 0).toFixed(value % 1 === 0 ? 0 : 2)}`;
};
