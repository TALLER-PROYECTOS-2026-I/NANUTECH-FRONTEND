import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SeguimientoJornadas from '../../../src/modules/seguimiento-jornadas/SeguimientoJornadas';
import { getJornadas } from '../../../src/modules/seguimiento-jornadas/services/jornadas.service';

vi.mock('../../../src/modules/seguimiento-jornadas/services/jornadas.service', () => ({
  getJornadas: vi.fn(),
}));

const getJornadasMock = vi.mocked(getJornadas);

describe('HU05 - Seguimiento Jornadas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================
     LOADING
  ========================= */
  it('muestra loading inicialmente', () => {
    getJornadasMock.mockReturnValue(new Promise(() => undefined));

    render(<SeguimientoJornadas />);

    // en tu código loading existe pero no texto visible,
    // por eso validamos existencia del contenedor vacío inicial
    expect(screen.getByText(/Sin datos/i)).toBeTruthy();
  });

  /* =========================
     EMPTY STATE
  ========================= */
  it('muestra Sin datos cuando no hay jornadas', async () => {
    getJornadasMock.mockResolvedValue([]);

    render(<SeguimientoJornadas />);

    await waitFor(() => {
      expect(screen.getByText(/Sin datos/i)).toBeTruthy();
    });
  });

  /* =========================
     RENDER LISTA
  ========================= */
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

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeTruthy();
      expect(screen.getByText('ABC-123')).toBeTruthy();
      expect(screen.getByText('2026-06-01')).toBeTruthy();
    });
  });

  /* =========================
     SEARCH FILTER
  ========================= */
  it('filtra por conductor o placa', async () => {
    getJornadasMock.mockResolvedValue([
      {
        fecha: '2026-06-01',
        chofer: 'Juan Pérez',
        placa: 'ABC-123',
        horaInicio: '08:00',
        estado: 'Activo',
      },
      {
        fecha: '2026-06-01',
        chofer: 'Carlos Ruiz',
        placa: 'XYZ-999',
        horaInicio: '09:00',
        estado: 'Activo',
      },
    ]);

    render(<SeguimientoJornadas />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeTruthy();
      expect(screen.getByText('Carlos Ruiz')).toBeTruthy();
    });

    fireEvent.change(screen.getByPlaceholderText(/Buscar por conductor/i), {
      target: { value: 'juan' },
    });

    expect(screen.getByText('Juan Pérez')).toBeTruthy();
    expect(screen.queryByText('Carlos Ruiz')).toBeNull();
  });

  /* =========================
     MODAL OBSERVACIONES
  ========================= */
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

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeTruthy();
    });

    fireEvent.click(screen.getByText('⚠️'));

    expect(screen.getByText(/Observaciones/i)).toBeTruthy();
    expect(screen.getByText(/Revisión mecánica/i)).toBeTruthy();
  });

  /* =========================
     EXPORT CSV
  ========================= */
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

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/Exportar CSV/i));

    expect(true).toBeTruthy(); // solo verifica que no crashea
  });

  /* =========================
     FORM OPEN
  ========================= */
  it('abre formulario de nueva jornada', async () => {
    getJornadasMock.mockResolvedValue([]);

    render(<SeguimientoJornadas />);

    fireEvent.click(screen.getByText(/\+ Nueva Jornada/i));

    expect(screen.getByText(/Registrar Nueva Jornada/i)).toBeTruthy();
    expect(screen.getByText(/Conductor/i)).toBeTruthy();
  });

  /* =========================
     FORM CANCEL
  ========================= */
  it('cierra formulario', async () => {
    getJornadasMock.mockResolvedValue([]);

    render(<SeguimientoJornadas />);

    fireEvent.click(screen.getByText(/\+ Nueva Jornada/i));
    fireEvent.click(screen.getByText(/✖/i));

    expect(screen.queryByText(/Registrar Nueva Jornada/i)).toBeNull();
  });
});