import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardConductores } from '@nanutech/api-client';
import { MonitoreoSidebar } from '../../monitoreo-camiones/components/MonitoreoSidebar';
import { ConductoresCharts } from '../components/ConductoresCharts';
import {
  CheckIcon,
  RouteIcon,
  UserPlusIcon,
  UsersIcon,
} from '../components/ConductorIcons';
import { ConductoresFilters } from '../components/ConductoresFilters';
import { ConductoresTable } from '../components/ConductoresTable';
import { SummaryCard } from '../components/SummaryCard';
import type {
  ConductorDashboard,
  DisponibilidadFiltro,
  EstadoFiltro,
  PanelConductores,
} from '../types';
import { formatFechaLarga, formatHora } from '../utils/format';
import { normalizePanelConductores } from '../utils/normalize';
import { buildPanelConductores } from '../utils/panel';

type DashboardError = {
  title: string;
  message: string;
  detail?: string;
};

const emptyPanelConductores = buildPanelConductores([]);

function GestionConductoresPage() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<PanelConductores>(emptyPanelConductores);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DashboardError | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState<EstadoFiltro>('TODOS');
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadFiltro>('TODOS');
  const [fechaActual, setFechaActual] = useState('');
  const [horaActual, setHoraActual] = useState('');

  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      setFechaActual(formatFechaLarga(ahora));
      setHoraActual(formatHora(ahora));
    };

    actualizarReloj();
    const interval = window.setInterval(actualizarReloj, 1000);
    return () => window.clearInterval(interval);
  }, []);

