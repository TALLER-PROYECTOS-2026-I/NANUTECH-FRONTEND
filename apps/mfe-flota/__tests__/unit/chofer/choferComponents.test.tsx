import { getJornadaActual, getJornadas } from '@nanutech/api-client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EstadoVacio } from '../../../src/modules/chofer/components/EstadoVacio';
import { ModalFinalizarTurno } from '../../../src/modules/chofer/components/ModalFinalizarTurno';
import { NotificacionExitosa } from '../../../src/modules/chofer/components/NotificacionExitosa';
import { PanelDebugAPI } from '../../../src/modules/chofer/components/PanelDebugAPI';
import { RegeneralNanuTech } from '../../../src/modules/chofer/components/RegeneralNanuTech';
import { TarjetaEstado } from '../../../src/modules/chofer/components/TarjetaEstado';

// Aisla el panel debug de las llamadas reales al cliente API.
vi.mock('@nanutech/api-client', () => ({
  getJornadaActual: vi.fn(),
  getJornadas: vi.fn(),
}));

describe('componentes del modulo chofer', () => {
  beforeEach(() => {
    // Limpia llamadas de mocks entre pruebas para evitar falsos positivos.
    vi.clearAllMocks();
  });

  it('renderiza TarjetaEstado con datos de jornada y acciones hijas', () => {
    // Verifica que la tarjeta muestre datos operativos y contenido accionable.
    render(
      <TarjetaEstado
        estado="EN_PROGRESO"
        nombreConductor="Carlos Gomez"
        placa="ABC-123"
        idContrato="CONT-001"
        fecha="2026-05-09"
        origen="Lima"
        destino="Callao"
        tiempoTranscurrido="01:02:03"
      >
        <button>Finalizar</button>
      </TarjetaEstado>
    );

    expect(screen.getByText('EN PROGRESO')).not.toBeNull();
    expect(screen.getByText('Carlos Gomez')).not.toBeNull();
    expect(screen.getByText('ABC-123')).not.toBeNull();
    expect(screen.getByText('01:02:03')).not.toBeNull();
    expect(screen.getByText('Finalizar')).not.toBeNull();
  });

  it('muestra estado vacio con accion y contenido de pie', () => {
    // Simula la accion que podria usar la UI para reintentar o contactar.
    const onClick = vi.fn();

    render(
      <EstadoVacio
        titulo="Sin jornadas"
        descripcion="No hay jornadas disponibles"
        accion={{ texto: 'Reintentar', onClick }}
        pie={<span>Contactar operaciones</span>}
      />
    );

    fireEvent.click(screen.getByText('Reintentar'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Contactar operaciones')).not.toBeNull();
  });

  it('valida y confirma observaciones desde ModalFinalizarTurno', async () => {
    // Confirma que el modal envie las observaciones capturadas al callback.
    const alConfirmar = vi.fn().mockResolvedValue(undefined);

    render(
      <ModalFinalizarTurno
        abierto
        alCancelar={vi.fn()}
        alConfirmar={alConfirmar}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/Viaje sin novedades/i), {
      target: { value: 'Entrega conforme' },
    });
    fireEvent.click(screen.getByText('Confirmar y Finalizar'));

    await waitFor(() => {
      expect(alConfirmar).toHaveBeenCalledWith('Entrega conforme');
    });
  });

  it('muestra error si las observaciones superan el limite permitido', async () => {
    // Cubre la validacion local de longitud antes de finalizar el turno.
    render(
      <ModalFinalizarTurno
        abierto
        alCancelar={vi.fn()}
        alConfirmar={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/Viaje sin novedades/i), {
      target: { value: 'x'.repeat(501) },
    });
    fireEvent.click(screen.getByText('Confirmar y Finalizar'));

    expect(
      await screen.findByText('Las observaciones no pueden exceder 500 caracteres')
    ).not.toBeNull();
  });

  it('renderiza notificaciones por tipo y oculta cuando no esta visible', () => {
    // Reutiliza el mismo render para probar cambios de tipo y visibilidad.
    const { rerender } = render(
      <NotificacionExitosa visible mensaje="Turno iniciado" tipo="exito" />
    );

    expect(screen.getByText('Turno iniciado')).not.toBeNull();

    rerender(<NotificacionExitosa visible mensaje="No se pudo iniciar" tipo="error" />);
    expect(screen.getByText('No se pudo iniciar')).not.toBeNull();

    rerender(<NotificacionExitosa visible={false} mensaje="Oculto" />);
    expect(screen.queryByText('Oculto')).toBeNull();
  });

  it('renderiza reglas generales con color por defecto para reglas desconocidas', () => {
    // Valida que una regla con color no registrado igual se renderice.
    render(
      <RegeneralNanuTech
        reglas={[
          {
            id: 'regla-1',
            titulo: 'Inspeccion',
            descripcion: 'Verificar unidad antes de salir',
            icono: '*',
            color: 'desconocido',
          },
        ]}
      />
    );

    expect(screen.getByText('Reglas Generales de NANU TECH')).not.toBeNull();
    expect(screen.getByText('Inspeccion')).not.toBeNull();
  });

  it('permite probar endpoints desde PanelDebugAPI y limpiar logs', async () => {
    // Simula respuestas del API para cubrir logs exitosos del panel debug.
    vi.mocked(getJornadas).mockResolvedValue([{ id: 'jornada-1' }] as never);
    vi.mocked(getJornadaActual).mockResolvedValue({ id: 'jornada-actual' } as never);

    render(<PanelDebugAPI />);

    fireEvent.click(screen.getByTitle('Panel de Debug de APIs'));
    fireEvent.click(screen.getByText(/Todas las Jornadas/i));

    expect(await screen.findByText(/Jornadas obtenidas: 1/i)).not.toBeNull();

    fireEvent.change(screen.getByPlaceholderText('ej: CONDUCTOR-001'), {
      target: { value: 'conductor-1' },
    });
    fireEvent.click(screen.getByText(/Jornada Actual/i));

    expect(await screen.findByText(/Jornada actual obtenida/i)).not.toBeNull();

    fireEvent.click(screen.getByText(/Limpiar Logs/i));
    expect(screen.getByText('Logs (0)')).not.toBeNull();
  });
});
