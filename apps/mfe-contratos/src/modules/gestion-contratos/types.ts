// Tipos principales para la gestión de contratos

export type EstadoContrato = 'activo' | 'vencido' | 'suspendido';

export type TipoServicio = 'Por Viaje' | 'Por Hora' | 'Por Tonelada' | 'Por Tonelada Km';

export interface Contrato {
  id: string;
  codigo: string;
  cliente: string;
  tipoServicio: TipoServicio;
  tarifa: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoContrato;
  camionesAsignados?: number;
  acciones?: string;
}

export interface ResumenDatos {
  totalContratos: number;
  contratosActivos: number;
  contratosVencidos: number;
  camionesAsignados: number;
}

export interface DatosGrafica {
  name: string;
  value: number;
}

export interface PaginacionDatos {
  items: Contrato[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}
