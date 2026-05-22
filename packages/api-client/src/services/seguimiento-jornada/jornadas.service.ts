import apiClient from '../../../index';

// Define los filtros que entiende el backend para consultar el historial HU05.
export type SeguimientoJornadaFilters = {
  q?: string;
  conductor_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
};

// Representa cada conductor disponible para el selector del modal Nueva Jornada.
export type SeguimientoConductorOption = {
  id: string;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  estado?: string;
  activo?: boolean;
};

// Representa cada unidad disponible para asignar a una nueva jornada.
export type SeguimientoUnidadOption = {
  id: string;
  placa?: string;
  marca?: string;
  modelo?: string;
  estado?: string;
  activo?: boolean;
};

// Representa cada contrato vigente que puede asociarse al registro de jornada.
export type SeguimientoContratoOption = {
  id: string;
  codigo?: string;
  cliente?: string;
  estado?: string;
  activo?: boolean;
};

// Define el payload exacto que espera POST /jornadas en jornada-services.
export type CreateSeguimientoJornadaPayload = {
  conductor_id: string;
  unidad_id: string;
  contrato_id: string;
  creado_por: string;
  fecha_jornada?: string;
  origen?: string;
  destino?: string;
  km_recorridos?: number;
  observaciones?: string;
  estado?: 'REGISTRADA' | 'PENDIENTE' | 'EN_PROCESO';
};

// Estandariza la forma de respuesta usada por los endpoints del backend.
type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  items?: T;
};

// Extrae arrays desde respuestas envueltas como { data } o { items }.
const unwrapArrayResponse = <T>(payload: ApiResponse<T[]> | T[]): T[] => {
  if (Array.isArray(payload)) return payload;
  return payload.data ?? payload.items ?? [];
};

// Consulta GET /jornadas con filtros oficiales del backend para pintar el historial.
export const getSeguimientoJornadas = async (
  filters: SeguimientoJornadaFilters = {},
) => {
  const response = await apiClient.get<ApiResponse<unknown[]> | unknown[]>('/jornadas', {
    params: filters,
  });

  return unwrapArrayResponse(response.data);
};

// Carga el catalogo de conductores para el selector del modal Nueva Jornada.
export const getSeguimientoConductoresCatalogo = async () => {
  const response = await apiClient.get<ApiResponse<SeguimientoConductorOption[]> | SeguimientoConductorOption[]>(
    '/conductores',
  );

  return unwrapArrayResponse(response.data);
};

// Carga las unidades disponibles para evitar asignar camiones ocupados.
export const getSeguimientoUnidadesDisponibles = async () => {
  const response = await apiClient.get<ApiResponse<SeguimientoUnidadOption[]> | SeguimientoUnidadOption[]>(
    '/unidades/disponibles',
  );

  return unwrapArrayResponse(response.data);
};

// Carga los contratos vigentes que pueden asociarse a la jornada.
export const getSeguimientoContratosVigentesCatalogo = async () => {
  const response = await apiClient.get<ApiResponse<SeguimientoContratoOption[]> | SeguimientoContratoOption[]>(
    '/contratos/vigentes',
  );

  return unwrapArrayResponse(response.data);
};

// Registra una nueva jornada laboral usando POST /jornadas.
export const createSeguimientoJornada = async (
  payload: CreateSeguimientoJornadaPayload,
) => {
  const response = await apiClient.post<ApiResponse<unknown>>('/jornadas', payload);

  return response.data?.data ?? response.data;
};

// Descarga el CSV oficial generado por el backend con los filtros actuales.
export const exportSeguimientoJornadasCsv = async (
  filters: SeguimientoJornadaFilters = {},
) => {
  const response = await apiClient.get<Blob>('/jornadas/exportar', {
    params: filters,
    responseType: 'blob',
  });

  return response.data;
};
