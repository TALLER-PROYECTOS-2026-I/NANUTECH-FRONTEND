import apiClient from '../../../index';

export type Contrato = {
  id: string;
  codigo?: string;
  cliente?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tarifa?: string;
  moneda?: string;
  estado?: string;
  activo?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getContratosVigentes = async (): Promise<Contrato[]> => {
  try {
    const res = await apiClient.get<ApiResponse<Contrato[]>>('/contratos/vigentes');
    return res.data.data;
  } catch (error) {
    console.error('Error API contratos:', error);
    throw new Error('Error al obtener contratos');
  }
};