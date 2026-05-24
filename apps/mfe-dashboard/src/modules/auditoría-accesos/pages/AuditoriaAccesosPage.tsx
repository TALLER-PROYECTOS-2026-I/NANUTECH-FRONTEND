import { useEffect, useMemo, useState } from 'react';
import { getAuditoriaAccesos } from '@nanutech/api-client';
import type { AuditLogItem } from '@nanutech/api-client';
import { MonitoreoSidebar } from '../../monitoreo-camiones/components/MonitoreoSidebar';
import { auditoriaMock } from '../mocks/auditoriaMock';
import { exportarAuditoriaCsv } from '../utils/csv';

export default function AuditoriaAccesosPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>(auditoriaMock);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [fechaActual, setFechaActual] = useState('');
  const [horaActual, setHoraActual] = useState('');

  // Clock effect for page header (HH:MM:SS format and DD/MM/YYYY date)
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, '0');
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const yyyy = now.getFullYear();
      setFechaActual(`${dd}/${mm}/${yyyy}`);

      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setHoraActual(`${hh}:${min}:${ss}`);
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const fetchLogs = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const data = await getAuditoriaAccesos();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching audit logs, falling back to mock data:', err);
      setLogs(auditoriaMock);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    getAuditoriaAccesos()
      .then((data) => {
        if (active) {
          setLogs(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching audit logs, falling back to mock data:', err);
        if (active) {
          setLogs(auditoriaMock);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Filter logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesRole = roleFilter === 'Todos' || log.rol === roleFilter;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        log.id.toLowerCase().includes(searchLower) ||
        log.usuario.toLowerCase().includes(searchLower) ||
        log.email.toLowerCase().includes(searchLower) ||
        log.ip.toLowerCase().includes(searchLower) ||
        log.navegador.toLowerCase().includes(searchLower);

      return matchesRole && matchesSearch;
    });
  }, [logs, searchTerm, roleFilter]);

  // Dynamic calculations for cards
  const metrics = useMemo(() => {
    const total = logs.length;
    
    // Parse helper function to parse "DD/MM/YYYY" to Date
    const parseFechaStr = (str: string) => {
      const [d, m, y] = str.split('/').map(Number);
      return new Date(y, m - 1, d);
    };

    // Accesses today
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const hoy = logs.filter(log => log.fecha === todayStr).length;

    // Accesses this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    const estaSemana = logs.filter(log => {
      try {
        const d = parseFechaStr(log.fecha);
        return d >= oneWeekAgo && d <= today;
      } catch {
        return false;
      }
    }).length;

    const usuariosUnicos = new Set(logs.map(log => log.email.toLowerCase())).size;
    const ipsUnicas = new Set(logs.map(log => log.ip)).size;

    return { total, hoy, estaSemana, usuariosUnicos, ipsUnicas };
  }, [logs]);

  // Counts for progress bars
  const roleCounts = useMemo(() => {
    const counts = {
      Administrador: 0,
      Gerente: 0,
      Conductor: 0,
    };
    logs.forEach(log => {
      if (log.rol in counts) {
        counts[log.rol as keyof typeof counts]++;
      }
    });
    return counts;
  }, [logs]);

  const handleExport = () => {
    exportarAuditoriaCsv(filteredLogs);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <MonitoreoSidebar />

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Auditoría</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Última actualización</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-8 py-6">
          {/* Page Title & Subtitle */}
          <section className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Auditoría de Accesos</h2>
            <p className="text-sm text-gray-500">
              Registro inmutable de los inicios de sesión con métricas de uso y detección de anomalías.
            </p>
          </section>

          {/* Immutable Alert Banner */}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div>
              <span className="font-bold">Registros Inmutables - Solo Lectura:</span> La información de inicios de sesión recopilada en este módulo tiene fines estrictamente de auditoría y seguridad. No puede ser editada, modificada ni eliminada del sistema.
            </div>
          </div>

          {/* Summary Cards */}
          <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Total Accesos */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Total Accesos</span>
                <span className="rounded-lg bg-gray-100 p-1.5 text-gray-600">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6" />
                    <path d="M10 14L21 3" />
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{metrics.total}</div>
              <p className="text-xs text-gray-400 mt-1">Ingresos históricos</p>
            </div>

            {/* Accesos Hoy */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Accesos Hoy</span>
                <span className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{metrics.hoy}</div>
              <p className="text-xs text-gray-400 mt-1">En las últimas 24 horas</p>
            </div>

            {/* Accesos Esta Semana */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Accesos Esta Semana</span>
                <span className="rounded-lg bg-purple-50 p-1.5 text-purple-600">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{metrics.estaSemana}</div>
              <p className="text-xs text-gray-400 mt-1">Últimos 7 días</p>
            </div>

            {/* Usuarios Únicos */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Usuarios Únicos</span>
                <span className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{metrics.usuariosUnicos}</div>
              <p className="text-xs text-gray-400 mt-1">Cuentas activas ingresadas</p>
            </div>

            {/* IPs Únicas */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">IPs Únicas</span>
                <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{metrics.ipsUnicas}</div>
              <p className="text-xs text-gray-400 mt-1">Direcciones IP registradas</p>
            </div>
          </section>

          {/* Role Progress Bars Section */}
          <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ingresos por Rol</h3>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Administradores */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold text-gray-700">Administrador</span>
                  <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 border border-red-200">
                    {roleCounts.Administrador} de {metrics.total}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.total > 0 ? (roleCounts.Administrador / metrics.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Gerentes */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold text-gray-700">Gerente</span>
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                    {roleCounts.Gerente} de {metrics.total}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.total > 0 ? (roleCounts.Gerente / metrics.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Conductores */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold text-gray-700">Conductor</span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    {roleCounts.Conductor} de {metrics.total}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.total > 0 ? (roleCounts.Conductor / metrics.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Filters Area */}
          <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search input */}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Role filter dropdown */}
              <div className="w-full sm:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="Todos">Todos los roles</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Conductor">Conductor</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => fetchLogs(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white py-2 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-55"
              >
                <svg className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Actualizar
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 py-2 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Exportar CSV
              </button>
            </div>
          </section>

          {/* Data Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">
                <svg className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Cargando historial de accesos...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No se encontraron registros de auditoría que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-700">
                      <th className="py-3.5 px-4">ID Registro</th>
                      <th className="py-3.5 px-4">Usuario</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Rol</th>
                      <th className="py-3.5 px-4">Fecha</th>
                      <th className="py-3.5 px-4">Hora</th>
                      <th className="py-3.5 px-4">Dirección IP</th>
                      <th className="py-3.5 px-4">Navegador / SO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredLogs.map((log) => {
                      // Get custom classes for roles
                      let roleBadgeClass = '';
                      if (log.rol === 'Administrador') {
                        roleBadgeClass = 'bg-red-50 text-red-700 border-red-200';
                      } else if (log.rol === 'Gerente') {
                        roleBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                      } else {
                        roleBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      }

                      return (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-xs text-gray-500">{log.id}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{log.usuario}</td>
                          <td className="py-3 px-4 text-gray-600">{log.email}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold border ${roleBadgeClass}`}>
                              {log.rol}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{log.fecha}</td>
                          <td className="py-3 px-4 font-mono text-gray-600">{log.hora}</td>
                          <td className="py-3 px-4 font-mono text-xs text-gray-600">{log.ip}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{log.navegador}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            2026 NANU TECH - Sistema de Gestión de Flota de Camiones
          </p>
        </main>
      </div>
    </div>
  );
}
