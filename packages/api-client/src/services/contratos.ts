import apiClient from '../../index';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const getContratosVigentes = async () => {
  try {
    const res = await apiClient.get<ApiResponse<any[]>>('/contratos/vigentes');
    return res.data.data;
  } catch (error) {
    console.error('Error API contratos:', error);
    throw new Error('Error al obtener contratos');
  }
};