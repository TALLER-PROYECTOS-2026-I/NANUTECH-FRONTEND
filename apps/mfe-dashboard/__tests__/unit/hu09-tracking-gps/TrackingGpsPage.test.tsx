import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  exportTrackingGpsCsv,
  getTrackingGpsRegistros,
  getTrackingGpsSummary,
} from '@nanutech/api-client';
import TrackingGpsPage from '../../../src/modules/tracking-gps';

vi.mock('@nanutech/api-client', () => ({
  getTrackingGpsSummary: vi.fn(),
  getTrackingGpsRegistros: vi.fn(),
  exportTrackingGpsCsv: vi.fn(),
}));

const summaryMock = {
  total_registros: 2,
  unidades_movimiento: 1,
  unidades_detenidas: 1,
  excesos_velocidad: 0,
};

const registrosMock = [
  {
    id: 'gps-1',
    placa: 'DEF-456',
    proveedor: 'GPSCONTROL',
    fecha_hora: '2026-04-26T04:30:00.000Z',
    latitud: '-12.04',
    longitud: '-77.03',
    velocidad_kmh: '95',
    rumbo: 180,
    distancia_total: '25710',
    estado: 'EXCESO_VELOCIDAD',
    created_at: '2026-05-28T09:18:10.000Z',
    exceso_velocidad: true,
  },
  {
    id: 'gps-2',
    placa: 'DEF-456',
    proveedor: 'GPSCONTROL',
    fecha_hora: '2026-04-26T05:00:00.000Z',
    latitud: '-12.05',
    longitud: '-77.04',
    velocidad_kmh: 62,
    rumbo: 120,
    distancia_total: 18410.6,
    estado: 'MOVIENDO',
    created_at: '2026-04-26T05:00:05.000Z',
    exceso_velocidad: false,
  },
  {
    id: 'gps-3',
    placa: 'ABC-123',
    proveedor: 'GLOBALGPS',
    fecha_hora: '2026-04-24T13:20:00.000Z',
    latitud: '-12.06',
    longitud: '-77.05',
    velocidad_kmh: 0,
    rumbo: 0,
    distancia_total: 25430.5,
    estado: 'DETENIDO',
    created_at: '2026-04-24T13:20:05.000Z',
    exceso_velocidad: false,
  },
] as const;

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/dashboard/admin/tracking-gps']}>
      <TrackingGpsPage />
    </MemoryRouter>,
  );
}

describe('HU09 - Tracking GPS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    Object.defineProperty(window.URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:tracking'),
      writable: true,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      value: vi.fn(),
      writable: true,
    });

    vi.mocked(getTrackingGpsSummary).mockResolvedValue(summaryMock);
    vi.mocked(getTrackingGpsRegistros).mockResolvedValue([...registrosMock]);
    vi.mocked(exportTrackingGpsCsv).mockResolvedValue({
      csv: 'placa,fecha_hora\nABC-123,28/05/2026 09:18:00',
      filename: 'reporte_tracking_30052026.csv',
    });
  });

  it('muestra el resumen backend y solo el ultimo registro por placa en la tabla', async () => {
    renderPage();

    expect(await screen.findByText('Tracking GPS en Tiempo Real')).toBeInTheDocument();
    expect(screen.getByText('Total Registros')).toBeInTheDocument();
    expect(screen.getByText('Unidades en Movimiento')).toBeInTheDocument();
    expect(screen.getByText('Unidades Detenidas')).toBeInTheDocument();
    expect(screen.getByText('Excesos de Velocidad')).toBeInTheDocument();

    const totalCard = screen.getByText('Total Registros').closest('article');
    const movementCard = screen.getByText('Unidades en Movimiento').closest('article');
    const stoppedCard = screen.getByText('Unidades Detenidas').closest('article');
    const excessCard = screen.getByText('Excesos de Velocidad').closest('article');

    expect(within(totalCard as HTMLElement).getByText('2')).toBeInTheDocument();
    expect(within(movementCard as HTMLElement).getByText('1')).toBeInTheDocument();
    expect(within(stoppedCard as HTMLElement).getByText('1')).toBeInTheDocument();
    expect(within(excessCard as HTMLElement).getByText('0')).toBeInTheDocument();

    const rows = await screen.findAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(within(rows[1]).getByText(/DEF-456/)).toBeInTheDocument();
    expect(screen.queryByText(/95 km\/h/)).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByRole('row')[1]).toHaveTextContent('62 km/h');
    });
    expect(screen.getByText('GPSControl.pe')).toBeInTheDocument();
    expect(screen.getByText('0 excesos de velocidad')).toBeInTheDocument();
  });

  it('envia placa y rango horario al backend y aplica estado sobre el registro actual', async () => {
    renderPage();

    await screen.findByText(/ABC-123/);

    fireEvent.change(screen.getByPlaceholderText('Ej: ABC-123'), {
      target: { value: 'ABC' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'EXCESO_VELOCIDAD' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar Filtros' }));

    await waitFor(() => {
      expect(getTrackingGpsRegistros).toHaveBeenLastCalledWith({
        placa: 'ABC',
        horaInicio: undefined,
        horaFin: undefined,
      });
    });
  });

  it('recalcula las tarjetas con los registros filtrados que devuelve backend', async () => {
    renderPage();

    await screen.findByText(/ABC-123/);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'EXCESO_VELOCIDAD' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar Filtros' }));

    const totalCard = screen.getByText('Total Registros').closest('article');
    const excessCard = screen.getByText('Excesos de Velocidad').closest('article');

    await waitFor(() => {
      expect(within(totalCard as HTMLElement).getByText('0')).toBeInTheDocument();
      expect(within(excessCard as HTMLElement).getByText('0')).toBeInTheDocument();
    });
    expect(screen.queryByText(/95 km\/h/)).not.toBeInTheDocument();
  });

  it('filtra unidades en movimiento usando el estado enviado al backend', async () => {
    renderPage();

    await screen.findByText(/ABC-123/);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'MOVIENDO' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar Filtros' }));

    await waitFor(() => {
      expect(getTrackingGpsRegistros).toHaveBeenLastCalledWith({
        placa: undefined,
        horaInicio: undefined,
        horaFin: undefined,
      });
    });
    await waitFor(() => {
      expect(screen.getByText(/62 km\/h/)).toBeInTheDocument();
    });
  });

  it('filtra unidades detenidas usando el estado enviado al backend', async () => {
    renderPage();

    await screen.findByText(/ABC-123/);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'DETENIDO' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar Filtros' }));

    await waitFor(() => {
      expect(getTrackingGpsRegistros).toHaveBeenLastCalledWith({
        placa: undefined,
        horaInicio: undefined,
        horaFin: undefined,
      });
    });
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(within(rows[1]).getByText(/ABC-123/)).toBeInTheDocument();
      expect(within(rows[1]).getByText(/0 km\/h/)).toBeInTheDocument();
    });
  });

  it('limpia resumen y muestra mensaje cuando no hay datos', async () => {
    vi.mocked(getTrackingGpsRegistros).mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText((text) => text.includes('No se encontraron eventos'))).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4);
  });

  it('exporta csv usando el nombre enviado por el backend', async () => {
    renderPage();

    await screen.findByText(/ABC-123/);
    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    await waitFor(() => {
      expect(exportTrackingGpsCsv).toHaveBeenCalledWith({});
    });
    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });
});
