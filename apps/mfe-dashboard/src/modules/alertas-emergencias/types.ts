// Tipos de incidentes que se muestran en el panel HU19.
export type TipoIncidente = 'PANICO' | 'AUXILIO_MECANICO' | 'OBSERVACION';

// Estados visibles y accionables dentro del panel.
export type EstadoIncidente = 'ACTIVA' | 'EN_PROCESO' | 'RESUELTA';

// Severidad usada para estilos y priorizacion visual.
export type SeveridadIncidente = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';

// Datos del conductor asociados a cada incidente.
export type ConductorIncidente = {
  id: string;
  nombre: string;
  telefono: string;
  dni: string;
};

// Datos opcionales de la unidad; pánico puede no tener unidad asignada.
export type UnidadIncidente = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
} | null;

// Modelo normalizado que consume la UI.
export type Incidente = {
  id: string;
  codigo: string;
  tipo: TipoIncidente;
  estado: EstadoIncidente;
  severidad: SeveridadIncidente;
  detalle: string;
  tipoFallaMecanica: string | null;
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
  fechaHora: string;
  bloqueoSosActivo: boolean;
  conductor: ConductorIncidente;
  unidad: UnidadIncidente;
  jornadaId: string | null;
  detalleResolucion?: string | null;
  servicioTecnicoRealizado?: string | null;
};

// Contadores usados por las tarjetas superiores y el banner critico.
export type IndicadoresHu19 = {
  panicoActivas: number;
  auxilioPendientes: number;
  totalResueltas: number;
  tienePanicoActivo: boolean;
};

// Estado del toast superior de exito.
export type ToastHu19 = {
  title: string;
  message: string;
};
