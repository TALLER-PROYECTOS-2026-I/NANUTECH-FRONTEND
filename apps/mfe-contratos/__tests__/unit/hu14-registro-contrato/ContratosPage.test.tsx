import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getContratos, getContratosVigentes, getIndicadoresContratos } from '@nanutech/api-client';
import ContratosPage from '../../../src/modules/registro-contrato/pages/ContratosPage';

vi.mock('@nanutech/api-client', () => ({
  getContratos: vi.fn(),
  getContratosVigentes: vi.fn(),
  getIndicadoresContratos: vi.fn(),
}));

const getContratosMock = vi.mocked(getContratos);
const getContratosVigentesMock = vi.mocked(getContratosVigentes);
const getIndicadoresContratosMock = vi.mocked(getIndicadoresContratos);

const mockIndicadores = {
  total_contratos: 1,
  contratos_activos: 1,
  contratos_vencidos: 0,
  proximos_a_vencer: 0,
  camiones_asignados: 0,
  distribucion_por_estado: [{ estado: 'VIGENTE', cantidad: 1 }],
  distribucion_por_tipo_servicio: [{ tipo_servicio: 'POR_KM' as const, cantidad: 1 }],
};

describe('ContratosPage - HU14', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getIndicadoresContratosMock.mockResolvedValue(mockIndicadores);
  });

  it('muestra el estado de carga mientras obtiene contratos', () => {
    getContratosMock.mockReturnValue(new Promise(() => undefined));

    render(<ContratosPage onNuevoContrato={vi.fn()} />);

    expect(screen.getByText(/Cargando contratos/i)).toBeTruthy();
    expect(getIndicadoresContratosMock).toHaveBeenCalledTimes(1);
  });

  it('muestra el estado vacio cuando no hay contratos registrados', async () => {
    getContratosMock.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 100, total_pages: 0 },
    });
    getIndicadoresContratosMock.mockResolvedValue({
      ...mockIndicadores,
      total_contratos: 0,
      contratos_activos: 0,
      distribucion_por_estado: [],
      distribucion_por_tipo_servicio: [],
    });

    render(<ContratosPage onNuevoContrato={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/No hay contratos registrados/i)).toBeTruthy();
    });
    expect(screen.getByText(/Registra un nuevo contrato comercial/i)).toBeTruthy();
  });

  it('renderiza la tabla con los contratos y calcula tarifa total referencial', async () => {
    getContratosMock.mockResolvedValue({
      data: [
        {
          id: '1',
          codigo: 'CON-001',
          cliente: 'Empresa Constructora ABC S.A.C.',
          ruc: '20123456789',
          tipo_servicio: 'POR_KM',
          fecha_inicio: '2026-06-01',
          fecha_fin: '2026-12-31',
          origen: 'Av. Lima 123',
          destino: 'Puerto del Callao',
          distancia_estimada_km: 25.5,
          tarifa_por_km: 3.2,
          tarifa_por_hora: 50,
          tarifa_espera: 12.5,
          estado: 'VIGENTE',
        },
      ],
      meta: { total: 1, page: 1, limit: 100, total_pages: 1 },
    });

    render(<ContratosPage onNuevoContrato={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('CON-001')).toBeTruthy();
    });
    expect(getContratosMock).toHaveBeenCalledWith({ limit: 100, order_by: 'fecha_fin' });
    expect(screen.getByText('Empresa Constructora ABC S.A.C.')).toBeTruthy();
    expect(screen.getAllByText('Por Kilómetro').length).toBeGreaterThan(0);
    expect(screen.getByText('S/ 81.60')).toBeTruthy();
    expect(screen.getByText('VIGENTE')).toBeTruthy();
    expect(screen.getByText(/Total Contratos/i)).toBeTruthy();
    expect(screen.getByText(/Activos \(1\)/i)).toBeTruthy();
  });

  it('usa la tarifa enviada por el api cuando existe', async () => {
    getContratosMock.mockResolvedValue({
      data: [
        {
          id: '2',
          cliente: 'Transportes Delta',
          ruc: '20987654321',
          tipo_servicio: 'POR_VIAJE',
          fecha_inicio: '2026-07-01',
          origen: 'Lima',
          destino: 'Ica',
          distancia_estimada_km: 100,
          tarifa_por_km: 2,
          tarifa_por_hora: 40,
          tarifa_espera: 10,
          tarifa: 350,
        },
      ],
      meta: { total: 1, page: 1, limit: 100, total_pages: 1 },
    });

    render(<ContratosPage onNuevoContrato={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('S/ 350.00')).toBeTruthy();
    });
    expect(screen.getByText('VIGENTE')).toBeTruthy();
  });

  it('filtra contratos por busqueda y estado', async () => {
    getIndicadoresContratosMock.mockResolvedValue({
      ...mockIndicadores,
      total_contratos: 2,
      contratos_activos: 1,
      contratos_vencidos: 1,
      distribucion_por_estado: [
        { estado: 'VIGENTE', cantidad: 1 },
        { estado: 'VENCIDO', cantidad: 1 },
      ],
    });
    getContratosMock.mockResolvedValue({
      data: [
        {
          id: '1',
          codigo: 'CON-001',
          cliente: 'Empresa Activa',
          ruc: '20123456789',
          tipo_servicio: 'POR_KM',
          fecha_inicio: '2026-06-01',
          fecha_fin: '2026-12-31',
          origen: 'Lima',
          destino: 'Callao',
          distancia_estimada_km: 10,
          tarifa_por_km: 2,
          tarifa_por_hora: 50,
          tarifa_espera: 12.5,
          estado: 'VIGENTE',
        },
        {
          id: '2',
          codigo: 'CON-002',
          cliente: 'Empresa Vencida',
          ruc: '20987654321',
          tipo_servicio: 'POR_HORA',
          fecha_inicio: '2025-01-01',
          fecha_fin: '2025-12-31',
          origen: 'Lima',
          destino: 'Ica',
          distancia_estimada_km: 100,
          tarifa_por_km: 1,
          tarifa_por_hora: 40,
          tarifa_espera: 10,
          estado: 'VENCIDO',
        },
      ],
      meta: { total: 2, page: 1, limit: 100, total_pages: 1 },
    });

    render(<ContratosPage onNuevoContrato={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('CON-001')).toBeTruthy();
      expect(screen.getByText('CON-002')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /Vencidos/i }));
    expect(screen.queryByText('CON-001')).toBeNull();
    expect(screen.getByText('CON-002')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText(/Buscar por código o cliente/i), {
      target: { value: 'activa' },
    });
    expect(screen.getByText(/No hay contratos registrados/i)).toBeTruthy();
  });

  it('usa contratos vigentes como respaldo si falla el listado principal', async () => {
    getContratosMock.mockRejectedValue(new Error('Error listado'));
    getIndicadoresContratosMock.mockRejectedValue(new Error('Error indicadores'));
    getContratosVigentesMock.mockResolvedValue([
      {
        id: '3',
        codigo: 'CON-FALLBACK',
        cliente: 'Cliente Respaldo',
        ruc: '20111111111',
        tipo_servicio: 'POR_VIAJE',
        fecha_inicio: '2026-01-01',
        fecha_fin: '2026-12-31',
        origen: 'Lima',
        destino: 'Cusco',
        distancia_estimada_km: 50,
        tarifa_por_km: 4,
        tarifa_por_hora: 20,
        tarifa_espera: 5,
        estado: 'VIGENTE',
      },
    ]);

    render(<ContratosPage onNuevoContrato={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('CON-FALLBACK')).toBeTruthy();
    });
    expect(screen.getByText('S/ 200.00')).toBeTruthy();
  });

  it('ejecuta onNuevoContrato al hacer click en Nuevo Contrato', () => {
    const onNuevoContrato = vi.fn();
    getContratosMock.mockReturnValue(new Promise(() => undefined));

    render(<ContratosPage onNuevoContrato={onNuevoContrato} />);

    fireEvent.click(screen.getByRole('button', { name: /Nuevo Contrato/i }));

    expect(onNuevoContrato).toHaveBeenCalledTimes(1);
  });

  it('muestra el estado vacio si falla la consulta de contratos', async () => {
    getContratosMock.mockRejectedValue(new Error('Error de red'));
    getContratosVigentesMock.mockRejectedValue(new Error('Error de red'));

    render(<ContratosPage onNuevoContrato={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/No hay contratos registrados/i)).toBeTruthy();
    });
  });
});
