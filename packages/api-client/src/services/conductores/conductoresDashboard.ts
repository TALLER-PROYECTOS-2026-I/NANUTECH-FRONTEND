import apiClient from '../../../index';

// Estados aceptados por el backend para filtrar el listado por contrato.
export type EstadoFiltroConductores = 'TODOS' | 'ACTIVOS' | 'INACTIVOS';

// Estados operacionales aceptados por el backend para filtrar disponibilidad.
export type DisponibilidadFiltroConductores =
  | 'TODOS'
  | 'DISPONIBLE'
  | 'EN_RUTA'
  | 'DESCANSANDO'
  | 'DE_PERMISO'
  | 'SIN_ASIGNAR';

// Parametros que la pantalla HU10 envia a /conductores/dashboard/listado.
export type FiltrosDashboardConductores = {
  busqueda?: string;
  estado?: EstadoFiltroConductores;
  disponibilidad?: DisponibilidadFiltroConductores;
  page?: number;
  limit?: number;
};

// Tipo flexible porque el backend puede agregar campos sin romper el frontend.
export type ConductorDashboardApi = Record<string, unknown>;

// Respuesta de /conductores/dashboard/resumen: KPIs y datos de graficas.
export type ResumenDashboardConductoresApi = {
  indicadores?: Record<string, unknown>;
  graficos?: Record<string, unknown>;
};

// Respuesta de /conductores/dashboard/listado: filas de tabla y paginacion.
export type ListadoDashboardConductoresApi = {
  conductores?: ConductorDashboardApi[];
  paginacion?: Record<string, unknown>;
  mensajeSinResultados?: string | null;
};

// Modelo agregado que consume la pantalla para no depender de dos llamadas separadas.
export type DashboardConductoresApi = {
  resumen?: Record<string, unknown>;
  indicadores?: Record<string, unknown>;
  graficas?: Record<string, unknown>;
  graficos?: Record<string, unknown>;
  conductores?: ConductorDashboardApi[];
  listado?: ConductorDashboardApi[];
  paginacion?: Record<string, unknown>;
  mensajeSinResultados?: string | null;
};

// Estructura comun que usa el backend: { success, message, data }.
type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
} & T;

const normalizeSearch = (value: unknown) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const conductorMatchesSearch = (
  conductor: ConductorDashboardApi,
  search?: string,
) => {
  const term = normalizeSearch(search);
  if (!term) return true;

  return [
    conductor.nombre,
    conductor.nombre_completo,
    conductor.name,
    conductor.email,
    conductor.correo,
    conductor.dni,
    conductor.documento,
    conductor.numero_documento,
    conductor.licencia,
    conductor.numero_licencia,
    conductor.contacto,
    conductor.telefono,
    conductor.celular,
  ].some((value) => normalizeSearch(value).includes(term));
};

// Traduce el nombre visual de la UI al valor crudo que filtra el repository.
const mapDisponibilidadToBackend = (
  disponibilidad?: DisponibilidadFiltroConductores,
) => {
  if (!disponibilidad || disponibilidad === 'TODOS') return undefined;
  if (disponibilidad === 'DESCANSANDO') return 'DESCANSO';
  return disponibilidad;
};

// Limpia filtros antes de enviarlos: no manda TODOS ni busquedas vacias.
const cleanFilters = (filters: FiltrosDashboardConductores = {}) => ({
  busqueda: filters.busqueda?.trim() || undefined,
  estado: filters.estado === 'TODOS' ? undefined : filters.estado,
  disponibilidad: mapDisponibilidadToBackend(filters.disponibilidad),
  page: filters.page ?? 1,
  limit: filters.limit ?? 20,
});

// Obtiene indicadores y graficas desde el endpoint real de resumen.
export const getResumenDashboardConductores =
  async (): Promise<ResumenDashboardConductoresApi> => {
    const response = await apiClient.get<ApiResponse<ResumenDashboardConductoresApi>>(
      '/conductores/dashboard/resumen',
    );

    return response.data.data ?? response.data;
  };

// Obtiene el listado paginado y filtrado desde el endpoint real de tabla.
export const getListadoDashboardConductores = async (
  filters: FiltrosDashboardConductores = {},
): Promise<ListadoDashboardConductoresApi> => {
  const response = await apiClient.get<ApiResponse<ListadoDashboardConductoresApi>>(
    '/conductores/dashboard/listado',
    { params: cleanFilters(filters) },
  );

  return response.data.data ?? response.data;
};

// Une resumen + listado en una sola funcion para simplificar la pagina HU10.
export const getDashboardConductores = async (
  filters: FiltrosDashboardConductores = {},
): Promise<DashboardConductoresApi> => {
  const listadoFilters = {
    ...filters,
    busqueda: undefined,
    limit: filters.busqueda?.trim() ? 1000 : filters.limit,
  };

  // Ejecuta ambas llamadas en paralelo porque resumen y listado son independientes.
  const [resumen, listado] = await Promise.all([
    getResumenDashboardConductores(),
    getListadoDashboardConductores(listadoFilters),
  ]);

  const conductores = (listado.conductores ?? []).filter((conductor) =>
    conductorMatchesSearch(conductor, filters.busqueda),
  );

  // Devuelve aliases camel-ish y legacy para que el normalizador soporte ambos contratos.
  return {
    resumen: resumen.indicadores,
    indicadores: resumen.indicadores,
    graficas: resumen.graficos,
    graficos: resumen.graficos,
    conductores,
    paginacion: listado.paginacion,
    mensajeSinResultados: conductores.length === 0 ? 'No se encontraron conductores' : null,
  };
};
