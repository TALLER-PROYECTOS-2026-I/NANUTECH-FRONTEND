import type { TipoServicio } from '@nanutech/api-client';

// Props publicas de la HU07. El id llega desde Gestion de Contratos al presionar Ver.
export type DetalleContratoPageProps = {
  contratoId: string;
  onBack: () => void;
};

// Pestañas superiores: cambian el contenido inferior sin perder el contrato seleccionado.
export type DetalleContratoTab = 'resumen' | 'tarifas' | 'camiones' | 'historial';

// Estados administrables del contrato. El cambio de estado tambien se registra en historial.
export type EstadoContratoDetalle = 'VIGENTE' | 'VENCIDO' | 'SUSPENDIDO';

// Camiones disponibles para vincular al contrato desde el panel de edicion.
export type CamionDisponible = {
  id: string;
  placa: string;
  modelo: string;
};

// Registro auditable que se agrega cada vez que el usuario guarda cambios.
export type HistorialContrato = {
  id: string;
  fechaHora: string;
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
  ip: string;
};

// Modelo local de detalle, pensado para mapear facil al contrato real cuando el backend este listo.
export type DetalleContrato = {
  id: string;
  codigo: string;
  cliente: string;
  ruc: string;
  tipoServicio: TipoServicio;
  estado: EstadoContratoDetalle;
  moneda: 'PEN' | 'USD';
  tarifa: number;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  origen: string;
  destino: string;
  fechaCreacion: string;
  ultimaActualizacion: string;
  unidadIds: string[];
  historial: HistorialContrato[];
};

// Estado del formulario de edicion. Mantiene strings para controlar inputs y selects.
export type DetalleContratoForm = {
  cliente: string;
  tipoServicio: TipoServicio;
  estado: EstadoContratoDetalle;
  moneda: 'PEN' | 'USD';
  tarifa: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  unidadIds: string[];
};
