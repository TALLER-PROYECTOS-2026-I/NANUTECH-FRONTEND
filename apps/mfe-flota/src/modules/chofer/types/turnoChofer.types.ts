export type TurnoChoferState =
  | 'PENDIENTE'
  | 'EN_PROGRESO'
  | 'FINALIZADO'
  | 'SIN_JORNADA';

export interface TurnoChofer {
  id?: string;
  driverName: string;
  origin: string;
  destination: string;
  startTime: string;
  serverTime: string;
  state: TurnoChoferState;
}

export interface CreateTurnoChofer extends Omit<TurnoChofer, 'id' | 'state'> {
  state?: TurnoChoferState;
}

export interface UpdateTurnoChofer {
  driverName?: string;
  origin?: string;
  destination?: string;
  startTime?: string;
  serverTime?: string;
  state?: TurnoChoferState;
}

