import apiClient from '../../../index';

export type Jornada = {
  id: string;
  fecha: string;
  conductor: string;
  camion: string;
  contrato: string;
  horario: string;
  km: number;
  estado: string;
  observaciones?: string;
};

export type JornadaInput = Omit<Jornada, 'id'>;

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const MOCK_JORNADAS: Jornada[] = [
  {
    id: 'MOCK-001',
    fecha: '2026-04-15',
    conductor: 'CONDUCTOR-001',
    camion: 'ABC-1234',
    contrato: 'CONT-001',
    horario: '08:00 - 17:00',
    km: 250,
    estado: 'Pendiente',
    observaciones: 'Primera jornada del mes',
  },
  {
    id: 'MOCK-002',
    fecha: '2026-04-14',
    conductor: 'CONDUCTOR-001',
    camion: 'ABC-1234',
    contrato: 'CONT-001',
    horario: '08:00 - 17:00',
    km: 280,
    estado: 'Finalizada',
    observaciones: 'Completada',
  },
  {
    id: 'MOCK-003',
    fecha: '2026-04-13',
    conductor: 'CONDUCTOR-001',
    camion: 'ABC-1234',
    contrato: 'CONT-001',
    horario: '08:00 - 17:00',
    km: 310,
    estado: 'Finalizada',
    observaciones: 'Completada',
  },
];

const MOCK_JORNADA_ACTUAL: Jornada = {
  id: 'MOCK-001',
  fecha: '2026-04-15',
  conductor: 'CONDUCTOR-001',
  camion: 'ABC-1234',
  contrato: 'CONT-001',
  horario: '08:00 - 17:00',
  km: 250,
  estado: 'Pendiente',
  observaciones: 'Primera jornada del mes',
};

export const getJornadas = async (conductorId?: string): Promise<Jornada[]> => {
  try {
    const response = await apiClient.get<Jornada[] | ApiResponse<Jornada[]>>('/jornadas', {
      params: conductorId ? { conductor_id: conductorId } : {},
    });

    const payload = response.data;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }

    return [];
  } catch (error) {
    console.warn('⚠️ Error obteniendo jornadas del backend, usando datos mock:', error);
    return MOCK_JORNADAS;
  }
};

export const getJornadaActual = async (conductorId: string): Promise<Jornada | null> => {
  try {
    const response = await apiClient.get<Jornada | ApiResponse<Jornada>>('/jornadas/actual', {
      params: { conductor_id: conductorId },
    });

    const payload = response.data as any;

    if (payload?.data) {
      return payload.data;
    }

    return payload ?? null;
  } catch (error: any) {
    console.warn('⚠️ Error obteniendo jornada actual del backend, usando datos mock:', error);
    return MOCK_JORNADA_ACTUAL;
  }
};

export const iniciarJornada = async (conductorId: string, jornadaData: any) => {
  try {
    const response = await apiClient.post('/jornadas/iniciar', {
      conductor_id: conductorId,
      ...jornadaData,
    });

    return {
      success: true,
      data: response.data?.data ?? response.data,
    };
  } catch (error: any) {
    console.warn('⚠️ Error iniciando jornada, usando datos mock:', error);

    return {
      success: true,
      data: { ...MOCK_JORNADA_ACTUAL, estado: 'Activa' },
    };
  }
};

export const finalizarJornada = async (
  jornadaId: string,
  observaciones?: string,
  conductorId?: string
) => {
  try {
    const response = await apiClient.post('/jornadas/finalizar', {
      jornada_id: jornadaId,
      conductor_id: conductorId,
      observaciones,
      hora_finalizacion: new Date().toISOString(),
    });

    return {
      success: true,
      data: response.data?.data ?? response.data,
    };
  } catch (error: any) {
    console.warn('⚠️ Error finalizando jornada, usando datos mock:', error);

    return {
      success: true,
      data: {
        ...MOCK_JORNADA_ACTUAL,
        estado: 'Finalizada',
        duracionTotal: 480,
        observaciones,
      },
    };
  }
};

export const createJornada = async (data: JornadaInput) => {
  try {
    return await iniciarJornada(data.conductor, data);
  } catch (error) {
    console.error('Error creando jornada:', error);
    return { success: false, error };
  }
};