import apiClient from '../../../index';

export interface AuditLogItem {
  id: string;
  usuario: string;
  email: string;
  rol: 'Administrador' | 'Gerente' | 'Conductor';
  fecha: string;      // Formato DD/MM/YYYY
  hora: string;       // Formato HH:MM:SS (24 horas)
  ip: string;
  navegador: string;  // Navegador - Sistema Operativo
}

export const getAuditoriaAccesos = async (): Promise<AuditLogItem[]> => {
  try {
    const res = await apiClient.get<{ success: boolean; data: AuditLogItem[] }>('/dashboard/auditoria');
    return res.data.data;
  } catch (error) {
    console.error('Error al consultar auditoria en API:', error);
    throw new Error('Error al conectar con la API de auditoría');
  }
};
