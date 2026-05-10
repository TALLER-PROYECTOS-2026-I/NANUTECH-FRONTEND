import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getDashboardGerencial } from '@nanutech/api-client';
import DashboardGerencial from '../../../src/modules/dashboard-gerencial/pages/DashboardGerencial';

vi.mock('@nanutech/api-client', () => ({
  getDashboardGerencial: vi.fn(),
}));

describe('DashboardGerencial', () => {
  it('muestra datos referenciales cuando falla el endpoint gerencial', async () => {
    vi.mocked(getDashboardGerencial).mockRejectedValue(new Error('API no disponible'));

    render(<DashboardGerencial />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Gerencial')).not.toBeNull();
    });

    expect(screen.getByText(/No se pudo conectar con \/dashboard\/gerencial/i)).not.toBeNull();
    expect(screen.getByText('Datos referenciales')).not.toBeNull();
    expect(screen.getByText('Jornadas')).not.toBeNull();
  });
});
