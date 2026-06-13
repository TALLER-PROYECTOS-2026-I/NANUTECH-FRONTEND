import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import HistorialJornadasPage from '../../../src/modules/historial-jornadas/pages/HistorialJornadasPage';
import {
  exportHistorialJornadasCsv,
  getHistorialAlertaDetalle,
  getHistorialJornadas,
  getHistorialJornadasMetrics,
} from '@nanutech/api-client';

// Mockea el cliente compartido para validar HU17 sin depender de AWS/local backend.
vi.mock('@nanutech/api-client', () => ({
  getHistorialJornadas: vi.fn(),
  getHistorialJornadasMetrics: vi.fn(),
  getHistorialAlertaDetalle: vi.fn(),
  exportHistorialJornadasCsv: vi.fn(),
}));

const getHistorialMock = vi.mocked(getHistorialJornadas);
const getMetricsMock = vi.mocked(getHistorialJornadasMetrics);
const getAlertDetailMock = vi.mocked(getHistorialAlertaDetalle);
const exportCsvMock = vi.mocked(exportHistorialJornadasCsv);

const metrics = {
  total_jornadas: 46,
  alertas_panico: 6,
  auxilio_mecanico: 14,
  jornadas_observaciones: 31,
  km_promedio: 298,
};

const rows = [
  {
    id: 'jor-1',
    fecha: '2026-04-07',
    conductor: 'Carlos Rodriguez',
    camion: 'ABC-123 - Volvo FH16',
    contrato: 'CONT-2024-001',
    horario: '08:00 AM - 05:00 PM',
    duracion_total: '09:00',
    estado: 'COMPLETADA',
    observaciones: 'Cliente conforme con la entrega',
    tiene_observaciones: true,
    tipo_alerta: null,
    es_panico: false,
    es_auxilio: false,
    origen: 'Valparaiso Puerto',
    destino: 'Rancagua',
  },
  {
    id: 'jor-2',
    fecha: '2026-03-29',
    conductor: 'Juan Perez',
    camion: 'DEF-456 - Scania R',
    contrato: 'CONT-2024-002',
    horario: '11:19 AM - En curso',
    duracion_total: '-',
    estado: 'EN_PROCESO',
    observaciones: '',
    tiene_observaciones: false,
    tipo_alerta: 'PANICO',
    alerta_descripcion: 'Emergencia reportada',
    fecha_alerta: '2026-03-29T16:17:00.000Z',
    latitud: -4.7719,
    longitud: -79.8394,
    es_panico: true,
    es_auxilio: false,
  },
  {
    id: 'jor-3',
    fecha: '2026-03-28',
    conductor: 'Maria Garcia',
    camion: 'GHI-789 - Volvo FH',
    contrato: 'CONT-2024-003',
    horario: '09:35 AM - 11:15 AM',
    duracion_total: '01:40',
    estado: 'REGISTRADA',
    observaciones: '',
    tiene_observaciones: false,
    tipo_alerta: 'AUXILIO_MECANICO',
    alerta_descripcion: 'Sobrecalentamiento de motor',
    fecha_alerta: '2026-03-28T14:35:00.000Z',
    latitud: -11.9513,
    longitud: -77.0968,
    es_panico: false,
    es_auxilio: true,
  },
];

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:historial');
  global.URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
});

