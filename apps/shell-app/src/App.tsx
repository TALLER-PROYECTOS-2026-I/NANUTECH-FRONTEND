import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/Auth/LoginPage';
import RecoverPage from './pages/Auth/RecoverPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
  
const RemoteDashboard = lazy(() => import('dashboardApp/Dashboard'));
const RemoteFlota = lazy(() => import('flotaApp/Dashboard'));
const RemoteContratos = lazy(() => import('contratosApp/App'));

/* v8 ignore start */
const DashboardLayout = () => {
  return (
    <Suspense
      fallback={
        <div className="text-blue-700 animate-pulse mt-4">
          Cargando módulo de Dashboard...
        </div>
      }
    >
      <RemoteDashboard />
    </Suspense>
  );
};

const ChoferLayout = () => {
  return (
    <Suspense
      fallback={
        <div className="text-blue-700 animate-pulse mt-4">
          Cargando módulo de Flota...
        </div>
      }
    >
      <RemoteFlota />
    </Suspense>
  );
};

const ContratosLayout = () => {
  return (
    <Suspense
      fallback={
        <div className="text-blue-700 animate-pulse mt-4">
          Cargando modulo de Contratos...
        </div>
      }
    >
      <RemoteContratos />
    </Suspense>
  );
};
/* v8 ignore stop */

/* v8 ignore next 2 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/admin/dashboard" replace />} />
      <Route path="/dashboard" element={<Navigate to="/dashboard/admin/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar" element={<RecoverPage />} />
      <Route path="/recuperar/confirmar" element={<ResetPasswordPage />} />

      <Route
        path="/dashboard/admin/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/gerencial"
        element={<Navigate to="/dashboard/contratos/dashboard" replace />}
      />

      <Route
        path="/dashboard/chofer/*"
        element={
          <ProtectedRoute>
            <ChoferLayout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/contratos/*"
        element={
          <ProtectedRoute allowedRoles={['GERENTE', 'GERENCIAL']}>
            <ContratosLayout />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
