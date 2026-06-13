import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

import SeguimientoJornadas from '../../../src/modules/seguimiento-jornadas/pages/SeguimientoJornadas';
import {
  createSeguimientoJornada,
  exportSeguimientoJornadasCsv,
  getSeguimientoConductoresCatalogo,
  getSeguimientoContratosVigentesCatalogo,
  getSeguimientoJornadas,
  getSeguimientoUnidadesDisponibles,
} from '@nanutech/api-client';

// Mockea el api-client compartido para probar la pantalla sin depender del backend real.
vi.mock('@nanutech/api-client', () => ({
  createSeguimientoJornada: vi.fn(),
  getSeguimientoJornadas: vi.fn(),
  exportSeguimientoJornadasCsv: vi.fn(),
  getSeguimientoConductoresCatalogo: vi.fn(),
  getSeguimientoUnidadesDisponibles: vi.fn(),
  getSeguimientoContratosVigentesCatalogo: vi.fn(),
}));

// Convierte las funciones mockeadas en helpers tipados de Vitest.
const createJornadaMock = vi.mocked(createSeguimientoJornada);
const getJornadasMock = vi.mocked(getSeguimientoJornadas);
const exportJornadasCsvMock = vi.mocked(exportSeguimientoJornadasCsv);
const getConductoresCatalogoMock = vi.mocked(getSeguimientoConductoresCatalogo);
const getUnidadesDisponiblesMock = vi.mocked(getSeguimientoUnidadesDisponibles);
const getContratosVigentesCatalogoMock = vi.mocked(getSeguimientoContratosVigentesCatalogo);

// Registro base con la estructura real que retorna GET /jornadas en jornada-services.
const backendJornada = {
  id: 'jornada-1',
  fecha: '2026-06-01',
  conductor: 'Juan Perez',
  camion: 'ABC-123 - Volvo FH16',
  contrato: 'CTR-001',
  horario: '08:00 AM - 10:00 AM',
  estado: 'FINALIZADA',
  observaciones: 'Revision mecanica',
  duracion_total: '02:00',
  tiene_observaciones: true,
};

// Prepara APIs del navegador que jsdom no implementa de forma nativa para descargas.
beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:url');
  global.URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
});

