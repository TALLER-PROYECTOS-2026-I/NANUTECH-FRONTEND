import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('nanutech_token');
  const expiresAt = localStorage.getItem('nanutech_expires_at');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (expiresAt) {
    const fechaExpiracion = new Date(expiresAt).getTime();
    const ahora = Date.now();

    if (ahora >= fechaExpiracion) {
      localStorage.removeItem('nanutech_token');
      localStorage.removeItem('nanutech_id_token');
      localStorage.removeItem('nanutech_user');
      localStorage.removeItem('nanutech_role');
      localStorage.removeItem('nanutech_expires_at');

      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}