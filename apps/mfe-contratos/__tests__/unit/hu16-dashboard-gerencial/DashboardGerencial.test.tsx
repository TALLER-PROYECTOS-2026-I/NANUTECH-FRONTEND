import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDashboardGerencial } from '@nanutech/api-client';
import DashboardGerencial from '../../../src/modules/dashboard-gerencial/pages/DashboardGerencial';

vi.mock('@nanutech/api-client', () => ({
  getDashboardGerencial: vi.fn(),
}));

const dashboardPayload = {
  ultimo_actualizacion: '2026-06-10T14:35:00.000Z',
  estado_sistema: 'Operativo',
  resumen_general: {
    jornadas: 10,
    jornadas_completadas: 7,
    horas_acumuladas: '82.5',
    km_totales: 15420,
    eficiencia: '91%',
    flota_activa: 5,
    conductores_activos: 4,
    contratos_activos: 3,
    ingresos_estimados: 12500,
  },
  graficas: {
    jornadas_por_dia: [{ fecha_jornada: '2026-06-10', total: '3', km: '580' }],
    sectores_jornadas: [
      { estado: 'COMPLETADA', total: '7' },
      { estado: 'EN_PROCESO', total: '3' },
    ],
    sectores_camiones: [
      { estado: 'EN_RUTA', total: '2' },
      { estado: 'DISPONIBLE', total: '3' },
    ],
    sectores_conductores: [
      { estado: 'ACTIVO', total: '2' },
      { estado: 'DESCANSO', total: '2' },
    ],
  },
  operaciones: {
    en_progreso: [{ id: 'jor-1', conductor: 'Luis Ramirez', camion: 'DEF-456', hora_inicio: '2026-06-10T09:00:00.000Z' }],
    camiones_mantenimiento: [{ placa: 'ABC-123', marca: 'Volvo', modelo: 'FH16' }],
    conductores_disponibles: [{ nombre: 'Carlos Mendoza' }],
  },
  rendimiento: {
    top_conductores_km: [{ conductor: 'Luis Ramirez', km_totales: '3400' }],
    top_camiones_uso: [{ placa: 'DEF-456', usos: '8', km_totales: '6200' }],
  },
  historial: [
    {
      id: 'hist-1',
      conductor: 'Luis Ramirez',
      camion: 'DEF-456',
      hora_inicio: '2026-06-10T09:00:00.000Z',
      hora_fin: null,
      km_recorridos: '580',
      horas_duracion: '6',
      estado: 'EN_PROCESO',
    },
  ],
};

describe('DashboardGerencial - HU16', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardGerencial).mockResolvedValue(dashboardPayload);
  });

  it('consume GET /dashboard/gerencial y muestra los indicadores enviados por backend', async () => {
    render(<DashboardGerencial />);

    expect(await screen.findByText('Dashboard de Gerencia')).toBeTruthy();
    expect(screen.getByText('Operativo')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('91%')).toBeTruthy();
    expect(screen.getByText(/12,500 USD/i)).toBeTruthy();
    expect(getDashboardGerencial).toHaveBeenCalledWith({ tiempo: 'todas' });
  });

  it('consulta nuevamente el backend cuando cambia el filtro de tiempo', async () => {
    render(<DashboardGerencial />);

    await screen.findByText('Dashboard de Gerencia');
    fireEvent.click(screen.getByRole('button', { name: 'Semana' }));

    await waitFor(() => {
      expect(getDashboardGerencial).toHaveBeenLastCalledWith({ tiempo: 'semana' });
    });
  });

  it('envia search al backend cuando se usa la barra de busqueda global', async () => {
    render(<DashboardGerencial />);

    await screen.findByText('Dashboard de Gerencia');
    fireEvent.change(screen.getByPlaceholderText(/Buscar por ID, conductor o camión/i), {
      target: { value: 'DEF-456' },
    });

    await waitFor(() => {
      expect(getDashboardGerencial).toHaveBeenLastCalledWith({ tiempo: 'todas', search: 'DEF-456' });
    });
  });

  it('no muestra datos referenciales cuando falla el endpoint gerencial', async () => {
    vi.mocked(getDashboardGerencial).mockRejectedValue(new Error('API no disponible'));

    render(<DashboardGerencial />);

    expect(await screen.findByText(/No se pudo cargar el dashboard gerencial/i)).toBeTruthy();
    expect(screen.getByText(/no mostrará datos referenciales/i)).toBeTruthy();
    expect(screen.queryByText('Datos referenciales')).toBeNull();
  });
});
