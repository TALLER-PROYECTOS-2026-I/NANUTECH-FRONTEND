import {
  getJornadaActual,
  iniciarJornada,
  finalizarJornada,
  getConductores,
  getCamiones,
  getContratosVigentes,
  type Conductor,
  type Camion,
  type Contrato,
} from '@nanutech/api-client';
import {
  TurnoChofer,
  FinalizarTurnoRequest,
  FinalizarTurnoResponse,
  RespuestaServidor,
} from '../types/turnoChofer.types';

type JornadaActualBackend = {
  id: string;
  conductor_id: string;
  unidad_id: string;
  contrato_id: string;
  creado_por?: string;
  fecha?: string;
  fecha_jornada?: string;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  origen?: string;
  destino?: string;
  km_recorridos?: string | number;
  observaciones?: string | null;
  estado?: string;
  created_at?: string;
  updated_at?: string;
  duracion_total_segundos?: number | null;
};

const obtenerUsuarioId = (): string | null => {
  try {
    const userRaw = localStorage.getItem('nanutech_user');
    if (!userRaw) return null;

    const user = JSON.parse(userRaw);
    return user?.id || null;
  } catch {
    return null;
  }
};

const mapearEstadoChofer = (estado?: string): TurnoChofer['estado'] => {
  const estadoNormalizado = (estado || '').toUpperCase();

  switch (estadoNormalizado) {
    case 'EN_PROCESO':
    case 'ACTIVA':
      return 'EN_PROGRESO';

    case 'COMPLETADA':
    case 'FINALIZADA':
      return 'FINALIZADO';

    case 'REGISTRADA':
    case 'PENDIENTE':
    default:
      return 'PENDIENTE';
  }
};

const construirNombreConductor = (conductor?: Conductor): string => {
  if (!conductor) return 'Sin conductor';
  const nombre = `${conductor.nombres || ''} ${conductor.apellidos || ''}`.trim();
  return nombre || conductor.correo || conductor.id;
};

const construirDescripcionUnidad = (camion?: Camion): string => {
  if (!camion) return 'Sin placa';
  return camion.placa || camion.id;
};

const construirCodigoContrato = (contrato?: Contrato): string => {
  if (!contrato) return 'Sin contrato';
  return contrato.codigo || contrato.id;
};

const mapearJornadaATurnoChofer = (
  jornada: JornadaActualBackend,
  conductores: Conductor[],
  camiones: Camion[],
  contratos: Contrato[]
): TurnoChofer => {
  const conductor = conductores.find((c) => c.id === jornada.conductor_id);
  const camion = camiones.find((c) => c.id === jornada.unidad_id);
  const contrato = contratos.find((c) => c.id === jornada.contrato_id);

  return {
    id: jornada.id,
    datosJornada: {
      id: jornada.id,
      nombreConductor: construirNombreConductor(conductor),
      placa: construirDescripcionUnidad(camion),
      idContrato: construirCodigoContrato(contrato),
      ruta: {
        origen: jornada.origen ?? 'Punto de origen',
        destino: jornada.destino ?? 'Punto de destino',
      },
      fecha: jornada.fecha || jornada.fecha_jornada || '',
    },
    estado: mapearEstadoChofer(jornada.estado),
    horaInicio: jornada.hora_inicio || undefined,
    tiempoTranscurrido: 0,
  };
};

export const turnoChoferService = {
  async obtenerTurnoActual(): Promise<RespuestaServidor<TurnoChofer>> {
    try {
      const conductorId = obtenerUsuarioId();

      if (!conductorId) {
        return {
          success: false,
          error: 'No se pudo identificar al conductor autenticado',
        };
      }

      const jornada = await getJornadaActual(conductorId);

      if (!jornada) {
        return {
          success: true,
          data: undefined,
          mensaje: 'No hay turno activo',
        };
      }

      const [conductores, camiones, contratos] = await Promise.all([
        getConductores(),
        getCamiones(),
        getContratosVigentes(),
      ]);

      const turno = mapearJornadaATurnoChofer(
        jornada as JornadaActualBackend,
        conductores || [],
        camiones || [],
        contratos || []
      );

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

  async obtenerHoraServidor(): Promise<string> {
    try {
      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  },

  async iniciarTurno(): Promise<RespuestaServidor<TurnoChofer>> {
    try {
      const conductorId = obtenerUsuarioId();

      if (!conductorId) {
        return {
          success: false,
          error: 'No se pudo identificar al conductor autenticado',
        };
      }

      const jornadaActual = await getJornadaActual(conductorId);

      if (!jornadaActual?.id) {
        return {
          success: false,
          error: 'No hay una jornada registrada para iniciar',
        };
      }

      const resultado = await iniciarJornada(jornadaActual.id, conductorId);
      const jornada = (resultado?.data ?? resultado) as JornadaActualBackend;

      if (!jornada) {
        return {
          success: false,
          error: 'Error al iniciar el turno en el servidor',
        };
      }

      const [conductores, camiones, contratos] = await Promise.all([
        getConductores(),
        getCamiones(),
        getContratosVigentes(),
      ]);

      const turno = mapearJornadaATurnoChofer(
        jornada,
        conductores || [],
        camiones || [],
        contratos || []
      );

      return {
        success: true,
        data: {
          ...turno,
          estado: 'EN_PROGRESO',
          horaInicio: jornada.hora_inicio || new Date().toISOString(),
        },
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

  async finalizarTurno(
    request: FinalizarTurnoRequest
  ): Promise<RespuestaServidor<FinalizarTurnoResponse>> {
    try {
      const conductorId = obtenerUsuarioId();

      if (!conductorId) {
        return {
          success: false,
          error: 'No se pudo identificar al conductor autenticado',
        };
      }

      const resultado = await finalizarJornada(
        request.idTurno,
        request.observaciones,
        conductorId
      );

      const jornada = resultado?.data ?? resultado;
      const horaFinalizacion = new Date().toISOString();

      return {
        success: true,
        data: {
          idTurno: request.idTurno,
          estado: 'FINALIZADO',
          horaFinalizacion,
          duracionTotal:
            jornada?.duracion_total_segundos ||
            jornada?.duracionTotal ||
            jornada?.duracion ||
            0,
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