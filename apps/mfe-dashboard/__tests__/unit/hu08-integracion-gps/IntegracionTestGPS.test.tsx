import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import {
  getGpsPlantilla,
  getGpsProveedores,
  getGpsRegistros,
  getGpsResumen,
  importarGpsCsv,
  validarGpsCsv,
} from '@nanutech/api-client';
import GpsIntegrationPage from '../../../src/modules/gps-integration/pages/GpsIntegrationPage';

vi.mock('@nanutech/api-client', () => ({
  getGpsProveedores: vi.fn(),
  getGpsPlantilla: vi.fn(),
  validarGpsCsv: vi.fn(),
  importarGpsCsv: vi.fn(),
  getGpsResumen: vi.fn(),
  getGpsRegistros: vi.fn(),
}));

const providers = [
  {
    proveedor: 'GPSCONTROL',
    nombre: 'GPSControl.pe',
    encabezados: ['fecha', 'hora', 'placa', 'latitud', 'longitud', 'velocidad', 'rumbo', 'distancia_total'],
  },
  {
    proveedor: 'GLOBALGPS',
    nombre: 'GlobalGPSPeru.com',
    encabezados: ['event_date', 'event_time', 'vehicle_plate', 'latitude', 'longitude', 'speed', 'heading', 'mileage'],
  },
];

const registros = [
  {
    id: 'gps-1',
    placa: 'ABC-123',
    proveedor: 'GPSCONTROL',
    fecha_hora: '2026-05-08T10:30:00Z',
    latitud: -12.0464,
    longitud: -77.0428,
    velocidad_kmh: 65,
    rumbo: 180,
    distancia_total: 25430,
    estado: 'MOVIENDO',
    exceso_velocidad: false,
  },
  {
    id: 'gps-2',
    placa: 'DEF-456',
    proveedor: 'GLOBALGPS',
    fecha_hora: '2026-05-08T10:32:00Z',
    latitud: -12.1428,
    longitud: -77.1464,
    velocidad_kmh: 95,
    rumbo: 120,
    distancia_total: 18310,
    estado: 'EXCESO_VELOCIDAD',
    exceso_velocidad: true,
  },
];

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(getGpsProveedores).mockResolvedValue(providers);
  vi.mocked(getGpsResumen).mockResolvedValue({
    total_registros_activos: 9,
    unidades_en_movimiento: 7,
    unidades_detenidas: 1,
    velocidad_promedio: 65,
  });
  vi.mocked(getGpsRegistros).mockResolvedValue(registros);
  vi.mocked(getGpsPlantilla).mockResolvedValue({
    proveedor: 'GPSCONTROL',
    nombre: 'GPSControl.pe',
    filename: 'gpscontrol_plantilla_gps.csv',
    content_type: 'text/csv',
    encabezados: providers[0].encabezados,
    csv: 'fecha,hora,placa,latitud,longitud,velocidad,rumbo,distancia_total\n2026-05-01,08:00:00,ABC-123,-12,-77,60,180,1000',
  });
  vi.mocked(validarGpsCsv).mockResolvedValue({
    proveedor: 'GPSCONTROL',
    nombre_archivo: 'gps.csv',
    importacion_habilitada: true,
    total_filas: 1,
    encabezados_esperados: providers[0].encabezados,
    encabezados_recibidos: providers[0].encabezados,
    filas_validas: 1,
    errores: [],
  });
  vi.mocked(importarGpsCsv).mockResolvedValue({
    proveedor: 'GPSCONTROL',
    nombre_archivo: 'gps.csv',
    registros_validos: 1,
    estado: 'PROCESADA',
  });

  Object.defineProperty(window.URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:url'),
    writable: true,
  });

  Object.defineProperty(window.URL, 'revokeObjectURL', {
    value: vi.fn(),
    writable: true,
  });
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <GpsIntegrationPage />
    </MemoryRouter>,
  );

describe('HU08 - Integracion GPS', () => {
  it('consume resumen, proveedores y registros del backend', async () => {
    renderPage();

    expect(await screen.findByText('Modulo de Integracion GPS v2.0')).toBeInTheDocument();
    expect(getGpsProveedores).toHaveBeenCalled();
    expect(getGpsResumen).toHaveBeenCalled();
    expect(getGpsRegistros).toHaveBeenCalled();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('65.0 km/h')).toBeInTheDocument();
  });

  it('muestra datos GPS reales al abrir la pestaña Ver Datos GPS', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /Ver Datos GPS/i }));

    expect(await screen.findByText('ABC-123')).toBeInTheDocument();
    expect(screen.getByText('DEF-456')).toBeInTheDocument();
    expect(screen.getAllByText('GPSControl.pe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('GlobalGPSPeru.com').length).toBeGreaterThan(0);
  });

  it('filtra por placa y proveedor usando el endpoint real', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /Ver Datos GPS/i }));
    fireEvent.change(screen.getByPlaceholderText(/Todos los Camiones/i), {
      target: { value: 'ABC' },
    });
    fireEvent.change(screen.getByLabelText(/Filtrar por Proveedor/i), {
      target: { value: 'GPSCONTROL' },
    });

    await waitFor(() => {
      expect(getGpsRegistros).toHaveBeenLastCalledWith({
        proveedor: 'GPSCONTROL',
        placa: 'ABC',
      });
    });
  });

  it('descarga la plantilla entregada por backend', async () => {
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /Descargar Plantilla/i }));

    await waitFor(() => {
      expect(getGpsPlantilla).toHaveBeenCalledWith('GPSCONTROL');
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('valida e importa CSV usando /gps/validar y /gps/importar', async () => {
    renderPage();

    const file = new File(
      ['fecha,hora,placa,latitud,longitud,velocidad,rumbo,distancia_total\n2026-05-01,08:00:00,ABC-123,-12,-77,60,180,1000'],
      'gps.csv',
      { type: 'text/csv' },
    );

    const input = await screen.findByLabelText(/2. Seleccionar Archivo CSV/i);
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText('Archivo GPS validado correctamente.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Importar Datos$/i }));

    await waitFor(() => {
      expect(validarGpsCsv).toHaveBeenCalledWith({
        proveedor: 'GPSCONTROL',
        nombreArchivo: 'gps.csv',
        csv: expect.stringContaining('ABC-123'),
      });
      expect(importarGpsCsv).toHaveBeenCalledWith({
        proveedor: 'GPSCONTROL',
        nombreArchivo: 'gps.csv',
        csv: expect.stringContaining('ABC-123'),
      });
    });
  });
});
