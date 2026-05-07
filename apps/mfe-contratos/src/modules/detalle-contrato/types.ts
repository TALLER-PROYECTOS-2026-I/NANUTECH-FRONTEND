export interface Contrato {
  id: string;
  codigo: string;
  cliente: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'Activo' | 'Inactivo' | 'Completado';
  tarifa: number;
  moneda: string;
  tipoTarifa: 'Por Viaje' | 'Por Hora' | 'Por Tonelada';
  diasRestantes: number;
  diasVencimiento: number;
}

export interface EstadisticasContrato {
  camiones: number;
  duracion: string;
  diasRestantes: number;
  diasVencimiento: number;
}

export interface InformacionSistema {
  fechaCreacion: string;
  ultimaActualizacion: string;
}

export interface Camion {
  id: string;
  placa: string;
  modelo: string;
  capacidad?: string;
  estado?: string;
}

export interface CambioHistorial {
  id: string;
  fecha: string;
  hora: string;
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
  usuario?: string;
  ip?: string;
}

export interface TabOpcion {
  id: string;
  label: string;
  icon?: string;
}
