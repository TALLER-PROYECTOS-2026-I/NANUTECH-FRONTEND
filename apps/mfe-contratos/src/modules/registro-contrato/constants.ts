import type { TipoServicio } from '@nanutech/api-client';
import { getTodayLocal } from './utils/dateUtils';
import type { RegistroContratoForm } from './types';

// Etiquetas del wizard. Mantener aqui permite modificar los nombres sin tocar el componente Stepper.
export const registroSteps = [
  { title: 'Datos Generales', subtitle: 'Paso 1' },
  { title: 'Ruta de Servicio', subtitle: 'Paso 2' },
  { title: 'Reglas de Tarifa', subtitle: 'Paso 3' },
];

// Opciones permitidas por el dominio de contratos.
// Deben mantenerse alineadas con TipoServicio del api-client.
export const tipoServicioOptions: Array<{ value: TipoServicio | ''; label: string }> = [
  { value: '', label: 'Seleccionar tipo' },
  { value: 'POR_VIAJE', label: 'Por Viaje' },
  { value: 'POR_HORA', label: 'Por Hora' },
  { value: 'POR_TONELADA', label: 'Por Tonelada' },
  { value: 'POR_KM', label: 'Por Kilometro' },
  { value: 'MENSUAL', label: 'Mensual' },
];

// Rutas sugeridas para el demo de la HU. Luego pueden venir de un catalogo real.
export const terminalOptions = [
  { value: '', label: 'Seleccionar ciudad/terminal' },
  { value: 'Lima - Terminal Ate', label: 'Lima - Terminal Ate' },
  { value: 'Lima - Terminal Callao', label: 'Lima - Terminal Callao' },
  { value: 'Arequipa - Terminal Central', label: 'Arequipa - Terminal Central' },
  { value: 'Trujillo - Terminal Norte', label: 'Trujillo - Terminal Norte' },
  { value: 'Cusco - Terminal Sur', label: 'Cusco - Terminal Sur' },
  { value: 'Piura - Terminal Oeste', label: 'Piura - Terminal Oeste' },
];

// Estado inicial de un registro nuevo.
// Las fechas se generan en local para evitar desfases por UTC en input type="date".
export const initialRegistroContratoForm: RegistroContratoForm = {
  cliente: '',
  ruc: '',
  tipo_servicio: '',
  fecha_inicio: getTodayLocal(),
  fecha_fin: '',
  descripcion: '',
  origen: '',
  destino: '',
  distancia_estimada_km: '',
  tiempo_estimado_horas: '',
  observaciones_ruta: '',
  tarifa_por_km: '',
  tarifa_por_hora: '',
  tarifa_por_tonelada: '',
  tarifa_espera: '',
};
