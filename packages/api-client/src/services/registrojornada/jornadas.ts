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

const MOCK_JORNADAS: Jornada[] = [
  {
    id: 'MOCK-001',
    fecha: '2026-04-15',
    conductor: 'Carlos Gomez',
    camion: 'ABC-123 - Mercedes Benz Actros',
    contrato: 'CONT-001',
    horario: '08:00 - 17:00',
    km: 250,
    estado: 'REGISTRADA',
    observaciones: 'Primera jornada del mes',
  },
  {
    id: 'MOCK-002',
    fecha: '2026-04-14',
    conductor: 'Luis Martinez',
    camion: 'DEF-456 - Volvo FH16',
    contrato: 'CONT-002',
    horario: '08:00 - 17:00',
    km: 280,
    estado: 'COMPLETADA',
    observaciones: 'Completada',
  },
];

export const getJornadas = async (): Promise<Jornada[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Jornada[]>>('/jornadas');
    return response.data?.data || [];
  } catch (error) {
    console.warn('⚠️ Error obteniendo jornadas del backend, usando datos mock:', error);
    return MOCK_JORNADAS;
  }
};

export const getJornadaActual = async (conductorId: string) => {
  try {
    const response = await apiClient.get(`/jornadas/actual/${conductorId}`);
    return response.data?.data ?? response.data ?? null;
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
    const response = await apiClient.post<ApiResponse<any>>('/jornadas', data);

    return {
      success: true,
      data: response.data?.data ?? response.data,
    };
  } catch (error) {
    console.error('Error creando jornada:', error);
    throw error;
  }
};