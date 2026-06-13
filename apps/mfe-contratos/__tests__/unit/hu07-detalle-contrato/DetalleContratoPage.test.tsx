import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actualizarContrato, getContratoById, getContratos, getPanelCamionesHu11 } from '@nanutech/api-client';
import type { Contrato } from '@nanutech/api-client';
import { DetalleContratoPage } from '../../../src/modules/detalle-contrato';

vi.mock('@nanutech/api-client', () => ({
  getContratoById: vi.fn(),
  getContratos: vi.fn(),
  getPanelCamionesHu11: vi.fn(),
  actualizarContrato: vi.fn(),
}));

const getContratoByIdMock = vi.mocked(getContratoById);
const getContratosMock = vi.mocked(getContratos);
const getPanelCamionesHu11Mock = vi.mocked(getPanelCamionesHu11);
const actualizarContratoMock = vi.mocked(actualizarContrato);

const backendContrato: Contrato = {
  id: 'cont-2026-001',
  codigo: 'CONT-2026-001',
  cliente: 'Alimentos Premium S.A.C.',
  ruc: '20123456789',
  tipo_servicio: 'POR_KM',
  fecha_inicio: '2026-01-01',
  fecha_fin: '2026-12-31',
  origen: 'Lima',
  destino: 'Callao',
  distancia_estimada_km: 25,
  tarifa_por_km: 4,
  tarifa_por_hora: 80,
  tarifa_espera: 15,
  tarifa: 95,
  moneda: 'PEN',
  estado: 'VIGENTE',
  activo: true,
  descripcion: 'Transporte refrigerado para alimentos.',
  camiones_asignados: 0,
};

const renderDetalle = (onBack = vi.fn()) =>
  render(<DetalleContratoPage contratoId="cont-2026-001" onBack={onBack} />);

