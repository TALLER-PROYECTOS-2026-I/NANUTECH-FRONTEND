import React, { useState } from 'react';

/**
 * Componente Sidebar
 * Panel de navegación lateral con menú y información del conductor
 */ 

export const Sidebar: React.FC = () => {
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const handleLogout = () => {
    console.log('Cerrando sesión...');
    localStorage.clear();
    window.location.href = '/login';
  };


  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-[280px] flex-col bg-slate-900 text-white shadow-lg">
      <div className="flex items-center gap-3 border-b border-slate-700 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500">
          <span className="text-xs font-bold">NT</span>
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">NANU TECH</p>
          <p className="text-xs text-slate-400">Gestión de Flota</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">
        <a
          href="#dashboard"
          className="flex items-center gap-3 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white"
        >
          <span className="text-sm">▦</span>
          <span>Mi Dashboard</span>
        </a>
        <a
          href="#historial"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <span className="text-sm">☰</span>
          <span>Historial de Jornadas</span>
        </a>
        <a
          href="#licencia"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <span className="text-sm">▤</span>
          <span>Mi Licencia</span>
        </a>
      </nav>


      {/* Perfil del Usuario + dropdown */}
      <div className="px-4 py-3 border-t border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="text-slate-400">Sesión activa</span>
          </div>
          <p className="text-white text-xs font-semibold mb-3">1h 10m</p>
 
          {/* User + dropdown */}
          <div className="relative">
            {/* Dropdown popup — aparece encima del botón */}
            {menuUsuarioAbierto && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-0.5">Sesión iniciada como</p>
                  <p className="text-sm font-bold text-gray-900">chofer@nanutech.com</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}
 
            {/* Botón usuario */}
            <button
              className="w-full flex items-center gap-2 rounded-lg hover:bg-slate-800 transition-colors p-1 -mx-1"
              onClick={() => setMenuUsuarioAbierto((prev) => !prev)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">P</div>
              <div className="min-w-0 text-left">
                <p className="text-white text-xs font-semibold truncate">Carlos Gomez</p>
                <p className="text-slate-400 text-xs truncate">Coductor</p>
              </div>
              <svg
                className={`w-4 h-4 ml-auto text-slate-400 shrink-0 transition-transform ${menuUsuarioAbierto ? "rotate-180" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </div>
    </aside>
  );
};
