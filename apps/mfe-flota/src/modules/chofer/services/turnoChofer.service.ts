import { getJornadaActual, iniciarJornada, finalizarJornada } from '@nanutech/api-client';
import {
  TurnoChofer,
  FinalizarTurnoRequest,
  FinalizarTurnoResponse,
  RespuestaServidor,
} from '../types/turnoChofer.types';

// Conductor ID para las llamadas a API (esto debería venir del contexto de autenticación)
const CONDUCTOR_ID = 'CONDUCTOR-001';

/**
 * Servicio de Turno del Chofer
 * Maneja toda la lógica de comunicación con el servidor para turnos
 * Utiliza el api-client compartido del monorepo
 */
export const turnoChoferService = {
  /**
   * Obtiene el turno actual del chofer desde el servidor real
   */
  async obtenerTurnoActual(): Promise<RespuestaServidor<TurnoChofer>> {
    try {
      const jornada = await getJornadaActual(CONDUCTOR_ID);

      if (!jornada) {
        return {
          success: true,
          data: undefined,
          mensaje: 'No hay turno activo',
        };
      }

      // Mapear datos del backend al formato de TurnoChofer
      const turno: TurnoChofer = {
        id: jornada.id,
        datosJornada: {
          id: jornada.id,
          nombreConductor: jornada.conductor,
          placa: jornada.camion,
          idContrato: jornada.contrato,
          ruta: {
            origen: 'Punto de origen',
            destino: 'Punto de destino',
          },
          fecha: jornada.fecha,
        },
        estado: jornada.estado === 'Activa' ? 'EN_PROGRESO' : 'PENDIENTE',
        horaInicio: jornada.horario.split(' - ')[0],
        tiempoTranscurrido: 0,
      };

      return {
        success: true,
        data: turno,
        mensaje: 'Turno obtenido exitosamente',
      };
    } catch (error) {
      console.error('Error al obtener turno actual:', error);
      return {
        success: false,
        error: 'Error al obtener el turno actual',
      };
    }
  },

  /**
   * Obtiene la hora actual del servidor
   * IMPORTANTE: Usar esta hora para sincronización, no la hora local del dispositivo
   */
  async obtenerHoraServidor(): Promise<string> {
    try {
      // En producción, obtener hora del servidor
      // Por ahora retornamos la hora actual como ISO
      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  },

  /**
   * Inicia un nuevo turno para el chofer
   * Llama a la API real del backend
   */
  async iniciarTurno(): Promise<RespuestaServidor<TurnoChofer>> {
    try {
      const horaServidor = new Date().toISOString();

      // Llamar a la API para iniciar la jornada
      const resultado = await iniciarJornada(CONDUCTOR_ID, {
        horaInicio: horaServidor,
        estado: 'Activa',
      });

      if (!resultado.success) {
        return {
          success: false,
          error: 'Error al iniciar el turno en el servidor',
        };
      }

      // Mapear respuesta del servidor
      const jornada = resultado.data;
      const turno: TurnoChofer = {
        id: jornada.id,
        datosJornada: {
          id: jornada.id,
          nombreConductor: jornada.conductor,
          placa: jornada.camion,
          idContrato: jornada.contrato,
          ruta: {
            origen: 'Punto de origen',
            destino: 'Punto de destino',
          },
          fecha: jornada.fecha,
        },
        estado: 'EN_PROGRESO',
        horaInicio: horaServidor,
        tiempoTranscurrido: 0,
      };

      return {
        success: true,
        data: turno,
        mensaje: '¡Turno iniciado exitosamente!',
      };
    } catch (error) {
      console.error('Error al iniciar turno:', error);
      return {
        success: false,
        error: 'Error al iniciar el turno',
      };
    }
  },

  /**
   * Finaliza el turno actual del chofer
   * Llama a la API real del backend
   */
  async finalizarTurno(request: FinalizarTurnoRequest): Promise<RespuestaServidor<FinalizarTurnoResponse>> {
    try {
      // Llamar a la API para finalizar la jornada
      const resultado = await finalizarJornada(request.idTurno, request.observaciones, CONDUCTOR_ID);

      if (!resultado.success) {
        return {
          success: false,
          error: 'Error al finalizar el turno en el servidor',
        };
      }

      const jornada = resultado.data;
      const horaFinalizacion = new Date().toISOString();

      return {
        success: true,
        data: {
          idTurno: request.idTurno,
          estado: 'FINALIZADO',
          horaFinalizacion,
          duracionTotal: jornada.duracion || 0,
        },
        mensaje: '¡Turno finalizado exitosamente!',
      };
    } catch (error) {
      console.error('Error al finalizar turno:', error);
      return {
        success: false,
        error: 'Error al finalizar el turno',
      };
    }
  },

  /**
   * Calcula el tiempo transcurrido entre la hora de inicio y la hora actual del servidor
   * IMPORTANTE: No usar Date.now() - usar siempre timestamps del servidor
   *
   * @param horaInicio - ISO timestamp del servidor cuando inició el turno
   * @param horaActual - ISO timestamp actual del servidor
   * @returns Duración en segundos
   */
  calcularTiempoTranscurrido(horaInicio: string, horaActual: string): number {
    try {
      const inicio = new Date(horaInicio);
      const actual = new Date(horaActual);
      const diferencia = Math.floor((actual.getTime() - inicio.getTime()) / 1000);
      return Math.max(0, diferencia);
    } catch (error) {
      console.error('Error al calcular tiempo transcurrido:', error);
      return 0;
    }
  },

  /**
   * Convierte segundos a formato HH:MM:SS
   * Soporta duraciones mayores a 24 horas
   *
   * @param segundos - Total de segundos
   * @returns String en formato HH:MM:SS
   */
  formatearTiempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    const formatoHora = horas.toString().padStart(2, '0');
    const formatoMinuto = minutos.toString().padStart(2, '0');
    const formatoSegundo = segs.toString().padStart(2, '0');

    return `${formatoHora}:${formatoMinuto}:${formatoSegundo}`;
  },
};

