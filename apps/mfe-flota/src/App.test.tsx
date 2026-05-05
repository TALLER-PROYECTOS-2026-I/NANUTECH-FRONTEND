import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.mock('./modules/chofer/services/turnoChofer.service', () => ({
  turnoChoferService: {
    obtenerTurnoActual: vi.fn().mockResolvedValue({
      success: true,
      data: undefined,
      mensaje: 'No hay turno activo',
    }),
    obtenerHoraServidor: vi.fn().mockResolvedValue(new Date().toISOString()),
    calcularTiempoTranscurrido: vi.fn().mockReturnValue(0),
    formatearTiempo: vi.fn().mockReturnValue('00:00:00'),
  },
}));

describe('Microfrontend Base', () => {
  it('debería renderizar el componente principal sin errores', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando tu turno...')).toBeNull();
    });

    expect(container).toBeTruthy(); 
  });
});
