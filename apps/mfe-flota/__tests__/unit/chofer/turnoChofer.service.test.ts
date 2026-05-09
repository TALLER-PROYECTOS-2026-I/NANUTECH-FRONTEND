import {
  getCamiones,
  getConductores,
  getContratosVigentes,
  getJornadaActual,
  iniciarJornada,
  finalizarJornada,
} from '@nanutech/api-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { turnoChoferService } from '../../../src/modules/chofer/services/turnoChofer.service';

// Sustituye el cliente API para probar el service sin red ni backend real.
vi.mock('@nanutech/api-client', () => ({
  getJornadaActual: vi.fn(),
  iniciarJornada: vi.fn(),
  finalizarJornada: vi.fn(),
  getConductores: vi.fn(),
  getCamiones: vi.fn(),
  getContratosVigentes: vi.fn(),
}));

// Catalogo minimo usado para enriquecer la jornada con datos legibles.
const conductor = {
  id: 'conductor-1',
  nombres: 'Carlos',
  apellidos: 'Gomez',
  correo: 'carlos@nanutech.test',
};

// Unidad asociada a la jornada mockeada.
const camion = {
  id: 'camion-1',
  placa: 'ABC-123',
};

// Contrato asociado a la jornada mockeada.
const contrato = {
  id: 'contrato-1',
  codigo: 'CONT-001',
};

// Forma aproximada de la jornada que retorna el backend.
const jornadaBackend = {
  id: 'jornada-1',
  conductor_id: 'conductor-1',
  unidad_id: 'camion-1',
  contrato_id: 'contrato-1',
  fecha_jornada: '2026-05-09',
  hora_inicio: '2026-05-09T14:00:00.000Z',
  origen: 'Lima',
  destino: 'Callao',
  estado: 'ACTIVA',
};

describe('turnoChoferService', () => {
  beforeEach(() => {
    // Prepara una sesion de conductor y catalogos comunes para cada caso.
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('nanutech_user', JSON.stringify({ id: 'conductor-1' }));
    vi.mocked(getConductores).mockResolvedValue([conductor] as never);
    vi.mocked(getCamiones).mockResolvedValue([camion] as never);
    vi.mocked(getContratosVigentes).mockResolvedValue([contrato] as never);
  });

  it('devuelve error cuando no existe usuario autenticado', async () => {
    // Sin usuario en localStorage no debe consultar jornadas.
    localStorage.clear();

    await expect(turnoChoferService.obtenerTurnoActual()).resolves.toEqual({
      success: false,
      error: 'No se pudo identificar al conductor autenticado',
    });
    expect(getJornadaActual).not.toHaveBeenCalled();
  });

  it('mapea la jornada actual del backend al turno del chofer', async () => {
    // Verifica la transformacion de IDs backend a datos visibles en UI.
    vi.mocked(getJornadaActual).mockResolvedValue(jornadaBackend as never);

    const respuesta = await turnoChoferService.obtenerTurnoActual();

    expect(respuesta.success).toBe(true);
    expect(respuesta.data).toMatchObject({
      id: 'jornada-1',
      estado: 'EN_PROGRESO',
      horaInicio: '2026-05-09T14:00:00.000Z',
      datosJornada: {
        nombreConductor: 'Carlos Gomez',
        placa: 'ABC-123',
        idContrato: 'CONT-001',
        ruta: {
          origen: 'Lima',
          destino: 'Callao',
        },
      },
    });
  });

  it('inicia turno usando la jornada actual registrada', async () => {
    // Primero obtiene la jornada registrada y luego llama a iniciarJornada.
    vi.mocked(getJornadaActual).mockResolvedValue({
      ...jornadaBackend,
      estado: 'REGISTRADA',
    } as never);
    vi.mocked(iniciarJornada).mockResolvedValue({
      data: {
        ...jornadaBackend,
        estado: 'EN_PROCESO',
      },
    } as never);

    const respuesta = await turnoChoferService.iniciarTurno();

    expect(iniciarJornada).toHaveBeenCalledWith('jornada-1', 'conductor-1');
    expect(respuesta.success).toBe(true);
    expect(respuesta.data?.estado).toBe('EN_PROGRESO');
  });

  it('finaliza turno y normaliza la duracion recibida del backend', async () => {
    // Cubre el contrato de salida que consume la pantalla del chofer.
    vi.mocked(finalizarJornada).mockResolvedValue({
      data: {
        duracion_total_segundos: 5400,
      },
    } as never);

    const respuesta = await turnoChoferService.finalizarTurno({
      idTurno: 'jornada-1',
      observaciones: 'Sin novedades',
    });

    expect(finalizarJornada).toHaveBeenCalledWith(
      'jornada-1',
      'Sin novedades',
      'conductor-1'
    );
    expect(respuesta).toMatchObject({
      success: true,
      data: {
        idTurno: 'jornada-1',
        estado: 'FINALIZADO',
        duracionTotal: 5400,
      },
    });
  });

  it('calcula y formatea tiempos de forma estable', () => {
    // Prueba utilidades expuestas por el service para contador de turno.
    expect(
      turnoChoferService.calcularTiempoTranscurrido(
        '2026-05-09T10:00:00.000Z',
        '2026-05-09T10:02:05.000Z'
      )
    ).toBe(125);
    expect(
      turnoChoferService.calcularTiempoTranscurrido(
        '2026-05-09T10:02:05.000Z',
        '2026-05-09T10:00:00.000Z'
      )
    ).toBe(0);
    expect(turnoChoferService.formatearTiempo(3661)).toBe('01:01:01');
  });
});
