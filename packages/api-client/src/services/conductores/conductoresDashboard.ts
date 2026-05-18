import apiClient from '../../../index';

export type EstadoFiltroConductores = 'TODOS' | 'ACTIVOS' | 'INACTIVOS';

export type DisponibilidadFiltroConductores =
  | 'TODOS'
  | 'DISPONIBLE'
  | 'EN_RUTA'
  | 'DESCANSANDO'
  | 'DE_PERMISO'
  | 'SIN_ASIGNAR';

export type FiltrosDashboardConductores = {
  busqueda?: string;
  estado?: EstadoFiltroConductores;
  disponibilidad?: DisponibilidadFiltroConductores;
};

export type ConductorDashboardApi = Record<string, unknown>;

export type DashboardConductoresApi = {
  resumen?: Record<string, unknown>;
  graficas?: Record<string, unknown>;
  conductores?: ConductorDashboardApi[];
  listado?: ConductorDashboardApi[];
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
} & T;

export const getDashboardConductores = async (
  filters: FiltrosDashboardConductores = {},
): Promise<DashboardConductoresApi> => {
  const params = {
    ...filters,
    estado: filters.estado === 'TODOS' ? undefined : filters.estado,
    disponibilidad:
      filters.disponibilidad === 'TODOS' ? undefined : filters.disponibilidad,
  };

  const response = await apiClient.get<ApiResponse<DashboardConductoresApi>>(
    '/conductores/dashboard',
    { params },
  );

  return response.data.data ?? response.data;
};
