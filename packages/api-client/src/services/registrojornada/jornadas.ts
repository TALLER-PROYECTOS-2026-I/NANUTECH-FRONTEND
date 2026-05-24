import apiClient from '../../../index';

export type Jornada = {
  id: string;
  fecha?: string;
  fecha_jornada?: string;
  conductor: string;
  camion: string;
  contrato: string;
  horario: string;
  km: number | string;
  km_recorridos?: number | string;
  estado: string;
  observaciones?: string | null;
};

export type CrearJornadaPayload = {
  conductor_id: string;
  unidad_id: string;
  contrato_id: string;
  creado_por: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  km_recorridos: number;
  origen: string;
  destino: string;
  observaciones: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};



export const getJornadas = async (): Promise<Jornada[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Jornada[]>>('/jornadas');
    return (response.data?.data || []).map((jornada) => ({
      ...jornada,
      km: jornada.km ?? jornada.km_recorridos ?? 0,
    }));
  } catch (error) {
    console.warn('⚠️ Error obteniendo jornadas del backend:', error);
    throw new Error('Error al obtener jornadas');
  }
};

export const getJornadaActual = async (conductorId: string) => {
  try {
    const response = await apiClient.get(`/jornadas/actual/${conductorId}`);

    const payload = response.data;

    if (payload?.success && payload?.data) {
      return payload.data;
    }

    return null;
  } catch (error) {
    console.warn('⚠️ Error obteniendo jornada actual del backend:', error);
    return null;
  }
};

export const iniciarJornada = async (jornadaId: string, conductorId: string) => {
  const response = await apiClient.post('/jornadas/iniciar', {
    jornada_id: jornadaId,
    conductor_id: conductorId,
  });

  return response.data;
};

export const finalizarJornada = async (
  jornadaId: string,
  observaciones?: string,
  conductorId?: string
) => {
  const response = await apiClient.post('/jornadas/finalizar', {
    jornada_id: jornadaId,
    conductor_id: conductorId,
    observaciones,
    hora_finalizacion: new Date().toISOString(),
  });

  return response.data;
};

export const createJornada = async (data: CrearJornadaPayload) => {
  try {
    const response = await apiClient.post<ApiResponse<unknown>>('/jornadas', data);

    return {
      success: true,
      data: response.data?.data ?? response.data,
    };
  } catch (error) {
    console.error('Error creando jornada:', error);
    throw error;
  }
};
