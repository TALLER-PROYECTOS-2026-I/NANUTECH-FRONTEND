import apiClient from '../../../index';

// Representa exactamente el payload `data` que retorna GET /conductores/{id}/estadisticas.
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

// Estructura comun de respuesta usada por el backend serverless.
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Consulta las estadisticas agregadas del conductor para alimentar la ficha HU20.
export const getEstadisticasConductor = async (
  conductorId: string,
): Promise<EstadisticasConductorApi> => {
  // El backend expone las metricas de perfil en el subrecurso /estadisticas.
  const response = await apiClient.get<ApiResponse<EstadisticasConductorApi>>(
    `/conductores/${conductorId}/estadisticas`,
  );
  // El componente solo necesita el contenido normalizado de data, no el envelope HTTP.
  return response.data.data;
};
