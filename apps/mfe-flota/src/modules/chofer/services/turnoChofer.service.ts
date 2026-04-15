import { TurnoChofer } from '../types/turnoChofer.types';

const API_BASE_URL =
  'https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage';

export const turnoChoferService = {
  // ✅ Obtener jornada actual
  async getCurrentShift(conductorId: number): Promise<TurnoChofer | null> {
    const response = await fetch(
      `${API_BASE_URL}/jornadas/actual/${conductorId}`
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  },

  // ✅ Iniciar jornada
  async startShift(): Promise<TurnoChofer> {
    const response = await fetch(
      `${API_BASE_URL}/jornadas/iniciar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Error al iniciar la jornada');
    }

    return response.json();
  },

  // ✅ Finalizar jornada
  async endShift(): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/jornadas/finalizar`,
      {
        method: 'POST'
      }
    );

    if (!response.ok) {
      throw new Error('Error al finalizar la jornada');
    }
  }
};

