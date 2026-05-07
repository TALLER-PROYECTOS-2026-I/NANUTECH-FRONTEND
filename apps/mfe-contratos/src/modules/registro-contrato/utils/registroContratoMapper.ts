import type { TipoServicio } from '@nanutech/api-client';
import type { RegistroContratoForm } from '../types';

// Normaliza strings numericos a numero con dos decimales.
// Esto evita ruido de precision decimal al mostrar o guardar montos.
export const toMoneyNumber = (value: string) => Number(Number(value || 0).toFixed(2));

/**
 * Traduce el formulario editable al shape que espera crear contrato.
 * Hoy lo consume el repositorio mock; luego puede enviarse al API sin cambiar la pagina.
 */
export const buildCrearContratoPayload = (form: RegistroContratoForm) => ({
  cliente: form.cliente.trim(),
  ruc: form.ruc,
  descripcion: form.descripcion.trim() || undefined,
  tipo_servicio: form.tipo_servicio as TipoServicio,
  fecha_inicio: form.fecha_inicio,
  fecha_fin: form.fecha_fin,
  origen: form.origen.trim(),
  destino: form.destino.trim(),
  distancia_estimada_km: toMoneyNumber(form.distancia_estimada_km),
  tarifa_por_km: toMoneyNumber(form.tarifa_por_km),
  tarifa_por_hora: toMoneyNumber(form.tarifa_por_hora),
  tarifa_por_tonelada: toMoneyNumber(form.tarifa_por_tonelada),
  tarifa_espera: toMoneyNumber(form.tarifa_espera),
  moneda: 'PEN' as const,
});

// Tarifa referencial principal usada en el resumen.
export const getRegistroTarifaTotal = (form: RegistroContratoForm) =>
  toMoneyNumber(String(Number(form.distancia_estimada_km || 0) * Number(form.tarifa_por_km || 0)));
