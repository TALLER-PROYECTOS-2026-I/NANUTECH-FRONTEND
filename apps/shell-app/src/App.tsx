import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Importamos la función para obtener los usuarios (aunque no la usamos aquí, es solo para mostrar cómo importar desde el API Client)
import { getUsuarios } from '@nanutech/api-client';

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

  //CREAMOS LA FUNCIÓN DE PRUEBA
  const probarApiDevSecOps = async () => {
    try {
      console.log('📡 Conectando a AWS API Gateway...');
      const respuesta = await getUsuarios();
      console.log('✅ ¡Éxito! Datos recibidos del backend:', respuesta.data);
      alert('¡Conexión exitosa! Revisa la consola para ver los datos.');
    } catch (error: any) {
      console.error('❌ Error de conexión:', error);
      alert('Hubo un error. Revisa la consola roja (F12).');
    }
  };

  return (

    // Contenedor Principal del Dashboard
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">NANU TECH</h1>
          <p className="text-slate-400">Shell (Contenedor Principal)</p>
        </div>
        
        {/* Contenedor para los botones */}
        <div className="flex gap-4">
          {/* 👇 2. AGREGAMOS EL BOTÓN DE PRUEBA */}
          <button 
            onClick={probarApiDevSecOps}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm font-bold transition-colors shadow-lg shadow-emerald-900/50"
          >
            Probar API AWS
          </button>

          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenedor del Microfrontend */}
      <div className="border border-dashed border-emerald-500 p-6 rounded-lg relative min-h-[400px]">
        <span className="absolute -top-3 left-4 bg-black px-2 text-emerald-500 font-mono text-sm">
          Zona del Microfrontend
        </span>
        
        <Suspense fallback={<div className="text-emerald-500 animate-pulse mt-4">Cargando módulo de Dashboard...</div>}>
          <RemoteDashboard />
        </Suspense>
        
      </div>
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