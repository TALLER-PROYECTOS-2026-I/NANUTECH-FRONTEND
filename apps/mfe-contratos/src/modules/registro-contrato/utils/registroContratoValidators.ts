import type { RegistroContratoErrors, RegistroContratoForm } from '../types';

// Valida el primer paso: datos comerciales y vigencia.
export const validateGeneralStep = (form: RegistroContratoForm): RegistroContratoErrors => {
  const errors: RegistroContratoErrors = {};

  if (!form.cliente.trim()) errors.cliente = 'Campo obligatorio';
  if (!/^\d{11}$/.test(form.ruc)) errors.ruc = 'El RUC debe tener 11 digitos numericos';
  if (!form.tipo_servicio) errors.tipo_servicio = 'Seleccione un tipo de servicio';
  if (!form.fecha_inicio) errors.fecha_inicio = 'Campo obligatorio';
  if (!form.fecha_fin) errors.fecha_fin = 'Campo obligatorio';
  if (form.fecha_fin && form.fecha_inicio && form.fecha_fin <= form.fecha_inicio) {
    errors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
  }

  return errors;
};

// Valida el segundo paso: origen, destino y distancia operativa.
export const validateRouteStep = (form: RegistroContratoForm): RegistroContratoErrors => {
  const errors: RegistroContratoErrors = {};

  if (!form.origen.trim()) errors.origen = 'Campo obligatorio';
  if (!form.destino.trim()) errors.destino = 'Campo obligatorio';
  if (Number(form.distancia_estimada_km) <= 0) {
    errors.distancia_estimada_km = 'La distancia debe ser mayor a 0';
  }

  return errors;
};

// Valida el tercer paso: tarifas obligatorias y montos no negativos.
export const validateRatesStep = (form: RegistroContratoForm): RegistroContratoErrors => {
  const errors: RegistroContratoErrors = {};

  if (Number(form.tarifa_por_km) <= 0) errors.tarifa_por_km = 'Debe ser mayor a 0';
  if (form.tarifa_por_hora === '') errors.tarifa_por_hora = 'Campo obligatorio';
  if (Number(form.tarifa_por_hora) < 0) errors.tarifa_por_hora = 'No puede ser negativo';
  if (form.tarifa_por_tonelada !== '' && Number(form.tarifa_por_tonelada) < 0) {
    errors.tarifa_por_tonelada = 'No puede ser negativo';
  }
  if (form.tarifa_espera === '') errors.tarifa_espera = 'Campo obligatorio';
  if (Number(form.tarifa_espera) < 0) errors.tarifa_espera = 'No puede ser negativo';

  return errors;
};

// Helper para que las paginas no repitan Object.keys(...).length.
export const hasErrors = (errors: RegistroContratoErrors) => Object.keys(errors).length > 0;
