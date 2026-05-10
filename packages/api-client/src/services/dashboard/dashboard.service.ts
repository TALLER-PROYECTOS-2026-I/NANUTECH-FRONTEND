import apiClient from '../../../index';

export type KPIData = {
  totalCamiones: number;
  contratosActivos: number;
  alertasActivas: number;
  ingresos: number;
};

export type AlertaItem = {
  id: string;
  tipo: string;
  estado: string;
  severidad: string;
};

export type Alertas = {
  alertasActivas: AlertaItem[];
  contratosPorExpirar: unknown[];
};

export type GraficaItem = {
  tipo_evento?: string;
  total?: number;
  estado?: string;
  total_estados?: number;
};

export type TopCamion = {
  unidad: string;
  km: number;
};

export type DashboardContrato = {
  id: string;
  cliente: string;
  tarifa: number;
  fecha_fin: string;
};

export type DashboardPayload = {
  kpis: KPIData;
  alertas: Alertas;
  graficas: {
    gps?: GraficaItem[];
    camiones?: GraficaItem[];
  };
  topCamiones?: TopCamion[];
  contratos?: DashboardContrato[];
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const getDashboard = async (): Promise<DashboardPayload> => {
  try {
    const res = await apiClient.get<ApiResponse<DashboardPayload>>('/dashboard');
    return res.data.data;
  } catch (error) {
    console.error('Error API dashboard:', error);
    throw new Error('Error al obtener datos del dashboard');
  }
};

// --- Dashboard Gerencial ---

export type DashboardGerencialParams = {
  tiempo: string;
};

export type ResumenGeneral = {
  jornadas: number;
  jornadas_completadas: number;
  horas_acumuladas: string;
  km_totales: number;
  eficiencia: string;
  flota_activa: number;
  conductores_activos: number;
  contratos_activos: number;
  ingresos_estimados: number;
};

export type JornadaPorDia = {
  fecha_jornada: string;
  total: string;
  km: string;
};

export type SectorJornada = {
  estado: string;
  total: string;
};

export type SectorCamion = {
  estado: string;
  total: string;
};

export type SectorConductor = {
  estado: string;
  total: string;
};

export type GraficasGerencial = {
  jornadas_por_dia: JornadaPorDia[];
  sectores_jornadas: SectorJornada[];
  sectores_camiones: SectorCamion[];
  sectores_conductores: SectorConductor[];
};

export type OperacionEnProgreso = {
  id: string;
  conductor: string;
  camion: string;
  hora_inicio: string | null;
};

export type CamionMantenimiento = {
  placa: string;
  marca: string;
  modelo: string;
};

export type ConductorDisponible = {
  nombre: string;
};

export type Operaciones = {
  en_progreso: OperacionEnProgreso[];
  camiones_mantenimiento: CamionMantenimiento[];
  conductores_disponibles: ConductorDisponible[];
};

export type TopConductorKm = {
  conductor: string;
  km_totales: string;
};

export type TopCamionUso = {
  placa: string;
  usos: string;
  km_totales: string;
};

export type Rendimiento = {
  top_conductores_km: TopConductorKm[];
  top_camiones_uso: TopCamionUso[];
};

export type HistorialItem = {
  id: string;
  conductor: string;
  camion: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  km_recorridos: string;
  horas_duracion: string;
  estado: string;
};

export type DashboardGerencialPayload = {
  ultimo_actualizacion: string;
  estado_sistema: string;
  resumen_general: ResumenGeneral;
  graficas: GraficasGerencial;
  operaciones: Operaciones;
  rendimiento: Rendimiento;
  historial: HistorialItem[];
};

export const getDashboardGerencial = async (
  params: DashboardGerencialParams = { tiempo: 'todas' }
): Promise<DashboardGerencialPayload> => {
  try {
    const res = await apiClient.get<ApiResponse<DashboardGerencialPayload>>('/dashboard/gerencial', {
      params,
    });
    return res.data.data;
  } catch (error) {
    console.error('Error API dashboard gerencial:', error);
    throw new Error('Error al obtener datos del dashboard gerencial');
  }
};

export default getDashboard;
