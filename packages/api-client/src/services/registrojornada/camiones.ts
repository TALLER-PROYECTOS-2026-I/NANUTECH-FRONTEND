import apiClient from '../../../index';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getCamiones = async () => {
  try {
    const res = await apiClient.get<ApiResponse<any[]>>('/unidades/disponibles');
    return res.data.data;
  } catch (error) {
    console.error('Error API unidades:', error);
    throw new Error('Error al obtener camiones');
  }
};