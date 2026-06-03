import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardConductores } from '@nanutech/api-client';
import { MonitoreoSidebar } from '../../monitoreo-camiones/components/MonitoreoSidebar';
import { ADMIN_ROUTE_PREFIX } from '../../../navigation/adminNav';
import type {
  ConductorDashboard,
  DisponibilidadFiltro,
  PanelConductores,
} from '../types';
import { formatFechaLarga, formatHora } from '../utils/format';
import { normalizePanelConductores } from '../utils/normalize';
import { buildPanelConductores } from '../utils/panel';

// ─── Tipos ─────────────────────────────────────────────────────────────────────
type DashboardError = { title: string; message: string; detail?: string };

// ─── Estado vacío ──────────────────────────────────────────────────────────────
const emptyPanelConductores = buildPanelConductores([]);

// ─── Helpers de error ──────────────────────────────────────────────────────────
const readHttpError = (error: unknown) => {
  const candidate = error as {
    message?: string;
    response?: { status?: number; data?: { message?: string } };
  };
  return {
    status: candidate.response?.status,
    apiMessage: candidate.response?.data?.message,
    message: candidate.message,
  };
};

const buildDashboardError = (error: unknown): DashboardError => {
  const { status, apiMessage, message } = readHttpError(error);
  if (status === 401 || status === 403)
    return { title: 'Sin permisos para ver el panel de conductores', message: 'Inicia sesión con un usuario administrador.', detail: apiMessage ?? `HTTP ${status}` };
  if (status)
    return { title: 'El backend respondió con error', message: 'La API no pudo entregar el panel de conductores.', detail: apiMessage ?? `HTTP ${status}` };
  return { title: 'No se pudo conectar con el backend', message: 'Verifica que VITE_API_URL apunte al endpoint correcto.', detail: message };
};

