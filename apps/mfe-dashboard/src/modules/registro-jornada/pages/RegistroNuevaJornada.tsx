import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getJornadas } from "@nanutech/api-client";
import {
  ADMIN_DASHBOARD_HOME,
  adminNavItems,
  adminNavLinkClassName,
} from "../../../navigation/adminNav";

type Jornada = {
  id: string;
  fecha: string;
  conductor: string;
  camion: string;
  contrato: string;
  horario: string;
  km: number;
  estado: string;
  observaciones?: string;
};

const ACTIVE_JOURNEY_STATES = new Set(["ACTIVA", "REGISTRADA", "PENDIENTE", "EN_PROCESO"]);

const normalizeJourneyState = (estado?: string) => (estado || "").toUpperCase();

const isActiveJourney = (estado?: string) => ACTIVE_JOURNEY_STATES.has(normalizeJourneyState(estado));

const isCompletedJourney = (estado?: string) => normalizeJourneyState(estado) === "COMPLETADA";

function RegistroNuevaJornada() {
  const navigate = useNavigate();
  const location = useLocation();

  const fechaActual = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [horaActual, setHoraActual] = useState("");

  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [filtroObs, setFiltroObs] = useState("todas");
  const [successMessage, setSuccessMessage] = useState("");
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);  

  useEffect(() => {
    const actualizar = () => {
      setHoraActual(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true }));
    };
    actualizar();
    const iv = setInterval(actualizar, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const message = (location.state as { successMessage?: string } | null)?.successMessage;
    if (!message) return;

    setSuccessMessage(message);
    const timeout = setTimeout(() => setSuccessMessage(""), 9000);
    return () => clearTimeout(timeout);
  }, [location.state]);

  useEffect(() => {
  const load = async () => {
    try {
      const res = await getJornadas();
      setJornadas(res as Jornada[]);
    } catch (err) {
      console.error("Error cargando jornadas:", err);
      setJornadas([]);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);

  const total = jornadas.length;
  const activas = jornadas.filter((j) => isActiveJourney(j.estado)).length;
  const completadas = jornadas.filter((j) => isCompletedJourney(j.estado)).length;
  const totalKm = jornadas.reduce((acc, j) => acc + Number(j.km || 0), 0);

  const jornadasFiltradas = jornadas.filter((j) => {
    const estadoOk =
      filtroEstado === "todas" ||
      (filtroEstado === "activa" && isActiveJourney(j.estado)) ||
      (filtroEstado === "completada" && isCompletedJourney(j.estado));

    const obsOk =
      filtroObs === "todas" ||
      (filtroObs === "con" && !!j.observaciones?.trim()) ||
      (filtroObs === "sin" && !j.observaciones?.trim());

    const texto = busqueda.toLowerCase();
    const busquedaOk =
      texto === "" ||
      j.id?.toString().toLowerCase().includes(texto) ||
      j.fecha?.toLowerCase().includes(texto) ||
      j.conductor?.toLowerCase().includes(texto) ||
      j.camion?.toLowerCase().includes(texto) ||
      j.contrato?.toLowerCase().includes(texto) ||
      j.estado?.toLowerCase().includes(texto);

    return estadoOk && obsOk && busquedaOk;
  });

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Filter button helper
  const filterBtn = (active: boolean, onClick: () => void, children: React.ReactNode) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
        active
          ? "bg-slate-800 text-white border-slate-800"
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );

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
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === ADMIN_DASHBOARD_HOME}
              className={({ isActive }) =>
                adminNavLinkClassName(isActive, item.accentWhenActive)
              }
            >
              <span className="shrink-0 text-current">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sesión + usuario */}
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
            <h1 className="text-lg font-bold text-gray-900">Registro Jornadas</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Última actualización</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">

          {/* Page heading + CTA */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Registro de Jornadas Laborales</h2>
              <p className="text-sm text-gray-500 mt-0.5">Gestión y seguimiento de jornadas de trabajo</p>
            </div>
            <button
              onClick={() => navigate("../registro-jornada")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Nueva Jornada
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Total Jornadas */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Jornadas</p>
                <p className="text-3xl font-bold text-gray-900">{total}</p>
                <p className="text-xs text-gray-400 mt-1">Registros acumulados</p>
              </div>
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
            </div>

            {/* Jornadas Activas */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Jornadas Activas</p>
                <p className="text-3xl font-bold text-gray-900">{activas}</p>
                <p className="text-xs text-gray-400 mt-1">En curso ahora</p>
              </div>
              <div className="w-14 h-14 bg-teal-400 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
            </div>

            {/* Completadas */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Completadas</p>
                <p className="text-3xl font-bold text-gray-900">{completadas}</p>
                <p className="text-xs text-gray-400 mt-1">Finalizadas con éxito</p>
              </div>
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
            </div>

            {/* Total KM */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total KM</p>
                <p className="text-3xl font-bold text-purple-600">{totalKm.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Kilómetros acumulados</p>
              </div>
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
            </div>
          </div>

          {/* Table card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-base font-bold text-gray-900 mb-0.5">Jornadas Registradas</h3>
            <p className="text-sm text-gray-500 mb-4">Historial completo de jornadas laborales</p>

            {/* Search */}
            <div className="relative mb-4">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
                placeholder="Buscar por conductor, camión, contrato, ruta u observaciones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {/* Estado label */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Estado:
              </div>
              {filterBtn(filtroEstado === "todas", () => setFiltroEstado("todas"),
                <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Todas ({total})</>
              )}
              {filterBtn(filtroEstado === "activa", () => setFiltroEstado("activa"),
                <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Activas ({activas})</>
              )}
              {filterBtn(filtroEstado === "completada", () => setFiltroEstado("completada"),
                <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Completadas ({completadas})</>
              )}

              <div className="mx-2 h-5 border-l border-gray-200" />

              {/* Observaciones label */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Observaciones:
              </div>
              {filterBtn(filtroObs === "todas", () => setFiltroObs("todas"), "Todas")}
              {filterBtn(filtroObs === "con", () => setFiltroObs("con"),
                <><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Con Observaciones ({jornadas.filter(j => !!j.observaciones?.trim()).length})</>
              )}
              {filterBtn(filtroObs === "sin", () => setFiltroObs("sin"), "Sin Observaciones")}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">ID Jornada</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Fecha</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Conductor</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Camión</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Contrato</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Horario</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Kilómetros</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">Estado</th>
                    <th className="text-left text-xs font-semibold text-gray-500 pb-3">Observ.</th>
                  </tr>
                </thead>
                <tbody>
                  {jornadasFiltradas.map((j, i) => (
                    <tr
                      key={j.id || i}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        j.observaciones?.trim() ? "bg-orange-50 hover:bg-orange-50" : ""
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3 pr-4">
                        <span className="text-blue-600 font-semibold text-xs">{j.id}</span>
                      </td>

                      {/* Fecha */}
                      <td className="py-3 pr-4 text-gray-700">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {j.fecha}
                        </span>
                      </td>

                      {/* Conductor */}
                      <td className="py-3 pr-4 text-gray-700">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          {j.conductor}
                        </span>
                      </td>

                      {/* Camión */}
                      <td className="py-3 pr-4 text-gray-700">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                          {j.camion}
                        </span>
                      </td>

                      {/* Contrato */}
                      <td className="py-3 pr-4">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span className="text-gray-700">{j.contrato}</span>
                        </span>
                      </td>

                      {/* Horario */}
                      <td className="py-3 pr-4 text-gray-700 text-xs">{j.horario}</td>

                      {/* KM */}
                      <td className="py-3 pr-4">
                        <span className="text-blue-500 font-semibold text-xs">{j.km} km</span>
                      </td>

                      {/* Estado */}
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isActiveJourney(j.estado)
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {j.estado}
                        </span>
                      </td>

                      {/* Obs */}
                      <td className="py-3">
                        {j.observaciones?.trim() ? (
                          <span className="flex items-center gap-1 text-orange-500 text-xs font-semibold">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Si
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {jornadasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center text-gray-400 py-8 text-sm">
                        No se encontraron jornadas con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
          © 2026 NANU TECH · Sistema de Gestión de Flota de Camiones
        </footer>
      </div>
    </div>
  );
}

export default RegistroNuevaJornada;
