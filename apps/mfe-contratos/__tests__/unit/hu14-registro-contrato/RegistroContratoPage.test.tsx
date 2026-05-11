import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearContrato } from '@nanutech/api-client';
import RegistroContratoPage from '../../../src/modules/registro-contrato/pages/RegistroContratoPage';

vi.mock('@nanutech/api-client', () => ({
  crearContrato: vi.fn(),
}));

const crearContratoMock = vi.mocked(crearContrato);

const completarPasoInformacionGeneral = () => {
  fireEvent.change(screen.getByLabelText(/Nombre del Cliente/i), {
    target: { value: 'Empresa Constructora ABC S.A.C.' },
  });
  fireEvent.change(screen.getByLabelText(/RUC/i), {
    target: { value: '20123456789' },
  });
  fireEvent.change(screen.getByLabelText(/Tipo de Servicio/i), {
    target: { value: 'POR_KM' },
  });
  fireEvent.change(screen.getByLabelText(/Fecha de Inicio/i), {
    target: { value: '2026-06-01' },
  });
  fireEvent.change(screen.getByLabelText(/Fecha de Vencimiento/i), {
    target: { value: '2026-12-31' },
  });
};

const completarPasoRuta = () => {
  fireEvent.change(screen.getByLabelText(/Punto de Partida/i), {
    target: { value: 'Lima - Terminal Ate' },
  });
  fireEvent.change(screen.getByLabelText(/Punto de Llegada/i), {
    target: { value: 'Lima - Terminal Callao' },
  });
  fireEvent.change(screen.getByLabelText(/Distancia Estimada/i), {
    target: { value: '25.5' },
  });
};

const completarPasoTarifas = () => {
  fireEvent.change(screen.getByLabelText(/Tarifa por KM/i), {
    target: { value: '3.2' },
  });
  fireEvent.change(screen.getByLabelText(/Tarifa por Hora/i), {
    target: { value: '50' },
  });
  fireEvent.change(screen.getByLabelText(/Tarifa por Espera/i), {
    target: { value: '12.5' },
  });
};

const avanzarAlPasoTarifas = () => {
  completarPasoInformacionGeneral();
  fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

  completarPasoRuta();
  fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
};

describe('RegistroContratoPage - HU14 backend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    crearContratoMock.mockResolvedValue({
      id: 'contrato-1',
      codigo: 'CTR-2026-001',
      cliente: 'Empresa Constructora ABC S.A.C.',
      ruc: '20123456789',
      tipo_servicio: 'POR_KM',
      fecha_inicio: '2026-06-01',
      fecha_fin: '2026-12-31',
      origen: 'Lima - Terminal Ate',
      destino: 'Lima - Terminal Callao',
      distancia_estimada_km: 25.5,
      tarifa_por_km: 3.2,
      tarifa_por_hora: 50,
      tarifa_espera: 12.5,
      tarifa: 81.6,
      moneda: 'PEN',
      estado: 'VIGENTE',
    });
  });

  it('renderiza el primer paso del registro de contrato', () => {
    render(<RegistroContratoPage onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /Registrar Nuevo Contrato/i })).toBeTruthy();
    expect(screen.getByText(/Paso 1/i)).toBeTruthy();
    expect(screen.getByLabelText(/Nombre del Cliente/i)).toBeTruthy();
    expect(screen.getByLabelText(/RUC/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeTruthy();
  });

  it('muestra errores de validacion cuando intenta avanzar sin datos validos', () => {
    render(<RegistroContratoPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(screen.getAllByText(/Campo obligatorio/i)).toHaveLength(2);
    expect(screen.getByText(/RUC debe tener 11/i)).toBeTruthy();
  });

  it('no avanza al paso de tarifas si faltan datos obligatorios de ruta', () => {
    render(<RegistroContratoPage onBack={vi.fn()} />);

    completarPasoInformacionGeneral();
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }));

    expect(screen.getByText(/Paso 2/i)).toBeTruthy();
    expect(screen.getAllByText(/Campo obligatorio/i)).toHaveLength(2);
    expect(screen.getByText(/distancia debe ser mayor a 0/i)).toBeTruthy();
  });

  it('avanza por los pasos y muestra el calculo de tarifa total', () => {
    render(<RegistroContratoPage onBack={vi.fn()} />);

    avanzarAlPasoTarifas();
    completarPasoTarifas();

    expect(screen.getByText(/Paso 3/i)).toBeTruthy();
    expect(screen.getByText(/Tarifa Total inicial/i)).toBeTruthy();
    expect(screen.getByText('S/ 81.60')).toBeTruthy();
    expect(screen.getByText('Empresa Constructora ABC S.A.C.')).toBeTruthy();
    expect(screen.getByText('20123456789')).toBeTruthy();
  });

  it('registra el contrato en backend y muestra el estado final exitoso', async () => {
    const onBack = vi.fn();
    const onRegistered = vi.fn();

    render(<RegistroContratoPage onBack={onBack} onRegistered={onRegistered} />);

    avanzarAlPasoTarifas();
    completarPasoTarifas();
    fireEvent.click(screen.getByRole('button', { name: /Registrar Contrato/i }));

    await waitFor(() => {
      expect(crearContrato).toHaveBeenCalledWith(
        expect.objectContaining({
          cliente: 'Empresa Constructora ABC S.A.C.',
          ruc: '20123456789',
          tipo_servicio: 'POR_KM',
          distancia_estimada_km: 25.5,
          tarifa_por_km: 3.2,
          moneda: 'PEN',
        })
      );
      expect(onRegistered).toHaveBeenCalledWith(
        expect.objectContaining({
          cliente: 'Empresa Constructora ABC S.A.C.',
          codigo: 'CTR-2026-001',
          tarifa: 81.6,
        })
      );
    });
    expect(screen.getByText(/Contrato registrado exitosamente/i)).toBeTruthy();
    expect(onBack).not.toHaveBeenCalled();
  });

  it('no registra si falta completar las tarifas obligatorias', () => {
    const onRegistered = vi.fn();
    render(<RegistroContratoPage onBack={vi.fn()} onRegistered={onRegistered} />);

    avanzarAlPasoTarifas();
    fireEvent.click(screen.getByRole('button', { name: /Registrar Contrato/i }));

    expect(onRegistered).not.toHaveBeenCalled();
    expect(crearContrato).not.toHaveBeenCalled();
    expect(screen.getByText(/Debe ser mayor a 0/i)).toBeTruthy();
    expect(screen.getAllByText(/Campo obligatorio/i)).toHaveLength(2);
  });

  it('muestra error si el backend rechaza el registro', async () => {
    crearContratoMock.mockRejectedValue({
      response: {
        data: {
          message: 'RUC ya registrado',
        },
      },
    });

    render(<RegistroContratoPage onBack={vi.fn()} onRegistered={vi.fn()} />);

    avanzarAlPasoTarifas();
    completarPasoTarifas();
    fireEvent.click(screen.getByRole('button', { name: /Registrar Contrato/i }));

    expect(await screen.findByText('RUC ya registrado')).toBeTruthy();
    expect(screen.queryByText(/Contrato registrado exitosamente/i)).toBeNull();
  });
});

