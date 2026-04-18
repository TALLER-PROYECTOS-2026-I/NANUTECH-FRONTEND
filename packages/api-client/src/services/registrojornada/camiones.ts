import apiClient from '../../../index';

export type Camion = {
  id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  capacidad_ton?: string;
  estado?: string;
  activo?: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getCamiones = async (): Promise<Camion[]> => {
  try {
    const res = await apiClient.get<ApiResponse<Camion[]>>('/unidades/disponibles');
    return res.data.data;
  } catch (error) {
    console.error('Error API unidades:', error);
    throw new Error('Error al obtener camiones');
  }
};