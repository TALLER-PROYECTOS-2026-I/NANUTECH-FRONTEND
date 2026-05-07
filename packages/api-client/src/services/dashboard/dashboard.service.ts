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

export default getDashboard;
