  import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Sidebar MFE Flota
 */

export const Sidebar: React.FC = () => {
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    localStorage.clear();
    window.location.href = "/login";
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-[280px] flex-col bg-slate-900 text-white shadow-lg">

      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-slate-700 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
          <span className="text-xs font-bold">NT</span>
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">NANU TECH</p>
          <p className="text-xs text-slate-400">Gestión de Flota</p>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-4">

        {/* 🏠 MI DASHBOARD (NO SE BORRA) */}
        <Link
          to="/"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            isActive("/")
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>▦</span>
          <span>Dashboard Gerencial</span>
        </Link>


          <Link
          to="/"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            isActive("/")
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>▦</span>
          <span>Contratos</span>
        </Link>
        

         {/* 🚛 HISTORIAL (OPCIONAL) */}
        <Link
          to="/turno-chofer"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            isActive("/turno-chofer")
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>▤</span>
          <span>Historial Jornadas</span>
        </Link>

        {/* 📊 SEGUIMIENTO JORNADAS (NUEVO) */}
        <Link
          to="/seguimiento-jornadas"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            isActive("/seguimiento-jornadas")
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span>☰</span>
          <span>Seguimiento Jornadas</span>
        </Link>

       

      </nav>

      {/* PERFIL */}
      <div className="px-4 py-3 border-t border-slate-700">

        <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Sesión activa</span>
        </div>

        <p className="text-white text-xs font-semibold mb-3">1h 10m</p>

        <div className="relative">

          {/* DROPDOWN */}
          {menuUsuarioAbierto && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border overflow-hidden z-50">

              <div className="px-4 py-3 border-b">
                <p className="text-xs text-gray-500">Sesión iniciada como</p>
                <p className="text-sm font-bold text-gray-900">
                  chofer@nanutech.com
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          )}

          {/* USER BUTTON */}
          <button
            className="w-full flex items-center gap-2 rounded-lg hover:bg-slate-800 p-1"
            onClick={() => setMenuUsuarioAbierto((p) => !p)}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
              P
            </div>

            <div className="text-left">
              <p className="text-white text-xs font-semibold">
                Maria Gerente
              </p>
              <p className="text-slate-400 text-xs">Gerente de Operaciones</p>
            </div>

            <span className="ml-auto text-slate-400">
              {menuUsuarioAbierto ? "▲" : "▼"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};