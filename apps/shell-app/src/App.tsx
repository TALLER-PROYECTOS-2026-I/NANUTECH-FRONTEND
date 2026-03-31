import { useState, lazy, Suspense } from 'react';
import './App.css';
import Login from './pages/Auth/LoginPage';

// Importamos el Microfrontend de forma ASÍNCRONA usando React.lazy()
const RemoteDashboard = lazy(() => import('dashboardApp/Dashboard'));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Pantalla de Login (Carga instantánea, no depende de ningún Microfrontend)
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Pantalla Principal (El Dashboard se descargará SOLO cuando lleguemos aquí)
  return (
    <div className="min-h-screen bg-black text-white p-8">
      
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">NANU TECH</h1>
          <p className="text-slate-400">Shell (Contenedor Principal)</p>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-sm transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="border border-dashed border-emerald-500 p-6 rounded-lg relative min-h-[400px]">
        <span className="absolute -top-3 left-4 bg-black px-2 text-emerald-500 font-mono text-sm">
          Zona del Microfrontend
        </span>
        
        {/* Suspense atrapa el Microfrontend mientras viaja por internet */}
        {/* Si tarda, muestra el texto de "Cargando..." y evita la pantalla blanca */}
        <Suspense fallback={<div className="text-emerald-500 animate-pulse mt-4">Cargando módulo de Dashboard...</div>}>
          <RemoteDashboard />
        </Suspense>
        
      </div>
    </div>
  );
}

export default App;