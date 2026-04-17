import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Importamos las páginas de Autenticación
import LoginPage from './pages/Auth/LoginPage';
import RecoverPage from './pages/Auth/RecoverPage';
import ForgotPasswordConfirmPage from './pages/Auth/ForgotPasswordConfirmPage';

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


  // Ejemplo de uso de getMe
  const handleGetMe = async () => {
    try {
      const user = await getMe();
      alert('Usuario autenticado: ' + JSON.stringify(user));
    } catch (error: any) {
      alert('Error al obtener usuario: ' + error.message);
    }
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