describe('HU05 - Seguimiento Jornadas', () => {
  // Reinicia mocks y deja catálogos mínimos antes de cada caso.
  beforeEach(() => {
    vi.clearAllMocks();
    exportJornadasCsvMock.mockResolvedValue(new Blob(['csv']));
    createJornadaMock.mockResolvedValue({ id: 'nueva-jornada' });
    getConductoresCatalogoMock.mockResolvedValue([
      { id: 'conductor-1', nombres: 'Juan', apellidos: 'Perez', estado: 'ACTIVO' },
    ]);
    getUnidadesDisponiblesMock.mockResolvedValue([
      { id: 'unidad-1', placa: 'ABC-123', marca: 'Volvo', modelo: 'FH16' },
    ]);
    getContratosVigentesCatalogoMock.mockResolvedValue([
      { id: 'contrato-1', codigo: 'CTR-001', cliente: 'NANU TECH' },
    ]);
    localStorage.setItem('nanutech_user', JSON.stringify({ id: 'admin-1' }));
  });

  // Verifica el estado vacío requerido cuando backend no devuelve registros.
  it('muestra Sin datos cuando no hay jornadas', async () => {
    getJornadasMock.mockResolvedValue([]);

    render(<SeguimientoJornadas />);

    expect(await screen.findByText(/Sin datos/i)).toBeTruthy();
  });

  // Confirma que la tabla usa conductor, placa, duración y estado desde el backend.
  it('renderiza la respuesta enriquecida del backend', async () => {
    getJornadasMock.mockResolvedValue([backendJornada]);

    render(<SeguimientoJornadas />);

    expect((await screen.findAllByText('Juan Perez')).length).toBeGreaterThan(0);
    expect(screen.getByText('ABC-123')).toBeTruthy();
    expect(screen.getByText('02:00')).toBeTruthy();
    expect(screen.getByText('Completada')).toBeTruthy();
  });

  // Valida que la búsqueda general viaje como q hacia GET /jornadas.
  it('envia busqueda general al backend como parametro q', async () => {
    getJornadasMock.mockResolvedValueOnce([
      backendJornada,
      {
        ...backendJornada,
        id: 'jornada-2',
        conductor: 'Carlos Ruiz',
        camion: 'XYZ-999 - Scania R',
        tiene_observaciones: false,
        observaciones: '',
      },
    ]);
    getJornadasMock.mockResolvedValueOnce([backendJornada]);

    render(<SeguimientoJornadas />);

    expect((await screen.findAllByText('Juan Perez')).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText(/Buscar/i), {
      target: { value: 'juan' },
    });

    await waitFor(() => {
      expect(getJornadasMock).toHaveBeenLastCalledWith({
        q: 'juan',
        fecha_desde: '',
        fecha_hasta: '',
      });
    });
  });

  // Comprueba el filtro visual por conductor dentro de la tabla cargada.
  it('filtra por conductor en la tabla', async () => {
    getJornadasMock.mockResolvedValue([
      backendJornada,
      {
        ...backendJornada,
        id: 'jornada-2',
        conductor: 'Carlos Ruiz',
        camion: 'XYZ-999 - Scania R',
        tiene_observaciones: false,
        observaciones: '',
      },
    ]);

    render(<SeguimientoJornadas />);

    expect((await screen.findAllByText('Juan Perez')).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Juan Perez' },
    });

    const table = screen.getByRole('table');

    expect(within(table).getByText('Juan Perez')).toBeTruthy();
    expect(within(table).queryByText('Carlos Ruiz')).toBeNull();
  });

  // Asegura que una jornada con observaciones abra el modal de auditoría.
  it('abre modal de observaciones', async () => {
    getJornadasMock.mockResolvedValue([backendJornada]);

    render(<SeguimientoJornadas />);

    expect((await screen.findAllByText('Juan Perez')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Ver observaciones/i }));

    expect(await screen.findByText(/Revision mecanica/i)).toBeTruthy();
  });

  // Comprueba que Exportar CSV use el endpoint compartido y cree un blob descargable.
  it('exporta CSV usando el endpoint del backend', async () => {
    getJornadasMock.mockResolvedValue([backendJornada]);

    render(<SeguimientoJornadas />);

    expect((await screen.findAllByText('Juan Perez')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText(/Exportar CSV/i));

    await waitFor(() => {
      expect(exportJornadasCsvMock).toHaveBeenCalledWith({
        q: '',
        fecha_desde: '',
        fecha_hasta: '',
      });
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    });
  });

  // Simula el flujo completo del modal Nueva Jornada y verifica el payload enviado.
  it('registra una nueva jornada desde el modal', async () => {
    getJornadasMock.mockResolvedValue([backendJornada]);

    render(<SeguimientoJornadas />);

    expect((await screen.findAllByText('Juan Perez')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByText(/\+ Nueva Jornada/i));

    await screen.findByText(/Registrar Nueva Jornada/i);
    await waitFor(() => {
      expect(screen.getAllByRole('option', { name: /Juan Perez/i })).toHaveLength(2);
    });
    await screen.findByRole('option', { name: /ABC-123/i });
    await screen.findByRole('option', { name: /CTR-001/i });

    const combos = screen.getAllByRole('combobox');
    fireEvent.change(combos[1], { target: { value: 'conductor-1' } });
    fireEvent.change(combos[2], { target: { value: 'unidad-1' } });
    fireEvent.change(combos[3], { target: { value: 'contrato-1' } });
    const dateInputs = screen.getAllByLabelText(/Fecha/i);
    fireEvent.change(dateInputs[dateInputs.length - 1], { target: { value: '2026-06-01' } });

    fireEvent.click(screen.getByRole('button', { name: /Registrar Jornada/i }));

    await waitFor(() => {
      expect(createJornadaMock).toHaveBeenCalledWith({
        conductor_id: 'conductor-1',
        unidad_id: 'unidad-1',
        contrato_id: 'contrato-1',
        creado_por: 'admin-1',
        fecha_jornada: '2026-06-01',
        origen: '',
        destino: '',
        km_recorridos: 0,
        observaciones: '',
        estado: 'REGISTRADA',
      });
    });
  });
});
