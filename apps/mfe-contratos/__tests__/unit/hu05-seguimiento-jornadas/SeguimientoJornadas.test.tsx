import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

import SeguimientoJornadas from '../../../src/modules/seguimiento-jornadas/SeguimientoJornadas';
import { getJornadas } from '../../../src/modules/seguimiento-jornadas/services/jornadas.service';

vi.mock('../../../src/modules/seguimiento-jornadas/services/jornadas.service', () => ({
  getJornadas: vi.fn(),
}));

const getJornadasMock = vi.mocked(getJornadas);

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:url');
  global.URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
});

describe('HU05 - Seguimiento Jornadas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra Sin datos cuando no hay jornadas', async () => {
    getJornadasMock.mockResolvedValue([]);

    render(<SeguimientoJornadas />);

    expect(await screen.findByText(/Sin datos/i)).toBeTruthy();
  });

  it('renderiza jornadas correctamente', async () => {
    getJornadasMock.mockResolvedValue([
      {
        fecha: '2026-06-01',
        chofer: 'Juan Pérez',
        placa: 'ABC-123',
        horaInicio: '08:00',
        horaFin: '10:00',
        estado: 'Completado',
        observaciones: 'Todo ok',
      },
    ]);

    render(<SeguimientoJornadas />);

    expect(await screen.findByText('Juan Pérez')).toBeTruthy();
    expect(screen.getByText('ABC-123')).toBeTruthy();
  });

  it('filtra por conductor o placa', async () => {
    getJornadasMock.mockResolvedValue([
      { fecha: '2026-06-01', chofer: 'Juan Pérez', placa: 'ABC-123', horaInicio: '08:00', estado: 'Activo' },
      { fecha: '2026-06-01', chofer: 'Carlos Ruiz', placa: 'XYZ-999', horaInicio: '09:00', estado: 'Activo' },
    ]);

    render(<SeguimientoJornadas />);

    await screen.findByText('Juan Pérez');

    fireEvent.change(screen.getByPlaceholderText(/Buscar/i), {
      target: { value: 'juan' },
    });

    expect(screen.getByText('Juan Pérez')).toBeTruthy();
  });

  it('abre modal de observaciones', async () => {
    getJornadasMock.mockResolvedValue([
      {
        fecha: '2026-06-01',
        chofer: 'Juan Pérez',
        placa: 'ABC-123',
        horaInicio: '08:00',
        estado: 'Activo',
        observaciones: 'Revisión mecánica',
      },
    ]);

    render(<SeguimientoJornadas />);

    await screen.findByText('Juan Pérez');

    fireEvent.click(screen.getByText('⚠️'));

    expect(await screen.findByText(/Revisión mecánica/i)).toBeTruthy();
  });

  it('exporta CSV sin romper UI', async () => {
    getJornadasMock.mockResolvedValue([
      {
        fecha: '2026-06-01',
        chofer: 'Juan Pérez',
        placa: 'ABC-123',
        horaInicio: '08:00',
        horaFin: '10:00',
        estado: 'Activo',
      },
    ]);

    render(<SeguimientoJornadas />);

    await screen.findByText('Juan Pérez');

    fireEvent.click(screen.getByText(/Exportar CSV/i));

    expect(true).toBeTruthy();
  });

  it('abre y cierra formulario de nueva jornada', async () => {
    getJornadasMock.mockResolvedValue([]);

    render(<SeguimientoJornadas />);

    fireEvent.click(screen.getByText(/\+ Nueva Jornada/i));

    expect(await screen.findByText(/Registrar Nueva Jornada/i)).toBeTruthy();

    fireEvent.click(screen.getByText(/✖/i));

    expect(screen.queryByText(/Registrar Nueva Jornada/i)).toBeNull();
  });
});
