// Opciones del esquema de cobro editable en el detalle.
export const TIPO_SERVICIO_OPTIONS = [
  { value: 'POR_VIAJE', label: 'Por Viaje' },
  { value: 'POR_HORA', label: 'Por Hora' },
  { value: 'POR_TONELADA', label: 'Por Tonelada' },
  { value: 'POR_KM', label: 'Por Kilometro' },
] as const;

// Estados visibles en la vista y editables desde el formulario.
export const ESTADO_OPTIONS = [
  { value: 'VIGENTE', label: 'Activo' },
  { value: 'VENCIDO', label: 'Vencido' },
  { value: 'SUSPENDIDO', label: 'Suspendido' },
] as const;

// Monedas aceptadas en la HU07.
export const MONEDA_OPTIONS = [
  { value: 'PEN', label: 'PEN Soles' },
  { value: 'USD', label: 'USD Dolares' },
] as const;
