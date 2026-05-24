export type EstadoContrato = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';

export type EstadoOperacional =
  | 'DISPONIBLE'
  | 'EN_RUTA'
  | 'DESCANSANDO'
  | 'DE_PERMISO'
  | 'SIN_ASIGNAR';

export type EstadoFiltro = 'TODOS' | 'ACTIVOS' | 'INACTIVOS';
export type DisponibilidadFiltro = 'TODOS' | EstadoOperacional;

export type ConductorDashboard = {
  id: string;
  nombre: string;
  email: string;
  dni: string;
  licencia: string;
  contacto: string;
  estadoContrato: EstadoContrato;
  estadoOperacional: EstadoOperacional;
  camionAsignado: string | null;
  activo: boolean;
};

export type SegmentoGrafica = {
  key: string;
  label: string;
  value: number;
  color: string;
};

export type PanelConductores = {
  resumen: {
    totalConductores: number;
    conductoresActivos: number;
    disponibles: number;
    enRuta: number;
  };
  graficas: {
    contrato: SegmentoGrafica[];
    operacional: SegmentoGrafica[];
  };
  conductores: ConductorDashboard[];
};
