import apiClient from '../../../index';

export type EstadoCamionHu11 =
  | 'DISPONIBLE'
  | 'EN_JORNADA'
  | 'EN_AUXILIO'
  | 'MANTENIMIENTO'
  | 'INACTIVA';

export type CamionHu11 = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidad_ton: number;
  estado: EstadoCamionHu11;
  gps_habilitado: boolean;
  vin: string;
  color: string;
  tipo_combustible: string;
  kilometraje_actual: number;
  fecha_registro: string;
  ultima_fecha_mantenimiento: string | null;
  proxima_fecha_mantenimiento: string | null;
  horas_movimiento: number;
  horas_detenido: number;
  horas_totales: number;
  kilometros_totales: number;
  ultimo_gps_at: string | null;
  activo: boolean;
};

export type PanelCamionesHu11 = {
  resumen: {
    total_camiones: number;
    en_uso: number;
    disponibles: number;
    mantenimiento: number;
  };
  grafica_movimiento: {
    horas_movimiento: number;
    horas_detenido: number;
    porcentaje_movimiento: number;
    porcentaje_detenido: number;
  };
  camiones: CamionHu11[];
};

export type CrearCamionHu11Payload = {
  id?: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidad_ton: number;
  vin: string;
  color: string;
  combustible: string;
  gps: boolean;
  kilometraje_actual?: number;
  fecha_registro?: string;
  notas?: string;
};

export type CrearCamionHu11Response = CamionHu11 & {
  confirmacion?: {
    message: string;
    placa: string;
    modelo: string;
  };
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type FiltrosCamionesHu11 = {
  placa?: string;
  estado?: string;
};

export const getPanelCamionesHu11 = async (
  filters: FiltrosCamionesHu11 = {},
): Promise<PanelCamionesHu11> => {
  const response = await apiClient.get<ApiResponse<PanelCamionesHu11>>(
    '/camiones/panel',
    { params: filters },
  );

  return response.data.data;
};

export const crearCamionHu11 = async (
  payload: CrearCamionHu11Payload,
): Promise<CrearCamionHu11Response> => {
  const response = await apiClient.post<ApiResponse<CrearCamionHu11Response>>(
    '/camiones',
    payload,
  );

  return response.data.data;
};

export const descargarCamionesHu11Csv = async (
  filters: FiltrosCamionesHu11 = {},
): Promise<string> => {
  const response = await apiClient.get<string>('/camiones/exportar/csv', {
    params: filters,
    responseType: 'text',
  });

  return response.data;
};
