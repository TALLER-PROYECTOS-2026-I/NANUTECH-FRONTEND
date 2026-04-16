import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Importamos las páginas de Autenticación
import LoginPage from './pages/Auth/LoginPage';
import RecoverPage from './pages/Auth/RecoverPage';

// Importamos el Microfrontend de forma ASÍNCRONA
const RemoteDashboard = lazy(() => import('dashboardApp/Dashboard'));

// --- COMPONENTE DEL LAYOUT PRIVADO ---
// Este es el "caparazón" que envuelve a tu microfrontend
const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('nanutech_token'); // Borramos el token falso
    navigate('/login'); // Lo regresamos al login
  };


  return (
    <div>
      {/* Contenedor del Microfrontend */}
        <Suspense fallback={<div className="text-blue-700 animate-pulse mt-4">Cargando módulo de Dashboard...</div>}>
          <RemoteDashboard />
        </Suspense>
    </div>
  );
};

// --- ENRUTADOR PRINCIPAL ---
function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar" element={<RecoverPage />} />

      {/* Rutas Privadas (Donde viven los Microfrontends) */}
      <Route path="/dashboard" element={<DashboardLayout />} />

      {/* Si el usuario escribe una URL que no existe, lo mandamos al login por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;