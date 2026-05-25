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
  estado: 'Completada' | 'Activa';
  fecha: string;
  camion: string;
  contrato: string;
  duracion: number;
  duracionLabel?: string;
  observaciones?: string;
};

export type FiltroJornada = 'TODAS' | 'COMPLETADAS' | 'ACTIVAS';
