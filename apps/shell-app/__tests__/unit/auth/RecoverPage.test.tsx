import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recuperarPassword } from '@nanutech/api-client';
import RecoverPage from '../../../src/pages/Auth/RecoverPage';

// Aisla el test del servicio real de recuperacion de password.
vi.mock('@nanutech/api-client', () => ({
  recuperarPassword: vi.fn(),
}));

// Usa una validacion determinista para probar errores de correo.
vi.mock('@nanutech/utils', () => ({
  validarFormatoCorreo: vi.fn((correo: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)),
}));

// Monta la pagina con su ruta y una ruta de login para probar navegacion.
const renderRecover = () =>
  render(
    <MemoryRouter
      initialEntries={['/recuperar']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/recuperar" element={<RecoverPage />} />
        <Route path="/login" element={<div>Login destino</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('RecoverPage', () => {
  beforeEach(() => {
    // Reinicia llamadas y respuestas mockeadas entre casos.
    vi.clearAllMocks();
  });

  it('valida correo antes de solicitar recuperacion', () => {
    renderRecover();

    fireEvent.change(screen.getByPlaceholderText('usuario@nanutech.com'), {
      target: { value: 'correo@invalido' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

    expect(recuperarPassword).not.toHaveBeenCalled();
    expect(screen.getByText(/correo v[aá]lido/i)).not.toBeNull();
  });

  it('solicita codigo de recuperacion y muestra mensaje exitoso', async () => {
    // Simula que Cognito/API acepto la solicitud y devolvio mensaje.
    vi.mocked(recuperarPassword).mockResolvedValue({
      data: {
        message: 'Codigo enviado',
      },
    } as never);

    renderRecover();

    fireEvent.change(screen.getByPlaceholderText('usuario@nanutech.com'), {
      target: { value: 'usuario@nanutech.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar/i }));

    // Confirma que el formulario envia el correo ingresado al servicio.
    await waitFor(() => {
      expect(recuperarPassword).toHaveBeenCalledWith('usuario@nanutech.com');
    });
    expect(screen.getByText('Codigo enviado')).not.toBeNull();
  });

  it('permite volver al login', () => {
    renderRecover();

    fireEvent.click(screen.getByRole('button', { name: /Volver al Login/i }));

    expect(screen.getByText('Login destino')).not.toBeNull();
  });
});
