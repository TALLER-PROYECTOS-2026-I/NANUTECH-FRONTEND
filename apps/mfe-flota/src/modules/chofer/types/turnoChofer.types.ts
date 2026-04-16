export type TurnoChoferState =
  | 'PENDIENTE'
  | 'EN_PROGRESO'
  | 'FINALIZADO'
  | 'SIN_JORNADA';

export interface DatosJornada {
  id: string;
  nombreConductor: string;
  placa: string;
  idContrato: string;
  ruta: {
    origen: string;
    destino: string;
  };
  fecha: string;
}

export interface TurnoChofer {
  id: string;
  datosJornada: DatosJornada;
  estado: TurnoChoferState;
  horaInicio?: string; // ISO timestamp del servidor
  horaFinalizacion?: string; // ISO timestamp del servidor
  observaciones?: string;
  duracionTotal?: number; // en segundos
  tiempoTranscurrido?: number; // en segundos (calculado en tiempo real)
}

export interface CrearTurnoRequest {
  idJornada: string;
}

export interface FinalizarTurnoRequest {
  idTurno: string;
  observaciones?: string;
}

export interface FinalizarTurnoResponse {
  idTurno: string;
  estado: 'FINALIZADO';
  horaFinalizacion: string;
  duracionTotal: number; // en segundos
}

export interface RespuestaServidor<T> {
  success: boolean;
  data?: T;
  mensaje?: string;
  error?: string;
}

export interface ReglaGeneralNanuTech {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  color: string;
}

