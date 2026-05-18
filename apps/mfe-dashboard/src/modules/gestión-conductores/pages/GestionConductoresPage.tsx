import { useEffect, useMemo, useState } from 'react';
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
import { initialPanelConductores } from '../mocks/conductoresMock';
import type {
  ConductorDashboard,
  DisponibilidadFiltro,
  EstadoFiltro,
  PanelConductores,
} from '../types';
import { formatFechaLarga, formatHora, normalizeText } from '../utils/format';
import { normalizePanelConductores } from '../utils/normalize';

function GestionConductoresPage() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<PanelConductores>(initialPanelConductores);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    let mounted = true;

    const cargarConductores = async () => {
      try {
        const data = await getDashboardConductores();
        if (mounted) setPanel(normalizePanelConductores(data));
      } catch {
        if (mounted) setPanel(initialPanelConductores);
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
  }, []);

  const conductoresFiltrados = useMemo(() => {
    const texto = normalizeText(search);

    return panel.conductores.filter((conductor) => {
      const coincideBusqueda =
        !texto ||
        normalizeText(conductor.nombre).includes(texto) ||
        normalizeText(conductor.dni).includes(texto) ||
        normalizeText(conductor.licencia).includes(texto);

      const coincideEstado =
        estado === 'TODOS' ||
        (estado === 'ACTIVOS' && conductor.activo) ||
        (estado === 'INACTIVOS' && !conductor.activo);

      const coincideDisponibilidad =
        disponibilidad === 'TODOS' ||
        conductor.estadoOperacional === disponibilidad;

      return coincideBusqueda && coincideEstado && coincideDisponibilidad;
    });
  }, [disponibilidad, estado, panel.conductores, search]);

  const handleContratoClick = (key: string) => {
    setDisponibilidad('TODOS');
    setEstado(key === 'ACTIVO' ? 'ACTIVOS' : 'INACTIVOS');
  };

  const handleOperacionalClick = (key: string) => {
    setEstado('TODOS');
    setDisponibilidad(key as DisponibilidadFiltro);
  };

  const handleView = (conductor: ConductorDashboard) => {
    navigate(`/dashboard/admin/conductores/${conductor.id}`);
  };

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
            <div className="text-right">
              <p className="text-xs text-gray-400">Actualizacion</p>
              <p className="text-sm font-bold text-gray-800">{horaActual}</p>
              <p className="mt-0.5 flex items-center justify-end gap-1 text-xs font-semibold text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                En vivo
              </p>
            </div>
          </section>

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
                <ConductoresTable conductores={conductoresFiltrados} onView={handleView} />
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
