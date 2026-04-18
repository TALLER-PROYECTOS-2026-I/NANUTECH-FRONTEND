import apiClient from '../../../index';

export type Conductor = {
  id: string;
  cognito_sub?: string;
  correo?: string;
  nombres?: string;
  apellidos?: string;
  rol?: string;
  telefono?: string;
  dni?: string;
  activo?: boolean;
  estado?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getConductores = async (): Promise<Conductor[]> => {
  try {
    const res = await apiClient.get<ApiResponse<Conductor[]>>('/conductores');
    return res.data.data;
  } catch (error) {
    console.error('Error API conductores:', error);
    throw new Error('Error al obtener conductores');
  }
};