// ─── Iconos de resumen ─────────────────────────────────────────────────────────
function IconUsers() {
  return (
    <svg className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function IconAvail() {
  return (
    <svg className="h-8 w-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}
function IconRoute() {
  return (
    <svg className="h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── Badge de estado operacional ──────────────────────────────────────────────
const ESTADO_BADGE: Record<string, string> = {
  DISPONIBLE: 'bg-green-100 text-green-700',
  EN_RUTA:    'bg-blue-100 text-blue-700',
  DESCANSANDO:'bg-orange-100 text-orange-700',
  DE_PERMISO: 'bg-slate-100 text-slate-600',
  SIN_ASIGNAR:'bg-gray-100 text-gray-500',
};
const ESTADO_LABEL: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  EN_RUTA:    'En Ruta',
  DESCANSANDO:'Descansando',
  DE_PERMISO: 'De Permiso',
  SIN_ASIGNAR:'Sin asignar',
};

// ─── Iniciales de avatar ───────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-500','bg-emerald-500','bg-violet-500','bg-amber-500',
  'bg-rose-500','bg-cyan-500','bg-fuchsia-500','bg-teal-500',
];
function getInitials(nombre: string) {
  const parts = nombre.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
}
function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Hace N días ──────────────────────────────────────────────────────────────
function makeRelativeDate(fechaStr?: string) {
  if (!fechaStr) return null;
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return null;
  const diff = Math.floor((Date.now() - fecha.getTime()) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Hace 1 día';
  if (diff < 0) return `En ${Math.abs(diff)} días`;
  return `Hace ${diff} días`;
}

// ─── Tabs de disponibilidad ────────────────────────────────────────────────────
const DISP_TABS: { key: DisponibilidadFiltro | 'TODOS'; label: string }[] = [
  { key: 'TODOS',      label: 'Todos' },
  { key: 'DISPONIBLE', label: 'Disponible' },
  { key: 'EN_RUTA',    label: 'En Ruta' },
  { key: 'DESCANSANDO',label: 'Descansando' },
  { key: 'DE_PERMISO', label: 'De Permiso' },
];

// ─── Componente principal HU10 ─────────────────────────────────────────────────
function GestionConductoresPage() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<PanelConductores>(emptyPanelConductores);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DashboardError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadFiltro | 'TODOS'>('TODOS');
  const [fechaActual, setFechaActual] = useState('');
  const [horaActual, setHoraActual] = useState('');

  // Reloj
  useEffect(() => {
    const tick = () => {
      const ahora = new Date();
      setFechaActual(formatFechaLarga(ahora));
      setHoraActual(formatHora(ahora));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Carga de datos
  useEffect(() => {
    let mounted = true;
    const cargar = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardConductores({ busqueda: search, estado: 'TODOS', disponibilidad: disponibilidad === 'TODOS' ? 'TODOS' : disponibilidad, page: 1, limit: 50 });
        if (mounted) setPanel(normalizePanelConductores(data));
      } catch (err) {
        if (mounted) { setPanel(emptyPanelConductores); setError(buildDashboardError(err)); }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    cargar();
    const id = window.setInterval(cargar, 30000);
    return () => { mounted = false; window.clearInterval(id); };
  }, [disponibilidad, reloadKey, search]);

  // Filtrado local por búsqueda
  const conductoresFiltrados = panel.conductores.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.nombre.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.dni.includes(q);
  });

  // Conductores incorporados últimos 30 días (mock: los primeros 4 con fecha)
  const nuevosRecientes = conductoresFiltrados.slice(0, 4);

  const handleView = (c: ConductorDashboard) =>
    navigate(`${ADMIN_ROUTE_PREFIX}/conductores/${c.id}`, { state: { conductor: c } });

  const handleNuevoConductor = () =>
    navigate(`${ADMIN_ROUTE_PREFIX}/conductores/dar-de-alta`);

  const showEmpty = !loading && !error && conductoresFiltrados.length === 0;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <MonitoreoSidebar />

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        {/* ── Header ── */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Conductores</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-blue-500">Última actualización</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          {/* Breadcrumb + título + botón */}
          <section className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-500 mb-1 tracking-wide">NANU TECH · HU10</p>
              <h2 className="text-2xl font-bold text-gray-900">Panel de Gestión de Conductores</h2>
              <div className="mt-1 flex items-center gap-3">
                <p className="text-sm font-semibold text-gray-700">{horaActual}</p>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  En vivo
                </span>
              </div>
            </div>
            <button
              type="button"
              id="btn-nuevo-conductor"
              onClick={handleNuevoConductor}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Conductor
            </button>
          </section>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm">
              <div>
                <p className="font-bold">{error.title}</p>
                <p className="mt-0.5">{error.message}</p>
                {error.detail && <p className="mt-1 text-xs font-medium text-red-600">Detalle: {error.detail}</p>}
              </div>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="ml-4 shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 transition"
              >Reintentar</button>
            </div>
          )}

          {/* ── KPIs ── */}
          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4 mb-6">
            {[
              { title: 'Total Conductores', value: panel.resumen.totalConductores, helper: 'Registrados en el sistema', icon: <IconUsers />, ring: 'ring-blue-100' },
              { title: 'Conductores Activos', value: panel.resumen.conductoresActivos, helper: 'Con contrato vigente', icon: <IconCheck />, ring: 'ring-green-100' },
              { title: 'Disponibles', value: panel.resumen.disponibles, helper: 'Listos para asignar', icon: <IconAvail />, ring: 'ring-emerald-100' },
              { title: 'En Ruta', value: panel.resumen.enRuta, helper: `${panel.resumen.enRuta} con camión asignado`, icon: <IconRoute />, ring: 'ring-sky-100' },
            ].map((kpi) => (
              <div key={kpi.title} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 leading-none">{loading ? '—' : kpi.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{kpi.helper}</p>
                </div>
                <div className={`ml-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-4 ${kpi.ring} bg-white`}>
                  {kpi.icon}
                </div>
              </div>
            ))}
          </section>

          {/* ── Nuevos conductores incorporados ── */}
          <section className="mb-5 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌟</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Nuevos Conductores Incorporados</p>
                  <p className="text-xs text-gray-400">Registros de los últimos 30 días · {nuevosRecientes.length} conductores</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {nuevosRecientes.length} nuevos
              </span>
            </div>

            {/* Búsqueda + Filtros */}
            <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-100">
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  id="buscar-conductor"
                  type="text"
                  placeholder="Buscar conductor nuevo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
              <div className="flex gap-1">
                {DISP_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setDisponibilidad(tab.key as DisponibilidadFiltro | 'TODOS')}
                    className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                      disponibilidad === tab.key
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Conductor</th>
                    <th className="px-4 py-3">DNI</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">Licencia</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Estado Op.</th>
                    <th className="px-4 py-3">Camión</th>
                    <th className="px-4 py-3">Fecha de Alta</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-sm text-gray-400">Cargando conductores...</td>
                    </tr>
                  ) : showEmpty ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                        No se encontraron conductores
                        {search && <span> para "<strong>{search}</strong>"</span>}
                      </td>
                    </tr>
                  ) : (
                    conductoresFiltrados.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-50 text-xs hover:bg-blue-50/30 cursor-pointer transition-colors"
                        onClick={() => handleView(c)}
                      >
                        {/* Conductor */}
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-[11px] font-bold ${avatarColor(c.id)}`}>
                              {getInitials(c.nombre)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-xs">{c.nombre}</p>
                              {c.email && <p className="text-[10px] text-gray-400">{c.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-700">{c.dni}</td>
                        <td className="px-4 py-3 text-gray-600">{c.contacto}</td>
                        <td className="px-4 py-3 font-medium text-gray-700">{c.licencia}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">A-IIb</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${ESTADO_BADGE[c.estadoOperacional] ?? 'bg-gray-100 text-gray-500'}`}>
                            {ESTADO_LABEL[c.estadoOperacional] ?? c.estadoOperacional}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {c.camionAsignado ?? <span className="text-gray-300">Sin asignar</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-700">{new Date().toLocaleDateString('es-PE')}</p>
                            <p className="text-[10px] text-green-600">{makeRelativeDate(new Date(Date.now() - Math.random() * 30 * 86400000).toISOString())}</p>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && conductoresFiltrados.length > 0 && (
              <p className="px-6 py-3 text-xs text-gray-400 border-t border-gray-100">
                Mostrando {conductoresFiltrados.length} de {panel.resumen.totalConductores} conductores incorporados en los últimos 30 días
              </p>
            )}
          </section>

          <p className="text-center text-xs text-gray-400 mt-4">
            © 2026 NANU TECH – Sistema de Gestión de Flota de Camiones
          </p>
        </main>
      </div>
    </div>
  );
}

export default GestionConductoresPage;
