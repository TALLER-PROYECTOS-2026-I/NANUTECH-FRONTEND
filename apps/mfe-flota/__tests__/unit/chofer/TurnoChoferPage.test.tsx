import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TurnoChoferPage } from '../../../src/modules/chofer/pages/TurnoChoferPage';
import { turnoChoferService } from '../../../src/modules/chofer/services/turnoChofer.service';
import type { TurnoChofer } from '../../../src/modules/chofer/types/turnoChofer.types';

// Fija el contador para que la pagina sea determinista durante las pruebas.
vi.mock('../../../src/modules/chofer/hooks/useTiempoTranscurrido', () => ({
  useTiempoTranscurrido: vi.fn(() => ({
    tiempoFormateado: '00:15:00',
    tiempoSegundos: 900,
  })),
}));

// Mockea el service que conecta la pagina con el backend de jornadas.
vi.mock('../../../src/modules/chofer/services/turnoChofer.service', () => ({
  turnoChoferService: {
    obtenerTurnoActual: vi.fn(),
    iniciarTurno: vi.fn(),
    finalizarTurno: vi.fn(),
    formatearTiempo: vi.fn((segundos: number) => `formateado-${segundos}`),
  },
}));

// Turno base reutilizado para estados PENDIENTE y EN_PROGRESO.
const turnoPendiente: TurnoChofer = {
  id: 'turno-1',
  estado: 'PENDIENTE',
  datosJornada: {
    id: 'turno-1',
    nombreConductor: 'Carlos Gomez',
    placa: 'ABC-123',
    idContrato: 'CONT-001',
    ruta: {
      origen: 'Lima',
      destino: 'Callao',
    },
    fecha: '2026-05-09',
  },
};

describe('TurnoChoferPage', () => {
  beforeEach(() => {
    // Reinicia timers, llamadas e implementaciones para aislar cada escenario.
    vi.useRealTimers();
    vi.clearAllMocks();
    vi.mocked(turnoChoferService.obtenerTurnoActual).mockReset();
    vi.mocked(turnoChoferService.iniciarTurno).mockReset();
    vi.mocked(turnoChoferService.finalizarTurno).mockReset();
    vi.mocked(turnoChoferService.formatearTiempo).mockReset();
    vi.mocked(turnoChoferService.formatearTiempo).mockImplementation(
      (segundos: number) => `formateado-${segundos}`
    );
  });

  it('muestra estado vacio cuando no hay jornada asignada', async () => {
    // Simula que el backend no tiene jornada activa para el conductor.
    vi.mocked(turnoChoferService.obtenerTurnoActual).mockResolvedValue({
      success: true,
      data: undefined,
    });

    render(<TurnoChoferPage />);

    expect(screen.getByText('Cargando tu turno...')).not.toBeNull();

    await waitFor(() => {
      expect(screen.getByText('No tienes jornadas asignadas')).not.toBeNull();
    });
    expect(screen.getByText('Historial de Jornadas')).not.toBeNull();
  });

  it('permite iniciar un turno pendiente y muestra notificacion', async () => {
    // Cubre la transicion PENDIENTE -> EN_PROGRESO desde la UI.
    vi.mocked(turnoChoferService.obtenerTurnoActual).mockResolvedValue({
      success: true,
      data: turnoPendiente,
    });
    vi.mocked(turnoChoferService.iniciarTurno).mockResolvedValue({
      success: true,
      data: {
        ...turnoPendiente,
        estado: 'EN_PROGRESO',
        horaInicio: '2026-05-09T14:00:00.000Z',
      },
      mensaje: 'Turno iniciado',
    });

    render(<TurnoChoferPage />);

    await waitFor(() => {
      expect(screen.getByText('INICIAR TURNO')).not.toBeNull();
    });

    fireEvent.click(screen.getByText('INICIAR TURNO'));

    await waitFor(() => {
      expect(turnoChoferService.iniciarTurno).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Turno iniciado')).not.toBeNull();
      expect(screen.getByText('FINALIZAR TURNO')).not.toBeNull();
    });
  });

  it('abre el modal y finaliza un turno en progreso', async () => {
    // Cubre apertura de modal, envio de observaciones y notificacion final.
    vi.mocked(turnoChoferService.obtenerTurnoActual)
      .mockResolvedValueOnce({
        success: true,
        data: {
          ...turnoPendiente,
          estado: 'EN_PROGRESO',
          horaInicio: '2026-05-09T14:00:00.000Z',
        },
      })
      .mockResolvedValueOnce({
        success: true,
        data: undefined,
      });
    vi.mocked(turnoChoferService.finalizarTurno).mockResolvedValue({
      success: true,
      data: {
        idTurno: 'turno-1',
        estado: 'FINALIZADO',
        horaFinalizacion: '2026-05-09T15:00:00.000Z',
        duracionTotal: 3600,
      },
    });

    render(<TurnoChoferPage />);

    await waitFor(() => {
      expect(screen.getByText('FINALIZAR TURNO')).not.toBeNull();
    });

    fireEvent.click(screen.getByText('FINALIZAR TURNO'));
    fireEvent.change(screen.getByPlaceholderText(/Viaje sin novedades/i), {
      target: { value: 'Cierre sin novedades' },
    });
    fireEvent.click(screen.getByText('Confirmar y Finalizar'));

    await waitFor(() => {
      expect(turnoChoferService.finalizarTurno).toHaveBeenCalledWith({
        idTurno: 'turno-1',
        observaciones: 'Cierre sin novedades',
      });
      expect(screen.getByText(/formateado-3600/i)).not.toBeNull();
    });
  });

  it('muestra notificacion de error si falla la carga inicial', async () => {
    // Silencia el error esperado para validar la respuesta visual de la pagina.
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(turnoChoferService.obtenerTurnoActual).mockRejectedValue(
      new Error('API unavailable')
    );

    render(<TurnoChoferPage />);

    expect(await screen.findByText('Error al cargar el turno')).not.toBeNull();

    errorSpy.mockRestore();
  });
});