describe('DetalleContratoPage - HU07', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getContratoByIdMock.mockResolvedValue(backendContrato);
    getContratosMock.mockResolvedValue({
      data: [backendContrato],
      meta: {
        total: 1,
        page: 1,
        limit: 100,
        total_pages: 1,
      },
    });
    getPanelCamionesHu11Mock.mockResolvedValue({
      resumen: {
        total_camiones: 1,
        en_uso: 0,
        disponibles: 1,
        mantenimiento: 0,
      },
      grafica_movimiento: {
        horas_movimiento: 0,
        horas_detenido: 0,
        porcentaje_movimiento: 0,
        porcentaje_detenido: 0,
      },
      camiones: [
        {
          id: 'unidad-1',
          placa: 'ABC-123',
          marca: 'Volvo',
          modelo: 'FH16',
          anio: 2024,
          capacidad_ton: 12,
          estado: 'DISPONIBLE',
          gps_habilitado: true,
          vin: 'VIN123',
          color: 'Azul',
          tipo_combustible: 'DIESEL',
          kilometraje_actual: 1000,
          fecha_registro: '2026-01-01',
          ultima_fecha_mantenimiento: null,
          proxima_fecha_mantenimiento: null,
          horas_movimiento: 0,
          horas_detenido: 0,
          horas_totales: 0,
          kilometros_totales: 0,
          ultimo_gps_at: null,
          activo: true,
        },
        {
          id: 'unidad-2',
          placa: 'DEF-456',
          marca: 'Scania',
          modelo: 'R450',
          anio: 2023,
          capacidad_ton: 30,
          estado: 'EN_JORNADA',
          gps_habilitado: true,
          vin: 'VIN456',
          color: 'Blanco',
          tipo_combustible: 'DIESEL',
          kilometraje_actual: 2500,
          fecha_registro: '2026-01-01',
          ultima_fecha_mantenimiento: null,
          proxima_fecha_mantenimiento: null,
          horas_movimiento: 0,
          horas_detenido: 0,
          horas_totales: 0,
          kilometros_totales: 0,
          ultimo_gps_at: null,
          activo: true,
        },
      ],
    });
    actualizarContratoMock.mockResolvedValue({ ...backendContrato, tarifa: 150 });
  });

  it('carga codigo, cliente, descripcion y vigencia desde GET /contratos/:id', async () => {
    renderDetalle();

    expect(await screen.findAllByText('CONT-2026-001')).toHaveLength(2);
    expect(screen.getByText('Alimentos Premium S.A.C.')).toBeTruthy();
    expect(screen.getByText(/Transporte refrigerado/i)).toBeTruthy();
    expect(screen.getByText(/1 de enero de 2026/i)).toBeTruthy();
    expect(screen.getByText(/31 de diciembre de 2026/i)).toBeTruthy();
    expect(getContratoByIdMock).toHaveBeenCalledWith('cont-2026-001');
  });

  it('muestra error bonito si backend no devuelve el detalle', async () => {
    const onBack = vi.fn();
    getContratoByIdMock.mockRejectedValue(new Error('Network error'));

    renderDetalle(onBack);

    expect(await screen.findByText(/No se pudo cargar el detalle del contrato/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Volver/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('normaliza fechas no ISO del backend sin romper la vista', async () => {
    getContratoByIdMock.mockResolvedValue({
      ...backendContrato,
      fecha_inicio: '01/02/2026',
      fecha_fin: '31/10/2026',
    });

    renderDetalle();

    expect(await screen.findAllByText('CONT-2026-001')).toHaveLength(2);
    expect(screen.getByText(/1 de febrero de 2026/i)).toBeTruthy();
    expect(screen.getByText(/31 de octubre de 2026/i)).toBeTruthy();
  });

  it('no muestra la ruta aunque backend use nombres alternativos', async () => {
    getContratoByIdMock.mockResolvedValue({
      ...backendContrato,
      origen: undefined,
      destino: undefined,
      origen_nombre: 'Lima Centro',
      destino_nombre: 'Callao Puerto',
    } as unknown as Contrato);

    renderDetalle();

    await screen.findAllByText('CONT-2026-001');
    expect(screen.queryByText('Ruta')).toBeNull();
    expect(screen.queryByText('Lima Centro -> Callao Puerto')).toBeNull();
  });

  it('no muestra estado vacio de ruta cuando backend no envia ruta', async () => {
    getContratoByIdMock.mockResolvedValue({
      ...backendContrato,
      origen: undefined,
      destino: undefined,
    } as unknown as Contrato);

    renderDetalle();

    await screen.findAllByText('CONT-2026-001');
    expect(screen.queryByText('Sin ruta registrada')).toBeNull();
    expect(screen.queryByText(/undefined -> undefined/i)).toBeNull();
  });

  it('muestra el contador de camiones asignados enviado por backend', async () => {
    getContratoByIdMock.mockResolvedValue({
      ...backendContrato,
      camiones_asignados: 1,
    });

    renderDetalle();

    expect(await screen.findByText('Gestión de Camiones Asignados')).toBeTruthy();
    expect(screen.getByText(/El backend reporta 1 camion asignado/i)).toBeTruthy();
  });

  it('completa el modelo del camion asignado desde el panel cuando el detalle solo envia placa', async () => {
    getContratoByIdMock.mockResolvedValue({
      ...backendContrato,
      camiones_asignados: 1,
      camiones: [{ placa: 'DEF-456' }],
    } as unknown as Contrato);

    renderDetalle();

    expect(await screen.findByText('DEF-456')).toBeTruthy();
    expect(screen.getByText('Scania R450')).toBeTruthy();
    expect(screen.getByText(/Año: 2023 \| Cap: 30,000 kg/i)).toBeTruthy();
    expect(screen.getByText('En Uso')).toBeTruthy();
    expect(screen.queryByText('Sin modelo')).toBeNull();
  });

  it('usa el contador del listado si el detalle no envia camiones_asignados', async () => {
    const detalleSinContador = { ...backendContrato };
    delete detalleSinContador.camiones_asignados;
    getContratoByIdMock.mockResolvedValue(detalleSinContador);
    getContratosMock.mockResolvedValue({
      data: [{ ...backendContrato, camiones_asignados: 1 }],
      meta: {
        total: 1,
        page: 1,
        limit: 100,
        total_pages: 1,
      },
    });

    renderDetalle();

    expect(await screen.findByText('Gestión de Camiones Asignados')).toBeTruthy();
  });

  it('guarda cambios usando PUT /contratos/:id', async () => {
    renderDetalle();

    await screen.findAllByText('CONT-2026-001');
    fireEvent.click(screen.getByRole('button', { name: /Tarifas/i }));
    fireEvent.change(screen.getByLabelText('Tarifa'), { target: { value: '150' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => {
      expect(actualizarContratoMock).toHaveBeenCalledWith(
        'cont-2026-001',
        { tarifa: 150 },
      );
    });
    expect(await screen.findByText(/Cambios guardados correctamente/i)).toBeTruthy();
  });

  it('permite editar desde la vista completa y guarda los cambios', async () => {
    renderDetalle();

    await screen.findAllByText('CONT-2026-001');
    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));

    expect(screen.getByRole('heading', { name: /Editar Contrato/i })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Nombre del Cliente'), {
      target: { value: 'Cliente Actualizado' },
    });
    fireEvent.change(screen.getByLabelText('Descripcion'), {
      target: { value: 'Descripcion actualizada' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => {
      expect(actualizarContratoMock).toHaveBeenCalledWith(
        'cont-2026-001',
        {
          cliente: 'Cliente Actualizado',
          descripcion: 'Descripcion actualizada',
        },
      );
    });
  });

  it('mantiene el contador de camiones al guardar si PUT no lo devuelve', async () => {
    getContratoByIdMock.mockResolvedValue({
      ...backendContrato,
      camiones_asignados: 1,
    });
    actualizarContratoMock.mockResolvedValue({
      ...backendContrato,
      camiones_asignados: undefined,
      cliente: 'Cliente Actualizado',
    } as unknown as Contrato);

    renderDetalle();

    await screen.findByText('Gestión de Camiones Asignados');
    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    expect(screen.getByText(/Camiones seleccionados: 1/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(await screen.findByText('Gestión de Camiones Asignados')).toBeTruthy();
    expect(actualizarContratoMock).not.toHaveBeenCalled();
  });

  it('no envia unidad_ids al guardar el contrato porque la asignacion requiere endpoint propio', async () => {
    getContratoByIdMock.mockResolvedValue({
      ...backendContrato,
      origen: undefined,
      destino: undefined,
      distancia_estimada_km: 0,
      tarifa_por_km: 0,
      tarifa_por_hora: 0,
      tarifa_espera: 0,
      camiones_asignados: 0,
    } as unknown as Contrato);
    actualizarContratoMock.mockResolvedValue({
      ...backendContrato,
      origen: undefined,
      destino: undefined,
      camiones_asignados: 1,
    } as unknown as Contrato);

    renderDetalle();

    await screen.findAllByText('CONT-2026-001');
    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    expect(screen.getByText(/La asignacion de camiones requiere un endpoint especifico del backend/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(await screen.findByText(/No se detectaron cambios/i)).toBeTruthy();
    expect(actualizarContratoMock).not.toHaveBeenCalled();
  });

  it('cambia de pestanas sin datos mock de historial o camiones', async () => {
    renderDetalle();

    await screen.findAllByText('CONT-2026-001');
    fireEvent.click(screen.getByRole('button', { name: /Historial/i }));
    expect(screen.getByText(/Aun no existen cambios registrados/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Camiones/i }));
    expect(screen.getByText('Gestión de Camiones Asignados')).toBeTruthy();
    expect(screen.getByText(/No hay camiones asignados/i)).toBeTruthy();
  });

  it('valida que la fecha de fin no sea menor a la fecha de inicio', async () => {
    renderDetalle();

    await screen.findAllByText('CONT-2026-001');
    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    fireEvent.change(screen.getByLabelText('Fecha de Fin'), { target: { value: '2020-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(await screen.findByText(/La fecha de fin no puede ser menor/i)).toBeTruthy();
    expect(actualizarContratoMock).not.toHaveBeenCalled();
  });
});
