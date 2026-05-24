import apiClient from '../../../index';

export type EstadisticasConductorApi = {
  conductor_id: string;
  conductor_nombre: string;
  total_jornadas: number;
  jornadas_completadas: number;
  jornadas_activas: number;
  horas_totales_trabajadas: number;
  promedio_horas_por_jornada: number;
  estado_actual: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getEstadisticasConductor = async (
  conductorId: string,
): Promise<EstadisticasConductorApi> => {
  const response = await apiClient.get<ApiResponse<EstadisticasConductorApi>>(
    `/conductores/${conductorId}/estadisticas`,
  );
  return response.data.data;
};
