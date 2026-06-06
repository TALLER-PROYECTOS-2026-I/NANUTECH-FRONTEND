import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  exportAuditoriaAccesosCsv,
  getAuditoriaAccesos,
  getAuditoriaResumen,
} from '@nanutech/api-client';
import type { AuditLogItem, AuditoriaResumen } from '@nanutech/api-client';
import { MonitoreoSidebar } from '../../monitoreo-camiones/components/MonitoreoSidebar';

// Estado base sin datos mockeados para que la HU13 dependa solo del backend.
const EMPTY_RESUMEN: AuditoriaResumen = {
  metricas: {
    total_accesos: 0,
    accesos_hoy: 0,
    accesos_semana: 0,
    usuarios_unicos: 0,
    ips_unicas: 0,
  },
  progreso_roles: {
    ADMINISTRADOR: 0,
    GERENTE: 0,
    CHOFER: 0,
  },
};

// Formatea la fecha de cabecera del modulo en formato DD/MM/YYYY.
const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// Formatea la hora de cabecera en formato 24 horas HH:MM:SS.
const formatTime = (date: Date) => {
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${min}:${ss}`;
};

// Descarga un Blob como archivo local desde el navegador.
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Pinta el color de la etiqueta del rol segun las reglas de negocio de HU13.
const roleBadgeClass = (rol: AuditLogItem['rol']) => {
  if (rol === 'Administrador') return 'bg-red-50 text-red-700 border-red-200';
  if (rol === 'Gerente') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (rol === 'Conductor') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

// Renderiza una tarjeta de metrica superior del panel de auditoria.
function MetricCard({
  title,
  value,
  helper,
  tone,
  children,
}: {
  title: string;
  value: number;
  helper: string;
  tone: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className={`rounded-lg p-1.5 ${tone}`}>{children}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <p className="mt-1 text-xs text-gray-400">{helper}</p>
    </div>
  );
}

// Renderiza una barra de progreso para accesos por rol.
function RoleProgress({
  label,
  value,
  total,
  colorClass,
  badgeClass,
}: {
  label: string;
  value: number;
  total: number;
  colorClass: string;
  badgeClass: string;
}) {
  const percent = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className={`rounded border px-2 py-0.5 text-xs font-bold ${badgeClass}`}>
          {value} de {total}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-100">
        <div className={`h-3 rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// Orquesta la HU13: resumen, filtros en backend, tabla cronologica y exportacion CSV.
export default function AuditoriaAccesosPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [resumen, setResumen] = useState<AuditoriaResumen>(EMPTY_RESUMEN);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [fechaActual, setFechaActual] = useState('');
  const [horaActual, setHoraActual] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Mantiene la fecha y hora visible actualizada en la cabecera.
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setFechaActual(formatDate(now));
      setHoraActual(formatTime(now));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Consulta metricas globales y registros filtrados directamente al backend.
  const fetchAuditoria = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    setErrorMessage('');

    try {
      const [resumenData, registrosData] = await Promise.all([
        getAuditoriaResumen(),
        getAuditoriaAccesos({ search: searchTerm, rol: roleFilter }),
      ]);

      setResumen(resumenData);
      setLogs(registrosData);
    } catch (err) {
      console.error('Error al consultar auditoria de accesos:', err);
      setResumen(EMPTY_RESUMEN);
      setLogs([]);
      setErrorMessage('No se pudo cargar la auditoria de accesos desde el servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Ejecuta la carga inicial y vuelve a consultar cuando cambian busqueda o rol.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchAuditoria(false);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchTerm, roleFilter]);

  // Cuenta roles desde el resumen real del backend para las barras de progreso.
  const roleCounts = useMemo(() => ({
    Administrador: resumen.progreso_roles.ADMINISTRADOR || 0,
    Gerente: resumen.progreso_roles.GERENTE || 0,
    Conductor: resumen.progreso_roles.CHOFER || 0,
  }), [resumen.progreso_roles]);

  // Descarga el CSV oficial del backend usando los filtros actuales.
  const handleExport = async () => {
    try {
      const blob = await exportAuditoriaAccesosCsv({ search: searchTerm, rol: roleFilter });
      downloadBlob(blob, 'reporte_auditoria.csv');
    } catch (err) {
      console.error('Error al exportar auditoria:', err);
      setErrorMessage('No se pudo exportar el reporte de auditoria.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <MonitoreoSidebar />

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Auditoria</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Ultima actualizacion</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <section className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Auditoria de Accesos</h2>
            <p className="text-sm text-gray-500">
              Registro inmutable de los inicios de sesion con metricas de uso y deteccion de anomalias.
            </p>
          </section>

          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div>
              <span className="font-bold">Registros Inmutables - Solo Lectura:</span> La informacion de inicios de sesion recopilada en este modulo tiene fines estrictamente de auditoria y seguridad. No puede ser editada, modificada ni eliminada del sistema.
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard title="Total Accesos" value={resumen.metricas.total_accesos} helper="Ingresos historicos" tone="bg-gray-100 text-gray-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6" />
                <path d="M10 14L21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            </MetricCard>

            <MetricCard title="Accesos Hoy" value={resumen.metricas.accesos_hoy} helper="En las ultimas 24 horas" tone="bg-blue-50 text-blue-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </MetricCard>

            <MetricCard title="Accesos Esta Semana" value={resumen.metricas.accesos_semana} helper="Ultimos 7 dias" tone="bg-purple-50 text-purple-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </MetricCard>

            <MetricCard title="Usuarios Unicos" value={resumen.metricas.usuarios_unicos} helper="Cuentas activas ingresadas" tone="bg-indigo-50 text-indigo-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </MetricCard>

            <MetricCard title="IPs Unicas" value={resumen.metricas.ips_unicas} helper="Direcciones IP registradas" tone="bg-emerald-50 text-emerald-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </MetricCard>
          </section>

          <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Ingresos por Rol</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <RoleProgress label="Administrador" value={roleCounts.Administrador} total={resumen.metricas.total_accesos} colorClass="bg-red-500" badgeClass="bg-red-50 text-red-700 border-red-200" />
              <RoleProgress label="Gerente" value={roleCounts.Gerente} total={resumen.metricas.total_accesos} colorClass="bg-blue-500" badgeClass="bg-blue-50 text-blue-700 border-blue-200" />
              <RoleProgress label="Conductor" value={roleCounts.Conductor} total={resumen.metricas.total_accesos} colorClass="bg-emerald-500" badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200" />
            </div>
          </section>

          <section className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Buscar por usuario, email o ID..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="w-full sm:w-48">
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Todos">Todos los roles</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Conductor">Conductor</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fetchAuditoria(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-55"
              >
                <svg className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Actualizar
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Exportar CSV
              </button>
            </div>
          </section>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">
                <svg className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Cargando historial de accesos...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No se encontraron registros de auditoria que coincidan con la busqueda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
                      <th className="px-4 py-3.5">ID Registro</th>
                      <th className="px-4 py-3.5">Usuario</th>
                      <th className="px-4 py-3.5">Email</th>
                      <th className="px-4 py-3.5">Rol</th>
                      <th className="px-4 py-3.5">Fecha</th>
                      <th className="px-4 py-3.5">Hora</th>
                      <th className="px-4 py-3.5">Direccion IP</th>
                      <th className="px-4 py-3.5">Navegador / SO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-gray-500">{log.id}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{log.usuario}</td>
                        <td className="px-4 py-3 text-gray-600">{log.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded border px-2 py-0.5 text-xs font-bold ${roleBadgeClass(log.rol)}`}>
                            {log.rol}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{log.fecha}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{log.hora}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{log.ip}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{log.navegador}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            2026 NANU TECH - Sistema de Gestion de Flota de Camiones
          </p>
        </main>
      </div>
    </div>
  );
}