describe('HU17 - Historial de Jornadas Gerencial', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getHistorialMock.mockResolvedValue(rows);
    getMetricsMock.mockResolvedValue(metrics);
    getAlertDetailMock.mockResolvedValue({
      jornada_id: 'jor-2',
      conductor: 'Juan Perez',
      placa: 'DEF-456',
      fecha_jornada: '2026-03-29',
      origen: 'Arequipa - Parque Industrial',
      destino: 'Puno - Mercado Laykakota',
      tipo_alerta: 'PANICO',
      detalle: 'ALERTA DE PANICO - Prioridad Critica',
      fecha_hora: '2026-03-29T16:17:00.000Z',
      latitud: -4.7719,
      longitud: -79.8394,
      estado: 'ACTIVA',
    });
    exportCsvMock.mockResolvedValue(new Blob(['csv']));
  });

  it('muestra tarjetas de resumen y registro detallado al cargar', async () => {
    render(<HistorialJornadasPage />);

    expect(await screen.findByText('Historial de Jornadas')).toBeTruthy();
    expect(screen.getByText('46')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByText('14')).toBeTruthy();
    expect(screen.getByText('31')).toBeTruthy();
    expect(screen.getByText('298')).toBeTruthy();
    expect(screen.getAllByText('Carlos Rodriguez').length).toBeGreaterThan(0);
    expect(screen.getByText('ABC-123')).toBeTruthy();
  });

  it('envia filtros al backend y filtra por conductor en tiempo real', async () => {
    render(<HistorialJornadasPage />);

    expect((await screen.findAllByText('Carlos Rodriguez')).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText(/Conductor, placa/i), {
      target: { value: 'ABC' },
    });

    await waitFor(() => {
      expect(getHistorialMock).toHaveBeenLastCalledWith({
        q: 'ABC',
        estado_alerta: '',
        fecha_desde: '',
        fecha_hasta: '',
        observaciones: '',
      });
    });

    fireEvent.change(screen.getByLabelText(/Nombre de Chofer/i), {
      target: { value: 'Juan Perez' },
    });

    const table = screen.getByRole('table');
    expect(within(table).getByText('Juan Perez')).toBeTruthy();
    expect(within(table).queryByText('Carlos Rodriguez')).toBeNull();
  });

  it('abre modal de observaciones con informacion de solo lectura', async () => {
    render(<HistorialJornadasPage />);

    expect((await screen.findAllByText('Carlos Rodriguez')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Ver observaciones/i }));

    expect(await screen.findByText('Observaciones del Conductor')).toBeTruthy();
    expect(screen.getByText('Cliente conforme con la entrega')).toBeTruthy();
    expect(screen.getByText('Valparaiso Puerto')).toBeTruthy();
    expect(screen.getByText('Rancagua')).toBeTruthy();
  });

  it('abre detalle de alerta de panico con prioridad critica y ubicacion', async () => {
    render(<HistorialJornadasPage />);

    expect((await screen.findAllByText('Juan Perez')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Ver alerta panico/i }));

    expect(await screen.findByText('Detalle de Alertas de Emergencia')).toBeTruthy();
    expect(screen.getByText('ALERTA DE PANICO')).toBeTruthy();
    expect(await screen.findByText(/Prioridad Critica/i)).toBeTruthy();
    expect(getAlertDetailMock).toHaveBeenCalledWith('jor-2');
  });

  it('abre detalle de auxilio mecanico con descripcion y resolucion', async () => {
    getAlertDetailMock.mockResolvedValueOnce({
      jornada_id: 'jor-3',
      conductor: 'Maria Garcia',
      placa: 'GHI-789',
      fecha_jornada: '2026-03-28',
      origen: 'Lima - Independencia',
      destino: 'Huancayo - Chilca',
      tipo_alerta: 'AUXILIO_MECANICO',
      detalle: 'Asistencia tecnica requerida',
      fecha_hora: '2026-03-28T09:35:00.000Z',
      atendida_at: '2026-03-28T11:15:00.000Z',
      detalle_resolucion: 'Cambio de neumatico',
      latitud: -11.9513,
      longitud: -77.0968,
      estado: 'RESUELTA',
    });

    render(<HistorialJornadasPage />);

    expect((await screen.findAllByText('Maria Garcia')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Ver alerta auxilio/i }));

    expect(await screen.findByText('AUXILIO MECANICO')).toBeTruthy();
    expect(await screen.findByText('Cambio de neumatico')).toBeTruthy();
    expect(await screen.findByText('Resuelta')).toBeTruthy();
  });

  it('exporta CSV con los filtros activos', async () => {
    render(<HistorialJornadasPage />);

    expect((await screen.findAllByText('Carlos Rodriguez')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Exportar CSV/i }));

    await waitFor(() => {
      expect(exportCsvMock).toHaveBeenCalledWith({
        q: '',
        estado_alerta: '',
        fecha_desde: '',
        fecha_hasta: '',
        observaciones: '',
      });
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    });
  });
});
