import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from '@nanutech/api-client';
import LoginPage from '../../../src/pages/Auth/LoginPage';

// Reemplaza el login real para probar el flujo sin llamar a Cognito/API.
vi.mock('@nanutech/api-client', () => ({
  login: vi.fn(),
}));

// Mantiene la misma regla basica de correo que necesita el formulario.
vi.mock('@nanutech/utils', () => ({
  validarFormatoCorreo: vi.fn((correo: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)),
}));

// Renderiza el login con rutas destino para verificar navegacion por rol.
const renderLogin = () =>
  render(
    <MemoryRouter
      initialEntries={['/login']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/admin/dashboard" element={<div>Dashboard admin</div>} />
        <Route path="/dashboard/contratos/dashboard" element={<div>Dashboard gerente</div>} />
        <Route path="/dashboard/chofer" element={<div>Dashboard chofer</div>} />
      </Routes>
    </MemoryRouter>
  );

// Centraliza el llenado de credenciales para no repetir eventos en cada caso.
const completarFormulario = (correo: string, password: string) => {
  fireEvent.change(screen.getByPlaceholderText('usuario@nanutech.com'), {
    target: { value: correo },
  });
  fireEvent.change(document.querySelector('input[type="password"]') as HTMLInputElement, {
    target: { value: password },
  });
};

describe('LoginPage', () => {
  beforeEach(() => {
    // Evita que mocks o datos de sesion de un caso afecten al siguiente.
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('valida formato de correo antes de llamar al API', () => {
    renderLogin();

    completarFormulario('correo@invalido', 'Password123!');
    fireEvent.click(screen.getByRole('button', { name: /Iniciar/i }));

    expect(login).not.toHaveBeenCalled();
    expect(screen.getByText(/correo v[aá]lido/i)).not.toBeNull();
  });

  it('guarda la sesion y redirige al dashboard del gerente', async () => {
    // Simula una respuesta exitosa del backend para un usuario GERENTE.
    vi.mocked(login).mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'gerente@nanutech.com' },
        role: 'GERENTE',
        session: {
          accessToken: 'access-token',
          idToken: 'id-token',
          expiresAt: '2026-05-09T23:59:00.000Z',
        },
      },
    } as never);

    renderLogin();

    completarFormulario('gerente@nanutech.com', 'Gerente123!');
    fireEvent.click(screen.getByRole('button', { name: /Iniciar/i }));

    // La ruta renderizada confirma que LoginPage navego al dashboard correcto.
    await waitFor(() => {
      expect(screen.getByText('Dashboard gerente')).not.toBeNull();
    });

    // Valida que se persistan los datos usados por ProtectedRoute.
    expect(login).toHaveBeenCalledWith('gerente@nanutech.com', 'Gerente123!');
    expect(localStorage.getItem('nanutech_token')).toBe('access-token');
    expect(localStorage.getItem('nanutech_id_token')).toBe('id-token');
    expect(localStorage.getItem('nanutech_role')).toBe('GERENTE');
  });

  it('usa nextRoute cuando el backend lo envia', async () => {
    // nextRoute debe tener prioridad sobre la ruta calculada por rol.
    vi.mocked(login).mockResolvedValue({
      data: {
        user: { id: 'admin-1', email: 'admin@nanutech.com' },
        role: 'ADMIN',
        nextRoute: '/dashboard/admin',
        session: {
          accessToken: 'access-token',
          idToken: 'id-token',
          expiresAt: '2026-05-09T23:59:00.000Z',
        },
      },
    } as never);

    renderLogin();

    completarFormulario('admin@nanutech.com', 'Admin123!');
    fireEvent.click(screen.getByRole('button', { name: /Iniciar/i }));

    expect(await screen.findByText('Dashboard admin')).not.toBeNull();
  });

  it('ignora un nextRoute de otro rol y mantiene al gerente en contratos', async () => {
    // Protege el flujo si el backend envia una ruta antigua o de otro perfil.
    vi.mocked(login).mockResolvedValue({
      data: {
        user: { id: 'gerente-2', email: 'gerente@nanutech.com' },
        role: 'GERENTE',
        nextRoute: '/dashboard/admin/dashboard',
        session: {
          accessToken: 'access-token',
          idToken: 'id-token',
          expiresAt: '2026-05-09T23:59:00.000Z',
        },
      },
    } as never);

    renderLogin();

    completarFormulario('gerente@nanutech.com', 'Gerente123!');
    fireEvent.click(screen.getByRole('button', { name: /Iniciar/i }));

    expect(await screen.findByText('Dashboard gerente')).not.toBeNull();
  });

  it('muestra mensaje de error cuando Cognito rechaza credenciales', async () => {
    // Reproduce el formato de error que puede devolver el cliente HTTP.
    vi.mocked(login).mockRejectedValue({
      response: {
        data: {
          message: 'Credenciales invalidas',
        },
      },
    });

    renderLogin();

    completarFormulario('chofer@nanutech.com', 'MalaClave123!');
    fireEvent.click(screen.getByRole('button', { name: /Iniciar/i }));

    expect(await screen.findByText('Credenciales invalidas')).not.toBeNull();
  });
});
