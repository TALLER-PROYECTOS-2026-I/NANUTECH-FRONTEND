import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmarRecuperacionPassword } from '@nanutech/api-client';
import ResetPasswordPage from '../../../src/pages/Auth/ResetPasswordPage';

// Evita depender del endpoint real que confirma el codigo de recuperacion.
vi.mock('@nanutech/api-client', () => ({
  confirmarRecuperacionPassword: vi.fn(),
}));

// Controla la validacion de correo para que el test sea predecible.
vi.mock('@nanutech/utils', () => ({
  validarFormatoCorreo: vi.fn((correo: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)),
}));

// Renderiza la pagina con un email recibido por state, igual que el flujo real.
const renderResetPassword = () =>
  render(
    <MemoryRouter
      initialEntries={[{ pathname: '/recuperar/confirmar', state: { email: 'usuario@nanutech.com' } }]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/recuperar/confirmar" element={<ResetPasswordPage />} />
        <Route path="/login" element={<div>Login destino</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    // Limpia llamadas y configuraciones de mocks antes de cada prueba.
    vi.clearAllMocks();
  });

  it('valida que el codigo sea obligatorio', () => {
    renderResetPassword();

    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }));

    expect(confirmarRecuperacionPassword).not.toHaveBeenCalled();
    expect(screen.getByText(/Ingresa el c[oó]digo de verificaci[oó]n/i)).not.toBeNull();
  });

  it('confirma la recuperacion de password con los datos ingresados', async () => {
    // Simula una confirmacion exitosa del cambio de password.
    vi.mocked(confirmarRecuperacionPassword).mockResolvedValue({
      message: 'Password actualizado',
    } as never);

    renderResetPassword();

    fireEvent.change(screen.getByPlaceholderText('Ej: 123456'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText('NuevaPassword123!'), {
      target: { value: 'NuevaPassword123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }));

    // Verifica el contrato esperado entre la pagina y el cliente API.
    await waitFor(() => {
      expect(confirmarRecuperacionPassword).toHaveBeenCalledWith(
        'usuario@nanutech.com',
        '123456',
        'NuevaPassword123!'
      );
    });
    expect(screen.getByText('Password actualizado')).not.toBeNull();
  });

  it('muestra error del backend si Cognito rechaza el codigo', async () => {
    // Reproduce un error de codigo invalido devuelto por la API.
    vi.mocked(confirmarRecuperacionPassword).mockRejectedValue({
      response: {
        data: {
          mensaje: 'Codigo invalido',
        },
      },
    });

    renderResetPassword();

    fireEvent.change(screen.getByPlaceholderText('Ej: 123456'), {
      target: { value: '000000' },
    });
    fireEvent.change(screen.getByPlaceholderText('NuevaPassword123!'), {
      target: { value: 'NuevaPassword123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }));

    expect(await screen.findByText('Codigo invalido')).not.toBeNull();
  });
});
