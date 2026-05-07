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
  activo?: boolean;
  descripcion?: string;
  dias_para_vencer?: number;
  camiones_asignados?: number;
  proximo_a_vencer?: boolean;
  total_referencial?: number;
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

export type ContratosIndicadores = {
  total_contratos: number;
  contratos_activos: number;
  contratos_vencidos: number;
  proximos_a_vencer: number;
  camiones_asignados: number;
  distribucion_por_estado: Array<{ estado: string; cantidad: number }>;
  distribucion_por_tipo_servicio: Array<{ tipo_servicio: TipoServicio; cantidad: number }>;
};

export type ContratosListResponse = {
  data: Contrato[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
};

export type GetContratosParams = {
  q?: string;
  estado?: string;
  page?: number;
  limit?: number;
  order_by?: 'fecha_fin' | 'fecha_inicio' | 'cliente' | 'codigo' | 'estado' | 'created_at';
};

export const getContratosVigentes = async (): Promise<Contrato[]> => {
  const res = await apiClient.get<ApiResponse<Contrato[]>>('/contratos/vigentes');
  return res.data.data;
};

export const getContratos = async (
  params: GetContratosParams = {}
): Promise<ContratosListResponse> => {
  const res = await apiClient.get<ApiResponse<ContratosListResponse>>('/contratos', { params });
  return res.data.data;
};

export const getContratoById = async (id: string): Promise<Contrato> => {
  const res = await apiClient.get<ApiResponse<Contrato>>(`/contratos/${id}`);
  return res.data.data;
};

export const getIndicadoresContratos = async (): Promise<ContratosIndicadores> => {
  const res = await apiClient.get<ApiResponse<ContratosIndicadores>>('/contratos/indicadores');
  return res.data.data;
};

export const crearContrato = async (
  payload: CrearContratoPayload
): Promise<Contrato> => {
  const res = await apiClient.post<ApiResponse<Contrato>>('/contratos', payload);
  return res.data.data;
};
