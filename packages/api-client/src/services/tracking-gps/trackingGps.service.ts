import apiClient from '../../../index';

// Estados operativos que el backend de tracking GPS puede devolver.
export type EstadoTrackingGpsApi = 'MOVIENDO' | 'DETENIDO' | 'EXCESO_VELOCIDAD';

// Estructura de indicadores agregados para las tarjetas de HU09.
export type TrackingGpsSummaryApi = {
  total_registros: number;
  unidades_movimiento: number;
  unidades_detenidas: number;
  excesos_velocidad: number;
};

// Registro crudo de telemetria que retorna el endpoint /gps/registros.
export type TrackingGpsRegistroApi = {
  id: string;
  placa: string;
  proveedor: string;
  fecha_hora: string;
  latitud: number | string | null;
  longitud: number | string | null;
  velocidad_kmh: number | string;
  rumbo: number | string | null;
  distancia_total: number | string | null;
  estado: EstadoTrackingGpsApi;
  created_at: string;
  exceso_velocidad: boolean;
};

// Filtros soportados por los endpoints de tracking GPS.
export type TrackingGpsFilters = {
  proveedor?: string;
  placa?: string;
  estado?: EstadoTrackingGpsApi;
  horaInicio?: string;
  horaFin?: string;
};

// Envoltura generica de respuestas estandarizadas del backend.
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Elimina parametros vacios para no enviar query params innecesarios.
const buildParams = (filters: TrackingGpsFilters = {}) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
  );

// Obtiene los KPIs principales del panel de Tracking GPS.
export const getTrackingGpsSummary = async (): Promise<TrackingGpsSummaryApi> => {
  const response = await apiClient.get<ApiResponse<TrackingGpsSummaryApi>>('/gps/tracking/resumen');

  return response.data.data;
};

// Lista los eventos de telemetria aplicando filtros de placa, estado o rango horario.
export const getTrackingGpsRegistros = async (
  filters: TrackingGpsFilters = {},
): Promise<TrackingGpsRegistroApi[]> => {
  const response = await apiClient.get<ApiResponse<TrackingGpsRegistroApi[]>>('/gps/registros', {
    params: buildParams(filters),
  });

  return response.data.data;
};

// Descarga el CSV generado por el backend y conserva el nombre de archivo enviado.
export const exportTrackingGpsCsv = async (
  filters: TrackingGpsFilters = {},
): Promise<{ csv: string; filename: string }> => {
  const response = await apiClient.get<string>('/gps/tracking/export', {
    params: buildParams(filters),
    responseType: 'text',
  });

  const disposition = response.headers['content-disposition'];
  const filenameMatch = typeof disposition === 'string'
    ? disposition.match(/filename="?([^"]+)"?/i)
    : null;

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();

  return {
    csv: response.data,
    filename: filenameMatch?.[1] ?? `reporte_tracking_${dd}${mm}${yyyy}.csv`,
  };
};
