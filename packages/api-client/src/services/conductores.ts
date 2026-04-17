import apiClient from '../../index';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getConductores = async () => {
  try {
    const res = await apiClient.get<ApiResponse<any[]>>('/conductores');
    return res.data.data;
  } catch (error) {
    console.error('Error API conductores:', error);
    throw new Error('Error al obtener conductores');
  }
};