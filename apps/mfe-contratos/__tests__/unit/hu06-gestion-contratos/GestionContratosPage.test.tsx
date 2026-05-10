import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getContratos, getContratosVigentes, getIndicadoresContratos } from '@nanutech/api-client';
import type { Contrato } from '@nanutech/api-client';
import { GestionContratosPage } from '../../../src/modules/gestion-contratos';

vi.mock('@nanutech/api-client', () => ({
  getContratos: vi.fn(),
  getContratosVigentes: vi.fn(),
  getIndicadoresContratos: vi.fn(),
}));

const getContratosMock = vi.mocked(getContratos);
const getContratosVigentesMock = vi.mocked(getContratosVigentes);
const getIndicadoresContratosMock = vi.mocked(getIndicadoresContratos);

const mockIndicadores = {
  total_contratos: 2,
  contratos_activos: 1,
  contratos_vencidos: 1,
  proximos_a_vencer: 0,
  camiones_asignados: 3,
  distribucion_por_estado: [
    { estado: 'VIGENTE', cantidad: 1 },
    { estado: 'VENCIDO', cantidad: 1 },
  ],
  distribucion_por_tipo_servicio: [
    { tipo_servicio: 'POR_KM' as const, cantidad: 1 },
    { tipo_servicio: 'POR_HORA' as const, cantidad: 1 },
  ],
};

const contratoBase: Contrato = {
  id: 'base',
  cliente: 'Cliente Base',
  ruc: '20123456789',
  tipo_servicio: 'POR_KM',
  fecha_inicio: '2026-06-01',
  fecha_fin: '2026-12-31',
  origen: 'Lima',
  destino: 'Callao',
  distancia_estimada_km: 25.5,
  tarifa_por_km: 3.2,
  tarifa_por_hora: 50,
  tarifa_espera: 12.5,
  moneda: 'PEN',
};

const buildContrato = (overrides: Partial<Contrato> & { id: string; cliente: string }): Contrato => ({
  ...contratoBase,
  ...overrides,
});

const renderConContratos = async (contratos = [
  buildContrato({
    id: '1',
    codigo: 'CON-001',
    cliente: 'Empresa Activa',
    estado: 'VIGENTE',
    camiones_asignados: 2,
  }),
  buildContrato({
    id: '2',
    codigo: 'CON-002',
    cliente: 'Empresa Vencida',
    estado: 'VENCIDO',
    fecha_fin: '2025-12-31',
    tipo_servicio: 'POR_HORA',
    tarifa: 350,
    camiones_asignados: 1,
  }),
]) => {
  getContratosMock.mockResolvedValue({
    data: contratos,
    meta: { total: contratos.length, page: 1, limit: 10, total_pages: Math.ceil(contratos.length / 10) },
  });

  render(<GestionContratosPage onNuevoContrato={vi.fn()} />);

  await waitFor(() => {
    expect(screen.getByText('Listado de Contratos')).toBeTruthy();
  });
};

