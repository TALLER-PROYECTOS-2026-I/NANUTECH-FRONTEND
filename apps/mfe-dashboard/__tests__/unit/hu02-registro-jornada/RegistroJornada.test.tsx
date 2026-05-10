import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createJornada,
  getCamiones,
  getConductores,
  getContratosVigentes,
  getJornadas,
} from '@nanutech/api-client';

import RegistroJornada from '../../../src/modules/registro-jornada/pages/RegistroJornada';
import RegistroNuevaJornada from '../../../src/modules/registro-jornada/pages/RegistroNuevaJornada';

vi.mock('@nanutech/api-client', () => ({
  createJornada: vi.fn(),
  getCamiones: vi.fn(),
  getConductores: vi.fn(),
  getContratosVigentes: vi.fn(),
  getJornadas: vi.fn(),
}));

const createJornadaMock = vi.mocked(createJornada);
const getCamionesMock = vi.mocked(getCamiones);
const getConductoresMock = vi.mocked(getConductores);
const getContratosVigentesMock = vi.mocked(getContratosVigentes);
const getJornadasMock = vi.mocked(getJornadas);

type RouterEntry = string | { pathname: string; state?: unknown };

const renderWithRouter = (
  ui: ReactNode,
  initialEntries: RouterEntry[] = ['/registro-jornada']
) => render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);

const mockCatalogos = () => {
  getConductoresMock.mockResolvedValue([
    {
      id: 'cond-1',
      nombres: 'Carlos',
      apellidos: 'Ramirez',
      correo: 'carlos@nanutech.com',
      estado: 'ACTIVO',
      activo: true,
    },
    {
      id: 'cond-2',
      nombres: 'Ana',
      apellidos: 'Inactiva',
      correo: 'ana@nanutech.com',
      estado: 'INACTIVO',
      activo: false,
    },
  ] as any);

  getCamionesMock.mockResolvedValue([
    { id: 'cam-1', placa: 'ABC-123', marca: 'Volvo', modelo: 'FH' },
    { id: 'cam-2', placa: 'XYZ-999', marca: 'Scania', modelo: 'R' },
  ] as any);

  getContratosVigentesMock.mockResolvedValue([
    { id: 'cont-1', codigo: 'CONT-001', estado: 'VIGENTE', activo: true },
    { id: 'cont-2', codigo: 'CONT-002', estado: 'VENCIDO', activo: false },
  ] as any);

  getJornadasMock.mockResolvedValue([
    { camion: 'XYZ-999 - Scania R', estado: 'REGISTRADA' },
  ] as any);
};

describe('HU02 - Registro de Jornada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('nanutech_user', JSON.stringify({ id: 'admin-1' }));
    mockCatalogos();
    createJornadaMock.mockResolvedValue({ success: true, data: {} });
  });

  it('carga catalogos activos y bloquea unidades ya registradas', async () => {
    const { container } = renderWithRouter(<RegistroJornada />);

    await screen.findByText('Carlos Ramirez');

    expect(screen.queryByText('Ana Inactiva')).toBeNull();
    expect(screen.getByText('ABC-123 - Volvo FH')).toBeTruthy();
    expect(screen.queryByText('XYZ-999 - Scania R')).toBeNull();
    expect(screen.getByText('CONT-001')).toBeTruthy();
    expect(screen.queryByText('CONT-002')).toBeNull();
    expect(container).toBeTruthy();
  });

  it('muestra validacion si se intenta registrar sin datos obligatorios', async () => {
    renderWithRouter(<RegistroJornada />);

    await screen.findByText('Carlos Ramirez');
    fireEvent.click(screen.getByRole('button', { name: /Registrar Jornada/i }));

    expect(screen.getAllByText(/Complete todos los campos obligatorios/i).length).toBeGreaterThan(0);
    expect(createJornadaMock).not.toHaveBeenCalled();
  });

  it('crea una jornada con el payload esperado', async () => {
    const { container } = renderWithRouter(<RegistroJornada />);

    await screen.findByText('Carlos Ramirez');

    fireEvent.change(container.querySelector('select[name="conductor"]')!, {
      target: { value: 'cond-1' },
    });
    fireEvent.change(container.querySelector('select[name="camion"]')!, {
      target: { value: 'cam-1' },
    });
    fireEvent.change(container.querySelector('select[name="contrato"]')!, {
      target: { value: 'cont-1' },
    });
    fireEvent.change(container.querySelector('input[name="fecha"]')!, {
      target: { value: '2026-05-09' },
    });
    fireEvent.change(container.querySelector('input[name="horaInicio"]')!, {
      target: { value: '08:00' },
    });
    fireEvent.change(container.querySelector('input[name="horaFin"]')!, {
      target: { value: '10:30' },
    });
    fireEvent.change(container.querySelector('input[name="km"]')!, {
      target: { value: '125.5' },
    });
    fireEvent.change(container.querySelector('input[name="origen"]')!, {
      target: { value: 'Lima' },
    });
    fireEvent.change(container.querySelector('input[name="destino"]')!, {
      target: { value: 'Callao' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Registrar Jornada/i }));

    await waitFor(() => {
      expect(createJornadaMock).toHaveBeenCalledWith({
        conductor_id: 'cond-1',
        unidad_id: 'cam-1',
        contrato_id: 'cont-1',
        creado_por: 'admin-1',
        fecha: '2026-05-09',
        hora_inicio: '08:00',
        hora_fin: '10:30',
        km_recorridos: 125.5,
        origen: 'Lima',
        destino: 'Callao',
        observaciones: '',
      });
    });
  });

  it('renderiza jornadas registradas y aplica filtros', async () => {
    getJornadasMock.mockResolvedValue([
      {
        id: 'JOR-001',
        fecha: '2026-05-09',
        conductor: 'Carlos Ramirez',
        camion: 'ABC-123',
        contrato: 'CONT-001',
        horario: '08:00 - 10:30',
        km: 125,
        estado: 'Activa',
        observaciones: 'Revisar llantas',
      },
      {
        id: 'JOR-002',
        fecha: '2026-05-08',
        conductor: 'Maria Lopez',
        camion: 'DEF-456',
        contrato: 'CONT-002',
        horario: '09:00 - 11:00',
        km: 80,
        estado: 'Completada',
      },
    ] as any);

    renderWithRouter(<RegistroNuevaJornada />, ['/registro-jornada/nueva']);

    expect(await screen.findByText('JOR-001')).toBeTruthy();
    expect(screen.getByText('JOR-002')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('205')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText(/Buscar por conductor/i), {
      target: { value: 'maria' },
    });

    expect(screen.queryByText('JOR-001')).toBeNull();
    expect(screen.getByText('JOR-002')).toBeTruthy();
  });

  it('muestra mensaje de exito recibido por navegacion', async () => {
    getJornadasMock.mockResolvedValue([]);

    renderWithRouter(<RegistroNuevaJornada />, [
      {
        pathname: '/registro-jornada/nueva',
        state: { successMessage: 'Jornada registrada correctamente' },
      },
    ]);

    expect(await screen.findByText('Jornada registrada correctamente')).toBeTruthy();
  });
});
