import apiClient from '../../../index';

// Tipo permitido por backend para clasificar una alerta.
export type TipoAlertaApi = 'PANICO' | 'AUXILIO_MECANICO' | 'OBSERVACION';

// Estado operativo permitido para los incidentes del panel.
export type EstadoAlertaApi = 'ACTIVA' | 'EN_PROCESO' | 'RESUELTA';

// Severidad enviada por backend para priorizar la atencion.
export type SeveridadAlertaApi = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';

// Filtros opcionales soportados por GET /alertas/activas.
export type FiltrosAlertasActivas = {
  tipo?: TipoAlertaApi;
  estado?: Extract<EstadoAlertaApi, 'ACTIVA' | 'EN_PROCESO'>;
};

// Contadores agregados usados por las tarjetas de resumen.
export type IndicadoresAlertas = {
  panico_activas: number;
  auxilio_pendientes: number;
  total_resueltas: number;
  tiene_panico_activo: boolean;
};

// Datos minimos del conductor asociado a la alerta.
export type ConductorAlertaApi = {
  id: string;
  nombre_completo: string;
  telefono: string;
  dni: string;
};

// Datos de la unidad asociada; puede venir null cuando no hay unidad asignada.
export type UnidadAlertaApi = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
} | null;

// Forma principal de una alerta devuelta por el backend.
export type AlertaApi = {
  id: string;
  codigo: string;
  tipo: TipoAlertaApi;
  estado: EstadoAlertaApi;
  severidad: SeveridadAlertaApi;
  detalle: string;
  tipo_falla_mecanica: string | null;
  latitud: number | null;
  longitud: number | null;
  direccion: string | null;
  fecha_hora: string;
  bloqueo_sos_activo: boolean;
  conductor: ConductorAlertaApi;
  unidad: UnidadAlertaApi;
  jornada_id: string | null;
  atendida?: boolean;
  detalle_resolucion?: string | null;
  servicio_tecnico_realizado?: string | null;
};

// Payload opcional para documentar como se resolvio el incidente.
export type ResolverAlertaPayload = {
  detalle_resolucion?: string;
  servicio_tecnico_realizado?: string;
};

// Payload requerido para mover un auxilio a EN_PROCESO o RESUELTA.
export type ActualizarEstadoAuxilioPayload = {
  estado: Extract<EstadoAlertaApi, 'EN_PROCESO' | 'RESUELTA'>;
};

// Envoltura comun que usa el backend en sus respuestas.
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// Obtiene los contadores para las tarjetas y el control del banner critico.
export const getIndicadoresAlertas = async (): Promise<IndicadoresAlertas> => {
  const response = await apiClient.get<ApiResponse<IndicadoresAlertas>>(
    '/alertas/indicadores',
  );

  return response.data.data;
};

// Obtiene las alertas activas o en proceso; acepta filtros opcionales.
export const getAlertasActivas = async (
  filters: FiltrosAlertasActivas = {},
): Promise<AlertaApi[]> => {
  const response = await apiClient.get<ApiResponse<AlertaApi[]>>(
    '/alertas/activas',
    { params: filters },
  );

  return response.data.data;
};

// Marca cualquier alerta como resuelta usando el endpoint general.
export const resolverAlerta = async (
  id: string,
  payload: ResolverAlertaPayload = {},
): Promise<AlertaApi> => {
  const response = await apiClient.patch<ApiResponse<AlertaApi>>(
    `/alertas/${id}/resolver`,
    payload,
  );

  return response.data.data;
};

// Cambia el estado de un auxilio mecanico a EN_PROCESO o RESUELTA.
export const actualizarEstadoAuxilio = async (
  id: string,
  payload: ActualizarEstadoAuxilioPayload,
): Promise<AlertaApi> => {
  const response = await apiClient.patch<ApiResponse<AlertaApi>>(
    `/alertas/${id}/estado`,
    payload,
  );

  return response.data.data;
};
