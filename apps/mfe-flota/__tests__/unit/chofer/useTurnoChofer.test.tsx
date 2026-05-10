import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTurnoChofer } from '../../../src/modules/chofer/hooks/useTurnoChofer';
import { turnoChoferService } from '../../../src/modules/chofer/services/turnoChofer.service';
import type { TurnoChofer } from '../../../src/modules/chofer/types/turnoChofer.types';

// Aisla el hook del service real para controlar respuestas asincronas.
vi.mock('../../../src/modules/chofer/services/turnoChofer.service', () => ({
  turnoChoferService: {
    obtenerTurnoActual: vi.fn(),
    iniciarTurno: vi.fn(),
    finalizarTurno: vi.fn(),
  },
}));

// Turno base usado para comprobar carga, inicio y finalizacion.
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

// Componente auxiliar que expone el estado del hook y sus acciones.
const HookProbe = () => {
  const { turno, iniciarTurno, finalizarTurno } = useTurnoChofer();

  return (
    <div>
      <span data-testid="estado">{turno?.estado ?? 'SIN_TURNO'}</span>
      <button onClick={iniciarTurno}>iniciar</button>
      <button onClick={() => finalizarTurno('Cierre normal')}>finalizar</button>
    </div>
  );
};

describe('useTurnoChofer', () => {
  beforeEach(() => {
    // Evita que llamadas de un test afecten al siguiente.
    vi.clearAllMocks();
  });

  it('carga el turno inicial desde el servicio', async () => {
    // El hook debe publicar en estado el turno devuelto al montar.
    vi.mocked(turnoChoferService.obtenerTurnoActual).mockResolvedValue({
      success: true,
      data: turnoPendiente,
    });

    render(<HookProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('estado').textContent).toBe('PENDIENTE');
    });
  });

  it('inicia turno y actualiza el estado local', async () => {
    // Si iniciarTurno responde con data, el hook actualiza su turno.
    vi.mocked(turnoChoferService.obtenerTurnoActual).mockResolvedValue({
      success: true,
      data: undefined,
    });
    vi.mocked(turnoChoferService.iniciarTurno).mockResolvedValue({
      success: true,
      data: { ...turnoPendiente, estado: 'EN_PROGRESO' },
    });

    render(<HookProbe />);
    await waitFor(() => {
      expect(screen.getByTestId('estado').textContent).toBe('SIN_TURNO');
    });

    fireEvent.click(screen.getByText('iniciar'));

    await waitFor(() => {
      expect(screen.getByTestId('estado').textContent).toBe('EN_PROGRESO');
    });
  });

  it('finaliza turno activo y recarga desde el servicio', async () => {
    // Tras finalizar, el hook vuelve a consultar el turno actual.
    vi.mocked(turnoChoferService.obtenerTurnoActual)
      .mockResolvedValueOnce({
        success: true,
        data: turnoPendiente,
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
        horaFinalizacion: '2026-05-09T16:00:00.000Z',
        duracionTotal: 3600,
      },
    });

    render(<HookProbe />);
    await waitFor(() => {
      expect(screen.getByTestId('estado').textContent).toBe('PENDIENTE');
    });

    fireEvent.click(screen.getByText('finalizar'));

    await waitFor(() => {
      expect(turnoChoferService.finalizarTurno).toHaveBeenCalledWith({
        idTurno: 'turno-1',
        observaciones: 'Cierre normal',
      });
      expect(screen.getByTestId('estado').textContent).toBe('SIN_TURNO');
    });
  });
});
