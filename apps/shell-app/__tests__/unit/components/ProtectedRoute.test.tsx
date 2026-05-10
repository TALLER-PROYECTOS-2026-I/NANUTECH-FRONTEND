import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from '../../../src/components/ProtectedRoute';

// Monta ProtectedRoute junto con rutas destino para observar redirecciones.
const renderProtectedRoute = (allowedRoles?: string[]) =>
  render(
    <MemoryRouter
      initialEntries={['/privado']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/privado"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>Contenido protegido</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login destino</div>} />
        <Route path="/dashboard/admin/dashboard" element={<div>Home admin</div>} />
        <Route path="/dashboard/contratos/dashboard" element={<div>Home gerente</div>} />
        <Route path="/dashboard/chofer" element={<div>Home chofer</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Asegura reloj real y una sesion limpia antes de cada escenario.
    vi.useRealTimers();
    localStorage.clear();
  });

  it('redirige al login cuando no hay token', () => {
    renderProtectedRoute(['ADMIN']);

    expect(screen.getByText('Login destino')).not.toBeNull();
  });

  it('renderiza el contenido cuando hay token vigente y rol permitido', () => {
    // Prepara una sesion valida para el rol GERENTE.
    localStorage.setItem('nanutech_token', 'token');
    localStorage.setItem('nanutech_role', 'GERENTE');
    localStorage.setItem('nanutech_expires_at', '2999-01-01T00:00:00.000Z');

    renderProtectedRoute(['GERENTE']);

    expect(screen.getByText('Contenido protegido')).not.toBeNull();
  });

  it('limpia la sesion y redirige cuando el token expiro', () => {
    // Congela el tiempo para que la expiracion sea determinista.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-09T10:00:00.000Z'));
    localStorage.setItem('nanutech_token', 'token');
    localStorage.setItem('nanutech_id_token', 'id-token');
    localStorage.setItem('nanutech_user', JSON.stringify({ id: 'user-1' }));
    localStorage.setItem('nanutech_role', 'ADMIN');
    localStorage.setItem('nanutech_expires_at', '2026-05-09T09:59:00.000Z');

    renderProtectedRoute(['ADMIN']);

    // Ademas de redirigir, debe borrar datos sensibles de localStorage.
    expect(screen.getByText('Login destino')).not.toBeNull();
    expect(localStorage.getItem('nanutech_token')).toBeNull();
    expect(localStorage.getItem('nanutech_role')).toBeNull();

    vi.useRealTimers();
  });

  it('redirige al home del rol autenticado si intenta entrar a una ruta no permitida', () => {
    // Un GERENTE no debe entrar a rutas ADMIN, pero si vuelve a su home.
    localStorage.setItem('nanutech_token', 'token');
    localStorage.setItem('nanutech_role', 'GERENTE');
    localStorage.setItem('nanutech_expires_at', '2999-01-01T00:00:00.000Z');

    renderProtectedRoute(['ADMIN']);

    expect(screen.getByText('Home gerente')).not.toBeNull();
  });
});
