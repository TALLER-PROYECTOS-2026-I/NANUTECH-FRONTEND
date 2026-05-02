import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { getCamiones, type Camion } from "@nanutech/api-client";

/* MOCK DATA */
const kmData = [
  { name: "Camión 11", km: 210 },
  { name: "Camión 2", km: 195 },
  { name: "Camión 3", km: 240 },
  { name: "Camión 4", km: 185 },
  { name: "Camión 5", km: 200 },
];

const productividadData = [
  { name: "Conductor A", horas: 8 },
  { name: "Conductor B", horas: 7.5 },
  { name: "Conductor C", horas: 7 },
  { name: "Conductor D", horas: 7 },
  { name: "Conductor E", horas: 8.5 },
];

const menuItems = [
  { label: "Dashboard Admin", path: "/dashboard", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  )},
  { label: "Alertas y Emergencias", path: "/alertas", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  )},
  { label: "Camiones", path: "/camiones", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  )},
  { label: "Conductores", path: "/conductores", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
  { label: "GPS", path: "/gps", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
  )},
  { label: "Tracking GPS", path: "/tracking", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
  )},
  { label: "Registro Jornadas", path: "/RegistroNuevaJornada", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )},
  { label: "Auditoría", path: "/auditoria", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  )},
];

type DashboardCamion = Camion & {
  status?: string;
};

function Dashboard() {
  const [camiones, setCamiones] = useState<DashboardCamion[]>([]);
  const [loading, setLoading] = useState(true);
  const [horaActual, setHoraActual] = useState("");
  const [fechaActual, setFechaActual] = useState("");
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);  

  useEffect(() => {
    const actualizar = () => {
      const ahora = new Date();
      setHoraActual(ahora.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setFechaActual(ahora.toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    };
    actualizar();
    const iv = setInterval(actualizar, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const camiones = await getCamiones();
        setCamiones(camiones);
      } catch (err) {
        console.error("Error cargando unidades:", err);
        setCamiones([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const camionesActivos = camiones.filter((c) => {
    const estado = (c?.estado || c?.status || "").toLowerCase();
    return estado === "activo" || estado === "disponible";
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* ── SIDEBAR ── */}
      <aside className="w-52 shrink-0 bg-slate-900 flex flex-col min-h-screen fixed top-0 left-0 h-full z-20">

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">NANU TECH</p>
            <p className="text-slate-400 text-xs">Gestión de Flota</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="shrink-0 text-current">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sesión activa */}
        <div className="px-4 py-3 border-t border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="text-slate-400">Sesión activa</span>
          </div>
          <p className="text-white text-xs font-semibold mb-3">1h 58m</p>
 
          {/* User + dropdown */}
          <div className="relative">
            {/* Dropdown popup — aparece encima del botón */}
            {menuUsuarioAbierto && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-0.5">Sesión iniciada como</p>
                  <p className="text-sm font-bold text-gray-900">admin1@nanutech.com</p>
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
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
              <div className="min-w-0 text-left">
                <p className="text-white text-xs font-semibold truncate">Carlos Administr...</p>
                <p className="text-slate-400 text-xs truncate">Administrador Gene...</p>
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

      {/* ── MAIN ── */}
      <div className="ml-52 flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-start justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Última actualización</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">

          {/* Section header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo</h2>
              <p className="text-sm text-gray-500 mt-0.5">Resumen general de operaciones y flota</p>
            </div>
            <div className="text-right mt-1">
              <p className="text-xs text-gray-400">Última actualización</p>
              <p className="text-sm font-bold text-gray-800">{horaActual}</p>
              <p className="text-xs text-green-500 flex items-center justify-end gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                Actualizando en tiempo real
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-500 mt-8">Cargando unidades...</p>
          ) : (
            <>
              {/* KPI row 1 */}
              <div className="grid grid-cols-4 gap-4 mt-6">

                {/* Total Camiones */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Camiones</p>
                    <p className="text-3xl font-bold text-gray-900">{camiones.length || 13}</p>
                    <p className="text-xs mt-1.5">
                      <span className="text-gray-500">{camionesActivos.length || 7} en uso</span>
                      <span className="mx-1 text-gray-300">·</span>
                      <span className="text-blue-500">{(camiones.length - camionesActivos.length) || 4} disponibles</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  </div>
                </div>

                {/* Contratos Activos */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Contratos Activos</p>
                    <p className="text-3xl font-bold text-gray-900">12</p>
                    <p className="text-xs mt-1.5">
                      <span className="text-gray-500">18 totales</span>
                      <span className="mx-1 text-gray-300">·</span>
                      <span className="text-red-500">9 por expirar</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  </div>
                </div>

                {/* Alertas Activas */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Alertas Activas</p>
                    <p className="text-3xl font-bold text-red-500">10</p>
                    <p className="text-xs text-gray-500 mt-1.5">1 velocidad</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                </div>

                {/* Ingresos Estimados */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ingresos Estimados</p>
                    <p className="text-3xl font-bold text-purple-600">S/. 0</p>
                    <p className="text-xs text-gray-500 mt-1.5">Contratos activos</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  </div>
                </div>
              </div>

              {/* KPI row 2 */}
              <div className="grid grid-cols-4 gap-4 mt-4">
                {/* Jornadas Completadas */}
                <div className="bg-white border-l-4 border-l-green-500 border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Jornadas Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">22</p>
                  </div>
                </div>

                {/* Jornadas Activas */}
                <div className="bg-white border-l-4 border-l-blue-500 border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Jornadas Activas</p>
                    <p className="text-2xl font-bold text-gray-900">6</p>
                  </div>
                </div>

                {/* Horas Totales */}
                <div className="bg-white border-l-4 border-l-purple-500 border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Horas Totales</p>
                    <p className="text-2xl font-bold text-gray-900">0.0h</p>
                  </div>
                </div>

                {/* Kilómetros Totales */}
                <div className="bg-white border-l-4 border-l-orange-500 border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kilómetros Totales</p>
                    <p className="text-2xl font-bold text-gray-900">29,159</p>
                  </div>
                </div>
              </div>

              {/* Centro de Alertas */}
              <div className="mt-6 bg-white border border-red-200 border-l-4 border-l-red-500 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <h3 className="font-bold text-red-600">Centro de Alertas</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Requieren atención inmediata</p>

                {/* Alerta velocidad */}
                <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <div>
                      <p className="text-sm font-bold text-red-600">Exceso de Velocidad</p>
                      <p className="text-xs text-red-400">1 camiones detectados con velocidad excesiva</p>
                    </div>
                  </div>
                  <button className="border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    Ver GPS
                  </button>
                </div>

                {/* Alerta contratos */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-yellow-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <div>
                      <p className="text-sm font-bold text-yellow-600">Contratos por Expirar</p>
                      <p className="text-xs text-yellow-500">9 contratos expiran en los próximos 30 días</p>
                    </div>
                  </div>
                  <button className="border border-yellow-400 text-yellow-600 text-xs px-3 py-1.5 rounded-lg hover:bg-yellow-50 transition-colors">
                    Ver Contratos
                  </button>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-800 mb-4">Km por Camión</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={kmData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="km" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-800 mb-4">Productividad Conductores</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={productividadData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="horas" fill="#34d399" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
          © 2026 NANU TECH · Sistema de Gestión de Flota de Camiones
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
