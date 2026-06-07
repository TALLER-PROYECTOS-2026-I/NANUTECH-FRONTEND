import apiClient from '../../../index';

// Roles visibles que usa la interfaz HU13 para pintar etiquetas y filtros.
export type AuditRole = 'Administrador' | 'Gerente' | 'Conductor' | 'Desconocido';

// Filtros soportados por el backend GET /auditoria/registros y /auditoria/exportar/csv.
export interface AuditoriaFiltros {
  search?: string;
  rol?: string;
}

// Registro normalizado para la tabla de Historial de Accesos.
export interface AuditLogItem {
  id: string;
  usuario: string;
  email: string;
  rol: AuditRole;
  fecha: string;
  hora: string;
  ip: string;
  navegador: string;
}

// Metricas consolidadas que retorna GET /auditoria/resumen.
export interface AuditoriaMetricas {
  total_accesos: number;
  accesos_hoy: number;
  accesos_semana: number;
  usuarios_unicos: number;
  ips_unicas: number;
}

// Contadores por rol enviados por el backend para las barras de progreso.
export interface AuditoriaProgresoRoles {
  ADMINISTRADOR: number;
  GERENTE: number;
  CHOFER: number;
  [key: string]: number;
}

// Respuesta normalizada del resumen de auditoria.
export interface AuditoriaResumen {
  metricas: AuditoriaMetricas;
  progreso_roles: AuditoriaProgresoRoles;
}

// Forma cruda del registro que entrega GET /auditoria/registros.
interface BackendAuditLogItem {
  id?: string;
  id_registro?: string;
  usuario?: string;
  email?: string;
  rol?: string;
  fecha?: string;
  hora?: string;
  ip?: string;
  direccion_ip?: string;
  navegador?: string;
}

// Respuesta estandar del API usada por los endpoints JSON de auditoria.
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Convierte el rol del backend al texto que solicita el diseno del frontend.
const normalizeRol = (rol?: string): AuditRole => {
  const value = (rol || '').trim().toUpperCase();

  if (['ADMIN', 'ADMINISTRADOR'].includes(value)) return 'Administrador';
  if (value === 'GERENTE') return 'Gerente';
  if (['CHOFER', 'CONDUCTOR'].includes(value)) return 'Conductor';

  return 'Desconocido';
};

// Convierte el filtro visible de rol al valor que espera el backend.
const toBackendRol = (rol?: string) => {
  if (!rol || rol === 'Todos') return undefined;
  if (rol === 'Administrador') return 'ADMINISTRADOR';
  if (rol === 'Gerente') return 'GERENTE';
  if (rol === 'Conductor') return 'CHOFER';

  return rol.toUpperCase();
};

// Limpia parametros vacios para no enviar filtros innecesarios al backend.
const buildParams = (filters: AuditoriaFiltros = {}) => ({
  ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
  ...(toBackendRol(filters.rol) ? { rol: toBackendRol(filters.rol) } : {}),
});

// Adapta el DTO del backend al contrato unico que usa la pagina HU13.
const normalizeAuditLog = (item: BackendAuditLogItem): AuditLogItem => ({
  id: item.id || item.id_registro || '',
  usuario: item.usuario || 'Usuario no identificado',
  email: item.email || 'Sin email',
  rol: normalizeRol(item.rol),
  fecha: item.fecha || '--/--/----',
  hora: item.hora || '--:--:--',
  ip: item.ip || item.direccion_ip || 'No disponible',
  navegador: item.navegador || 'No disponible',
});

// Obtiene las tarjetas y barras de progreso desde GET /auditoria/resumen.
export const getAuditoriaResumen = async (): Promise<AuditoriaResumen> => {
  const res = await apiClient.get<ApiResponse<AuditoriaResumen>>('/auditoria/resumen');
  return res.data.data;
};

// Obtiene el historial cronologico desde GET /auditoria/registros usando filtros del backend.
export const getAuditoriaAccesos = async (
  filters: AuditoriaFiltros = {},
): Promise<AuditLogItem[]> => {
  const res = await apiClient.get<ApiResponse<BackendAuditLogItem[]>>('/auditoria/registros', {
    params: buildParams(filters),
  });

  return (res.data.data || []).map(normalizeAuditLog);
};

// Descarga el CSV oficial generado por GET /auditoria/exportar/csv con los filtros activos.
export const exportAuditoriaAccesosCsv = async (
  filters: AuditoriaFiltros = {},
): Promise<Blob> => {
  const res = await apiClient.get<Blob>('/auditoria/exportar/csv', {
    params: buildParams(filters),
    responseType: 'blob',
  });

  return res.data;
};
