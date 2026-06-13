import apiClient from '../../../index';

export type GpsProveedorApi = {
  proveedor: string;
  nombre: string;
  encabezados: string[];
};

export type GpsTemplateApi = {
  proveedor: string;
  nombre: string;
  filename: string;
  content_type: string;
  encabezados: string[];
  csv: string;
};

export type GpsValidationApi = {
  proveedor: string;
  nombre_archivo: string;
  importacion_habilitada: boolean;
  total_filas: number;
  encabezados_esperados: string[];
  encabezados_recibidos: string[];
  filas_validas: number;
  errores: Array<{
    row?: number;
    field?: string;
    message: string;
    value?: unknown;
  }>;
};

export type GpsImportApi = {
  id?: string;
  proveedor?: string;
  nombre_archivo?: string;
  total_registros?: number;
  registros_validos?: number;
  registros_error?: number;
  duplicados?: number;
  estado?: string;
};

export type GpsResumenApi = {
  total_registros_activos?: number;
  unidades_en_movimiento?: number;
  unidades_detenidas?: number;
  velocidad_promedio?: number;
};

export type GpsRegistroApi = {
  id: string;
  placa: string;
  proveedor: string;
  fecha_hora: string;
  latitud: number;
  longitud: number;
  velocidad_kmh: number;
  rumbo: number;
  distancia_total: number;
  estado: string;
  exceso_velocidad: boolean;
  created_at?: string;
};

export type GpsRegistroFilters = {
  proveedor?: string;
  placa?: string;
  estado?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type CsvPayload = {
  proveedor: string;
  nombreArchivo: string;
  csv: string;
};

export const getGpsProveedores = async () => {
  const response = await apiClient.get<ApiResponse<GpsProveedorApi[]>>('/gps/proveedores');
  return response.data.data;
};

export const getGpsPlantilla = async (proveedor: string) => {
  const response = await apiClient.get<ApiResponse<GpsTemplateApi>>('/gps/plantilla', {
    params: { proveedor },
  });
  return response.data.data;
};

export const validarGpsCsv = async (payload: CsvPayload) => {
  const response = await apiClient.post<ApiResponse<GpsValidationApi>>('/gps/validar', {
    proveedor: payload.proveedor,
    nombre_archivo: payload.nombreArchivo,
    csv: payload.csv,
  });
  return response.data.data;
};

export const importarGpsCsv = async (payload: CsvPayload) => {
  const response = await apiClient.post<ApiResponse<GpsImportApi>>('/gps/importar', {
    proveedor: payload.proveedor,
    nombre_archivo: payload.nombreArchivo,
    csv: payload.csv,
  });
  return response.data.data;
};

export const getGpsResumen = async () => {
  const response = await apiClient.get<ApiResponse<GpsResumenApi>>('/gps/resumen');
  return response.data.data;
};

export const getGpsRegistros = async (filters: GpsRegistroFilters = {}) => {
  const response = await apiClient.get<ApiResponse<GpsRegistroApi[]>>('/gps/registros', {
    params: {
      proveedor: filters.proveedor || undefined,
      placa: filters.placa || undefined,
      estado: filters.estado || undefined,
    },
  });
  return response.data.data;
};
