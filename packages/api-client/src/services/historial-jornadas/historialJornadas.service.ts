import apiClient from '../../../index';

// Filtros visibles de HU17 que se traducen a query params del backend de jornadas.
export type HistorialJornadasFilters = {
  q?: string;
  conductor?: string;
  estado_alerta?: 'PANICO' | 'AUXILIO_MECANICO' | '';
  fecha_desde?: string;
  fecha_hasta?: string;
  observaciones?: '' | 'true';
};

// Estructura flexible del registro enriquecido que retorna GET /jornadas/historial-gerencial.
export type HistorialJornadaRaw = {
  id: string;
  fecha?: string;
  fecha_jornada?: string;
  conductor?: string;
  camion?: string;
  placa?: string;
  contrato?: string;
  horario?: string;
  hora_inicio?: string;
  hora_fin?: string;
  duracion_total?: string;
  km_recorridos?: number | string | null;
  estado?: string;
  observaciones?: string | null;
  tiene_observaciones?: boolean;
  tipo_alerta?: 'PANICO' | 'AUXILIO_MECANICO' | 'OBSERVACION' | string | null;
  alerta_descripcion?: string | null;
  fecha_alerta?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  estado_alerta?: string | null;
  es_panico?: boolean;
  es_auxilio?: boolean;
  origen?: string | null;
  destino?: string | null;
};

// Indicadores que alimentan las tarjetas superiores del historial gerencial.
export type HistorialJornadasMetrics = {
  total_jornadas: number;
  alertas_panico: number;
  auxilio_mecanico: number;
  jornadas_observaciones: number;
  km_promedio: number;
};

// Detalle de una alerta asociada a una jornada, usado por el modal de emergencia.
export type HistorialAlertaDetalle = {
  jornada_id: string;
  conductor?: string;
  placa?: string;
  fecha_jornada?: string;
  origen?: string;
  destino?: string;
  tipo_alerta?: 'PANICO' | 'AUXILIO_MECANICO' | string | null;
  detalle?: string | null;
  fecha_hora?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  estado?: string | null;
  atendida_at?: string | null;
  detalle_resolucion?: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Elimina parametros vacios para no enviar filtros innecesarios al backend.
const cleanParams = (filters: HistorialJornadasFilters) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

// Consulta el registro detallado de jornadas con alertas y observaciones.
export const getHistorialJornadas = async (
  filters: HistorialJornadasFilters = {}
): Promise<HistorialJornadaRaw[]> => {
  const response = await apiClient.get<ApiResponse<HistorialJornadaRaw[]>>(
    '/jornadas/historial-gerencial',
    {
      params: cleanParams(filters),
    }
  );

  return response.data?.data ?? [];
};

// Consulta las metricas agregadas para las tarjetas superiores de HU17.
export const getHistorialJornadasMetrics = async (
  filters: HistorialJornadasFilters = {}
): Promise<HistorialJornadasMetrics> => {
  const response = await apiClient.get<ApiResponse<Partial<HistorialJornadasMetrics>>>(
    '/jornadas/historial-gerencial/metrics',
    {
      params: cleanParams(filters),
    }
  );

  const data = response.data?.data ?? {};

  return {
    total_jornadas: Number(data.total_jornadas ?? 0),
    alertas_panico: Number(data.alertas_panico ?? 0),
    auxilio_mecanico: Number(data.auxilio_mecanico ?? 0),
    jornadas_observaciones: Number(data.jornadas_observaciones ?? 0),
    km_promedio: Number(data.km_promedio ?? 0),
  };
};

// Obtiene el detalle completo de una alerta para abrir el modal de emergencia.
export const getHistorialAlertaDetalle = async (
  jornadaId: string
): Promise<HistorialAlertaDetalle | null> => {
  const response = await apiClient.get<ApiResponse<HistorialAlertaDetalle | null>>(
    `/jornadas/alerta/${jornadaId}`
  );

  return response.data?.data ?? null;
};

// Descarga el CSV operativo usando el endpoint de exportacion existente del backend.
export const exportHistorialJornadasCsv = async (
  filters: HistorialJornadasFilters = {}
): Promise<Blob> => {
  const response = await apiClient.get<Blob>('/jornadas/exportar', {
    params: cleanParams(filters),
    responseType: 'blob',
  });

  return response.data;
};
