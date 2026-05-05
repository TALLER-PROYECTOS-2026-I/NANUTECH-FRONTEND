import apiClient from '../../../index';

export type TipoServicio =
  | 'POR_VIAJE'
  | 'POR_HORA'
  | 'POR_TONELADA'
  | 'POR_KM'
  | 'MENSUAL';

export type Contrato = {
  id: string;
  codigo?: string;
  cliente: string;
  ruc: string;
  tipo_servicio: TipoServicio;
  fecha_inicio: string;
  fecha_fin?: string;
  origen: string;
  destino: string;
  distancia_estimada_km: number;
  tarifa_por_km: number;
  tarifa_por_hora: number;
  tarifa_espera: number;
  tarifa?: number;
  moneda?: string;
  estado?: string;
};

export type CrearContratoPayload = {
  cliente: string;
  ruc: string;
  descripcion?: string;
  tipo_servicio: TipoServicio;
  fecha_inicio: string;
  fecha_fin?: string;
  origen: string;
  destino: string;
  distancia_estimada_km: number;
  tarifa_por_km: number;
  tarifa_por_hora: number;
  tarifa_espera: number;
  moneda: 'PEN';
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getContratosVigentes = async (): Promise<Contrato[]> => {
  const res = await apiClient.get<ApiResponse<Contrato[]>>('/contratos/vigentes');
  return res.data.data;
};

export const crearContrato = async (
  payload: CrearContratoPayload
): Promise<Contrato> => {
  const res = await apiClient.post<ApiResponse<Contrato>>('/contratos', payload);
  return res.data.data;
};