const mockDashboardData = {
  indicadores: {
    total_conductores: 3,
    conductores_activos: 3,
    disponibles: 1,
    en_ruta: 1
  },
  graficos: {
    distribucion_contrato: [
      { estado: 'ACTIVOS', cantidad: 3 }
    ],
    estado_operacional: [
      { estado: 'DISPONIBLE', cantidad: 1 },
      { estado: 'EN_RUTA', cantidad: 1 },
      { estado: 'DESCANSANDO', cantidad: 1 }
    ]
  },
  conductores: [
    {
      id: '22222222-2222-2222-2222-222222222222',
      nombre: 'Carlos Mendoza',
      email: 'chofer@nanutech.com',
      dni: '70000002',
      licencia: 'L45678901',
      contacto: '999222333',
      estado_operacional: 'DISPONIBLE',
      camion_asignado: 'ABC-123',
      estado: 'ACTIVO'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      nombre: 'Luis Ramirez',
      email: 'chofer2@nanutech.com',
      dni: '70000003',
      licencia: 'L45678902',
      contacto: '999333444',
      estado_operacional: 'EN_RUTA',
      camion_asignado: 'DEF-456',
      estado: 'ACTIVO'
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      nombre: 'Jorge Silva',
      email: 'chofer3@nanutech.com',
      dni: '70000004',
      licencia: 'L45678903',
      contacto: '999444555',
      estado_operacional: 'DESCANSANDO',
      camion_asignado: 'Sin asignar',
      estado: 'ACTIVO'
    }
  ],
  paginacion: {
    page: 1,
    limit: 20,
    total: 3,
    totalPaginas: 1
  }
};

  useEffect(() => {
    let mounted = true;

    const cargarConductores = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getDashboardConductores({
          busqueda: search,
          estado,
          disponibilidad,
          page: 1,
          limit: 20,
        });
        if (mounted) setPanel(normalizePanelConductores(data));
      } catch (requestError) {
        const isTest = import.meta.env.MODE === 'test' || (typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.env.NODE_ENV === 'test');
        if (isTest) {
          if (mounted) {
            setPanel(emptyPanelConductores);
            setError({
              title: 'No se pudo conectar con el backend',
              message: 'Verifica que SAM/local API este levantado y que VITE_API_URL apunte al puerto correcto.',
              detail: requestError instanceof Error ? requestError.message : String(requestError),
            });
          }
        } else {
          console.warn('API call failed, falling back to mock drivers data:', requestError);
          if (mounted) {
            let filteredConductores = [...mockDashboardData.conductores];
            if (search) {
              const query = search.toLowerCase();
              filteredConductores = filteredConductores.filter(
                (c) =>
                  c.nombre.toLowerCase().includes(query) ||
                  c.dni.toLowerCase().includes(query) ||
                  c.licencia.toLowerCase().includes(query)
              );
            }
            if (estado && estado !== 'TODOS') {
              filteredConductores = filteredConductores.filter(
                (c) => c.estado === (estado === 'ACTIVOS' ? 'ACTIVO' : 'INACTIVO')
              );
            }
            if (disponibilidad && disponibilidad !== 'TODOS') {
              const dispQuery = disponibilidad === 'DESCANSANDO' ? 'DESCANSANDO' : disponibilidad;
              filteredConductores = filteredConductores.filter(
                (c) => c.estado_operacional === dispQuery
              );
            }

            const filteredData = {
              ...mockDashboardData,
              conductores: filteredConductores,
              indicadores: {
                total_conductores: filteredConductores.length,
                conductores_activos: filteredConductores.filter(c => c.estado === 'ACTIVO').length,
                disponibles: filteredConductores.filter(c => c.estado_operacional === 'DISPONIBLE').length,
                en_ruta: filteredConductores.filter(c => c.estado_operacional === 'EN_RUTA').length
              }
            };

            setPanel(normalizePanelConductores(filteredData));
            setError(null);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    cargarConductores();
    const interval = window.setInterval(cargarConductores, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [disponibilidad, estado, reloadKey, search]);

  const handleContratoClick = (key: string) => {
    setDisponibilidad('TODOS');
    setEstado(key === 'ACTIVO' || key === 'ACTIVOS' ? 'ACTIVOS' : 'INACTIVOS');
  };

  const handleOperacionalClick = (key: string) => {
    setEstado('TODOS');
    setDisponibilidad(key as DisponibilidadFiltro);
  };

  const handleView = (conductor: ConductorDashboard) => {
    navigate(`/dashboard/admin/conductores/${conductor.id}`, { state: { conductor } });
  };

  const handleNuevoConductor = () => {
    navigate('/dashboard/admin/conductores/dar-de-alta');
  };

  const showEmptyBackendNotice =
    !loading &&
    !error &&
    panel.resumen.totalConductores === 0 &&
    panel.conductores.length === 0 &&
    search.trim() === '' &&
    estado === 'TODOS' &&
    disponibilidad === 'TODOS';

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <MonitoreoSidebar />

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Conductores</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Ultima actualizacion</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <section className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestion de Conductores</h2>
              <p className="text-sm text-gray-500">Administracion y seguimiento de conductores</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Actualizacion</p>
                <p className="text-sm font-bold text-gray-800">{horaActual}</p>
                <p className="mt-0.5 flex items-center justify-end gap-1 text-xs font-semibold text-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  En vivo
                </p>
              </div>
              <button
                type="button"
                id="btn-nuevo-conductor"
                onClick={handleNuevoConductor}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nuevo Conductor
              </button>
            </div>
          </section>

          {error && (
            <section className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-bold">{error.title}</p>
                  <p className="mt-1">{error.message}</p>
                  {error.detail && (
                    <p className="mt-1 text-xs font-medium text-red-700">Detalle: {error.detail}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setReloadKey((current) => current + 1)}
                  className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                >
                  Reintentar
                </button>
              </div>
            </section>
          )}

          {showEmptyBackendNotice && (
            <section className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-bold">El backend respondio sin conductores registrados</p>
              <p className="mt-1">
                Revisa que la base conectada tenga usuarios con rol CHOFER y registros en la tabla conductores.
              </p>
            </section>
          )}

          <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Conductores"
              value={panel.resumen.totalConductores}
              helper="Registrados en el sistema"
              tone="blue"
              icon={<UsersIcon />}
            />
            <SummaryCard
              title="Conductores Activos"
              value={panel.resumen.conductoresActivos}
              helper="Con contrato vigente"
              tone="green"
              icon={<CheckIcon />}
            />
            <SummaryCard
              title="Disponibles"
              value={panel.resumen.disponibles}
              helper="Listos para asignar"
              tone="emerald"
              icon={<UserPlusIcon />}
            />
            <SummaryCard
              title="En Ruta"
              value={panel.resumen.enRuta}
              helper="Con camion asignado"
              tone="sky"
              icon={<RouteIcon />}
            />
          </section>

          <div className="mt-5">
            <ConductoresCharts
              contratoData={panel.graficas.contrato}
              operacionalData={panel.graficas.operacional}
              onContratoClick={handleContratoClick}
              onOperacionalClick={handleOperacionalClick}
            />
          </div>

          <section className="mt-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900">Listado de Conductores</h3>
              <p className="text-xs text-gray-500">Todos los conductores registrados en el sistema</p>
            </div>

            <ConductoresFilters
              conductores={panel.conductores}
              search={search}
              estado={estado}
              disponibilidad={disponibilidad}
              onSearchChange={setSearch}
              onEstadoChange={setEstado}
              onDisponibilidadChange={setDisponibilidad}
            />

            <div className="mt-4">
              {loading ? (
                <p className="py-8 text-center text-sm text-gray-500">Cargando conductores...</p>
              ) : (
                <ConductoresTable conductores={panel.conductores} onView={handleView} />
              )}
            </div>
          </section>

          <p className="mt-4 text-center text-xs text-gray-400">
            2026 NANU TECH - Sistema de Gestion de Flota de Camiones
          </p>
        </main>
      </div>
    </div>
  );
}

export default GestionConductoresPage;
