import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RegistroContratoPage from '../../../src/modules/registro-contrato/pages/RegistroContratoPage';
import { crearContrato } from '@nanutech/api-client';

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
  fireEvent.change(screen.getByLabelText(/Fecha de Fin/i), {
    target: { value: '2026-12-31' },
  });
  fireEvent.change(screen.getByLabelText(/Descripcion del Servicio|Descripción del Servicio/i), {
    target: { value: 'Servicio de transporte Lima - Callao' },
  });
};

const completarPasoRuta = () => {
  fireEvent.change(screen.getByPlaceholderText(/Av\. Lima 123/i), {
    target: { value: 'Av. Lima 123' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Calle Arequipa 456/i), {
    target: { value: 'Puerto del Callao' },
  });
  fireEvent.change(screen.getByPlaceholderText(/25\.50/i), {
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

describe('RegistroContratoPage - HU14', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza el primer paso del registro de contrato', () => {
    render(<RegistroContratoPage onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /Registro de Contrato/i })).toBeTruthy();
    expect(screen.getByText(/Paso 1 de 3/i)).toBeTruthy();
    expect(screen.getByLabelText(/Nombre del Cliente/i)).toBeTruthy();
    expect(screen.getByLabelText(/RUC/i)).toBeTruthy();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: /Anterior/i }).disabled).toBe(
      true
    );
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

    expect(screen.getByText(/Paso 2 de 3/i)).toBeTruthy();
    expect(screen.getAllByText(/Campo obligatorio/i)).toHaveLength(2);
    expect(screen.getByText(/distancia debe ser mayor a 0/i)).toBeTruthy();
  });

  it('avanza por los pasos y muestra el calculo de tarifa total', () => {
    render(<RegistroContratoPage onBack={vi.fn()} />);

    avanzarAlPasoTarifas();
    completarPasoTarifas();

    expect(screen.getByText(/Paso 3 de 3/i)).toBeTruthy();
    expect(screen.getByText(/Tarifa Total: S\/ 81.60/i)).toBeTruthy();
    expect(screen.getByText('Empresa Constructora ABC S.A.C.')).toBeTruthy();
    expect(screen.getByText('20123456789')).toBeTruthy();
  });

  it('envia el contrato al api y vuelve al listado cuando el registro es exitoso', async () => {
    const onBack = vi.fn();
    const onRegistered = vi.fn();
    crearContratoMock.mockResolvedValue({
      id: 'CON-001',
      codigo: 'CONT-2026-001',
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
      moneda: 'PEN',
      tarifa: 81.6,
    });

    render(<RegistroContratoPage onBack={onBack} onRegistered={onRegistered} />);

    avanzarAlPasoTarifas();
    completarPasoTarifas();
    fireEvent.click(screen.getByRole('button', { name: /Registrar Contrato/i }));

    await waitFor(() => {
      expect(crearContratoMock).toHaveBeenCalledWith({
        cliente: 'Empresa Constructora ABC S.A.C.',
        ruc: '20123456789',
        descripcion: 'Servicio de transporte Lima - Callao',
        tipo_servicio: 'POR_KM',
        fecha_inicio: '2026-06-01',
        fecha_fin: '2026-12-31',
        origen: 'Av. Lima 123',
        destino: 'Puerto del Callao',
        distancia_estimada_km: 25.5,
        tarifa_por_km: 3.2,
        tarifa_por_hora: 50,
        tarifa_espera: 12.5,
        moneda: 'PEN',
      });
    });
    expect(onRegistered).toHaveBeenCalledWith(
      expect.objectContaining({ codigo: 'CONT-2026-001', tarifa: 81.6 })
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('no registra si falta completar las tarifas obligatorias', () => {
    render(<RegistroContratoPage onBack={vi.fn()} />);

    avanzarAlPasoTarifas();
    fireEvent.click(screen.getByRole('button', { name: /Registrar Contrato/i }));

    expect(crearContratoMock).not.toHaveBeenCalled();
    expect(screen.getByText(/Debe ser mayor a 0/i)).toBeTruthy();
    expect(screen.getAllByText(/Campo obligatorio/i)).toHaveLength(2);
  });

  it('muestra el mensaje de error del api cuando falla el registro', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    crearContratoMock.mockRejectedValue({
      response: {
        data: {
          message: 'El RUC ya tiene un contrato vigente',
        },
      },
    });

    render(<RegistroContratoPage onBack={vi.fn()} />);

    avanzarAlPasoTarifas();
    completarPasoTarifas();
    fireEvent.click(screen.getByRole('button', { name: /Registrar Contrato/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('El RUC ya tiene un contrato vigente');
    });
  });
});
