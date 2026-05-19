export type EstadisticasConductor = {
  totalJornadas: number;
  jornadasCompletadas: number;
  jornadasActivas: number;
  horasTotalesTrabajadas: number;
  promedioHorasPorJornada: number;
  estadoActual: string;
};

export type JornadaHistorial = {
  id: string;
  estado: string;
  fecha: string;
  camion: string;
  contrato: string;
  duracion: number;
  observaciones?: string;
};

export type FiltroJornada = 'TODAS' | 'COMPLETADAS' | 'ACTIVAS';