describe('GestionContratosPage - HU06', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getIndicadoresContratosMock.mockResolvedValue(mockIndicadores);
    getContratosVigentesMock.mockResolvedValue([]);
  });

  it('muestra el estado de carga mientras obtiene contratos', () => {
    getContratosMock.mockReturnValue(new Promise(() => undefined));

    render(<GestionContratosPage onNuevoContrato={vi.fn()} />);

    expect(screen.getByText(/Cargando contratos/i)).toBeTruthy();
    expect(getIndicadoresContratosMock).toHaveBeenCalledTimes(1);
  });

  it('muestra las tarjetas informativas y graficas del panel', async () => {
    await renderConContratos();

    expect(screen.getByText(/Total Contratos/i)).toBeTruthy();
    expect(screen.getByText(/Contratos Activos/i)).toBeTruthy();
    expect(screen.getByText(/Contratos Vencidos/i)).toBeTruthy();
    expect(screen.getByText(/Camiones Asignados/i)).toBeTruthy();
    expect(screen.getByText(/Distribucion por Estado/i)).toBeTruthy();
    expect(screen.getByText(/Tipo de Servicio/i)).toBeTruthy();
    expect(screen.getByText(/Activo: 50%/i)).toBeTruthy();
    expect(screen.getAllByText(/Por Kilometro/i).length).toBeGreaterThan(0);
  });

  it('renderiza la tabla con columnas requeridas y carga paginada de 10 en 10', async () => {
    await renderConContratos();

    expect(getContratosMock).toHaveBeenCalledWith({ page: 1, limit: 10, order_by: 'fecha_fin' });

    ['Codigo', 'Cliente', 'Tipo Servicio', 'Tarifa', 'Fecha Inicio', 'Camiones', 'Estado', 'Acciones'].forEach(
      (column) => {
        expect(screen.getAllByText(column).length).toBeGreaterThan(0);
      }
    );
    expect(screen.getByRole('button', { name: /Fecha Fin/i })).toBeTruthy();

    expect(screen.getByText('CON-001')).toBeTruthy();
    expect(screen.getByText('CON-002')).toBeTruthy();
    expect(screen.getByText('PEN. 81.60')).toBeTruthy();
    expect(screen.getByText('PEN. 350')).toBeTruthy();
  });

  it('filtra contratos por codigo o cliente en tiempo real', async () => {
    await renderConContratos();

    fireEvent.change(screen.getByPlaceholderText(/Buscar por codigo o cliente/i), {
      target: { value: 'vencida' },
    });

    expect(screen.queryByText('CON-001')).toBeNull();
    expect(screen.getByText('CON-002')).toBeTruthy();
  });

  it('filtra por estado usando colores diferenciados', async () => {
    await renderConContratos();

    fireEvent.click(screen.getByRole('button', { name: /Vencidos/i }));

    expect(screen.queryByText('CON-001')).toBeNull();
    expect(screen.getByText('CON-002')).toBeTruthy();
    expect(screen.getByText('Vencido').className).toContain('bg-red-500');
  });

  it('permite ordenar por fecha de vencimiento para priorizar renovaciones', async () => {
    await renderConContratos([
      buildContrato({ id: '1', codigo: 'CON-001', cliente: 'Contrato Lejano', fecha_fin: '2026-12-31', estado: 'VIGENTE' }),
      buildContrato({ id: '2', codigo: 'CON-002', cliente: 'Contrato Proximo', fecha_fin: '2026-01-31', estado: 'VIGENTE' }),
    ]);

    const firstRowBefore = screen.getAllByRole('row')[1];
    expect(within(firstRowBefore).getByText('CON-002')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Fecha Fin/i }));

    const firstRowAfter = screen.getAllByRole('row')[1];
    expect(within(firstRowAfter).getByText('CON-001')).toBeTruthy();
  });

  it('pagina la tabla cuando existen mas de 10 contratos', async () => {
    const contratos = Array.from({ length: 11 }, (_, index) =>
      buildContrato({
        id: `id-${index + 1}`,
        codigo: `CON-${String(index + 1).padStart(3, '0')}`,
        cliente: `Cliente ${index + 1}`,
        fecha_fin: `2026-12-${String(index + 1).padStart(2, '0')}`,
        estado: 'VIGENTE',
      })
    );

    await renderConContratos(contratos);

    expect(screen.getByText(/Mostrando 10 de 11 contratos/i)).toBeTruthy();
    expect(screen.queryByText('CON-011')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(screen.getByText('CON-011')).toBeTruthy();
  });

  it('muestra la vista expandida al hacer click en Ver', async () => {
    getContratosMock.mockResolvedValue({
      data: [
        buildContrato({
          id: '1',
          codigo: 'CON-001',
          cliente: 'Empresa Activa',
          estado: 'VIGENTE',
        }),
      ],
      meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
    });

    render(<GestionContratosPage onNuevoContrato={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('CON-001')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /Ver/i }));

    expect(screen.getByText(/Vista expandida del contrato/i)).toBeTruthy();
    expect(screen.getByText(/Lima -> Callao/i)).toBeTruthy();
  });

  it('notifica el id del contrato cuando existe navegacion al detalle real', async () => {
    const onVerContrato = vi.fn();
    getContratosMock.mockResolvedValue({
      data: [
        buildContrato({
          id: '1',
          codigo: 'CON-001',
          cliente: 'Empresa Activa',
          estado: 'VIGENTE',
        }),
      ],
      meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
    });

    render(<GestionContratosPage onNuevoContrato={vi.fn()} onVerContrato={onVerContrato} />);

    await waitFor(() => {
      expect(screen.getByText('CON-001')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /Ver/i }));

    expect(onVerContrato).toHaveBeenCalledWith('1');
    expect(screen.queryByText(/Vista expandida del contrato/i)).toBeNull();
  });

  it('ejecuta onNuevoContrato al hacer click en Nuevo Contrato', () => {
    const onNuevoContrato = vi.fn();
    getContratosMock.mockReturnValue(new Promise(() => undefined));

    render(<GestionContratosPage onNuevoContrato={onNuevoContrato} />);

    fireEvent.click(screen.getByRole('button', { name: /Nuevo Contrato/i }));

    expect(onNuevoContrato).toHaveBeenCalledTimes(1);
  });

  it('usa datos mock si falla la consulta principal y el respaldo', async () => {
    getContratosMock.mockRejectedValue(new Error('Error listado'));
    getContratosVigentesMock.mockRejectedValue(new Error('Error respaldo'));

    render(<GestionContratosPage onNuevoContrato={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('CONT-2024-001')).toBeTruthy();
    });
    expect(screen.getByText(/Mostrando 10 de 11 contratos/i)).toBeTruthy();
  });
});
