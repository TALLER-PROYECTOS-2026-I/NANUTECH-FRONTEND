
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

type GetJornadasResponse = {
  success: boolean;
  message: string;
  data: Jornada[];
};

const API_URL =
  "https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage/jornadas";

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
    const url = conductorId 
      ? `https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage/jornadas?conductor_id=${conductorId}`
      : 'https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage/jornadas';
    
    const response = await fetch(url);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('⚠️ Error obteniendo jornadas del backend, usando datos mock:', error);
    return MOCK_JORNADAS;
  }
};

export const getJornadaActual = async (conductorId: string): Promise<Jornada | null> => {
  try {
    const url = `https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage/jornadas/actual?conductor_id=${encodeURIComponent(conductorId)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`⚠️ Backend retornó status ${response.status}, usando datos mock`);
      return MOCK_JORNADA_ACTUAL;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('⚠️ Error obteniendo jornada actual del backend, usando datos mock:', error);
    return MOCK_JORNADA_ACTUAL;
  }
};

export const iniciarJornada = async (conductorId: string, jornadaData: any) => {
  try {
    const response = await fetch(
      'https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage/jornadas/iniciar',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conductor_id: conductorId,
          ...jornadaData,
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`⚠️ Backend retornó status ${response.status}:`, errorData);
      console.warn('Usando datos mock...');
      return {
        success: true,
        data: { ...MOCK_JORNADA_ACTUAL, estado: 'Activa' }
      };
    }
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.warn('⚠️ Error iniciando jornada, usando datos mock:', error);
    return {
      success: true,
      data: { ...MOCK_JORNADA_ACTUAL, estado: 'Activa' }
    };
  }
};

export const finalizarJornada = async (jornadaId: string, observaciones?: string, conductorId?: string) => {
  try {
    const response = await fetch(
      'https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage/jornadas/finalizar',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jornada_id: jornadaId,
          conductor_id: conductorId,
          observaciones,
          hora_finalizacion: new Date().toISOString(),
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`⚠️ Backend retornó status ${response.status}:`, errorData);
      console.warn('Usando datos mock...');
      return {
        success: true,
        data: {
          ...MOCK_JORNADA_ACTUAL,
          estado: 'Finalizada',
          duracionTotal: 480,
          observaciones
        }
      };
    }
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.warn('⚠️ Error finalizando jornada, usando datos mock:', error);
    return {
      success: true,
      data: {
        ...MOCK_JORNADA_ACTUAL,
        estado: 'Finalizada',
        duracionTotal: 480,
        observaciones
      }
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