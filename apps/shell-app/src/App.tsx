import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/Auth/LoginPage';
import RecoverPage from './pages/Auth/RecoverPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import MfeLoader from './components/MfeLoader';
  
const RemoteDashboard = lazy(() => import('dashboardApp/Dashboard'));
const RemoteFlota = lazy(() => import('flotaApp/Dashboard'));
const RemoteContratos = lazy(() => import('contratosApp/App'));

/* v8 ignore start */
const DashboardLayout = () => {
  return (
    <Suspense fallback={<MfeLoader modulo="Dashboard" />}>
      <RemoteDashboard />
    </Suspense>
  );
};

const ChoferLayout = () => {
  return (
    <Suspense fallback={<MfeLoader modulo="Flota" />}>
      <RemoteFlota />
    </Suspense>
  );
};

const ContratosLayout = () => {
  return (
    <Suspense fallback={<MfeLoader modulo="Contratos" />}>
      <RemoteContratos />
    </Suspense>
  );
};
/* v8 ignore stop */

/* v8 ignore next 2 */
function App() {
  return (
    <Routes>
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
