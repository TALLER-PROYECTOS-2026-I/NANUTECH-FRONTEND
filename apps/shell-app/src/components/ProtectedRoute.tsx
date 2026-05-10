import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

const clearSession = () => {
  localStorage.removeItem('nanutech_token');
  localStorage.removeItem('nanutech_id_token');
  localStorage.removeItem('nanutech_user');
  localStorage.removeItem('nanutech_role');
  localStorage.removeItem('nanutech_expires_at');
};

const getHomeRouteByRole = (role: string | null) => {
  switch ((role || '').toUpperCase()) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'GERENTE':
      return '/dashboard/contratos';
    default:
      return '/dashboard/chofer';
  }
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('nanutech_token');
  const expiresAt = localStorage.getItem('nanutech_expires_at');
  const role = localStorage.getItem('nanutech_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (expiresAt) {
    const fechaExpiracion = new Date(expiresAt).getTime();
    const ahora = Date.now();

    if (ahora >= fechaExpiracion) {
      clearSession();

      return <Navigate to="/login" replace />;
    }
  }

  if (
    allowedRoles?.length &&
    !allowedRoles.map((allowedRole) => allowedRole.toUpperCase()).includes((role || '').toUpperCase())
  ) {
    return <Navigate to={getHomeRouteByRole(role)} replace />;
  }

  return <>{children}</>;
}
