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
import { initialPanelConductores } from '../mocks/conductoresMock';
import type {
  ConductorDashboard,
  DisponibilidadFiltro,
  EstadoFiltro,
  PanelConductores,
} from '../types';
import { formatFechaLarga, formatHora } from '../utils/format';
import { normalizePanelConductores } from '../utils/normalize';

// Pantalla principal de HU10: panel centralizado de gestion de conductores.
function GestionConductoresPage() {
  // Permite navegar hacia la ficha individual HU20 cuando se presiona "Ver".
  const navigate = useNavigate();
  // Guarda KPIs, graficas y conductores normalizados para renderizar toda la vista.
  const [panel, setPanel] = useState<PanelConductores>(initialPanelConductores);
  // Controla el texto de carga mientras se consulta el backend.
  const [loading, setLoading] = useState(true);
  // Texto enviado al backend como query param busqueda.
  const [search, setSearch] = useState('');
  // Filtro de estado contractual: TODOS, ACTIVOS o INACTIVOS.
  const [estado, setEstado] = useState<EstadoFiltro>('TODOS');
  // Filtro operacional: DISPONIBLE, EN_RUTA, DESCANSANDO, etc.
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadFiltro>('TODOS');
  // Fecha visible en el encabezado.
  const [fechaActual, setFechaActual] = useState('');
  // Hora visible como "Ultima actualizacion".
  const [horaActual, setHoraActual] = useState('');

  // Mantiene actualizado el reloj de cabecera cada segundo.
  useEffect(() => {
    // Calcula fecha y hora usando formato local Peru.
    const actualizarReloj = () => {
      const ahora = new Date();
      setFechaActual(formatFechaLarga(ahora));
      setHoraActual(formatHora(ahora));
    };

    // Inicializa el reloj inmediatamente para no mostrar campos vacios.
    actualizarReloj();
    // Refresca el reloj sin volver a consultar el backend.
    const interval = window.setInterval(actualizarReloj, 1000);
    // Limpia el intervalo cuando el componente se desmonta.
    return () => window.clearInterval(interval);
  }, []);

  // Carga resumen y listado cada vez que cambian filtros o busqueda.
  useEffect(() => {
    // Evita setState si la promesa termina despues de desmontar el componente.
    let mounted = true;

    // Consulta el api-client, normaliza la respuesta y actualiza el panel.
    const cargarConductores = async () => {
      setLoading(true);

      try {
        // El backend real separa /resumen y /listado; esta funcion los une.
        const data = await getDashboardConductores({
          busqueda: search,
          estado,
          disponibilidad,
          page: 1,
          limit: 20,
        });
        // Solo actualiza estado si el componente sigue montado.
        if (mounted) setPanel(normalizePanelConductores(data));
      } catch {
        // Si backend no responde, deja mocks para que la pantalla siga usable.
        if (mounted) setPanel(initialPanelConductores);
      } finally {
        // Cierra el estado de carga tanto en exito como en error.
        if (mounted) setLoading(false);
      }
    };

    // Carga inicial con los filtros actuales.
    cargarConductores();
    // Refresca datos periodicamente para simular monitoreo en vivo.
    const interval = window.setInterval(cargarConductores, 30000);

    // Cancela actualizaciones pendientes y el polling al cambiar filtros/desmontar.
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [disponibilidad, estado, search]);

  // Drill-down desde la grafica de contratos hacia el filtro Activos/Inactivos.
  const handleContratoClick = (key: string) => {
    // Al filtrar por contrato se limpia disponibilidad para evitar cruces confusos.
    setDisponibilidad('TODOS');
    // Backend espera ACTIVO(S) como ACTIVOS; cualquier otro segmento cae en INACTIVOS.
    setEstado(key === 'ACTIVO' || key === 'ACTIVOS' ? 'ACTIVOS' : 'INACTIVOS');
  };

  // Drill-down desde la grafica operacional hacia el filtro de disponibilidad.
  const handleOperacionalClick = (key: string) => {
    // Al filtrar por disponibilidad se limpia estado contractual.
    setEstado('TODOS');
    // La key viene de la grafica y coincide con el enum de disponibilidad.
    setDisponibilidad(key as DisponibilidadFiltro);
  };

  // Navega a la futura ficha individual del conductor HU20.
  const handleView = (conductor: ConductorDashboard) => {
    navigate(`/dashboard/admin/conductores/${conductor.id}`);
  };

  // Layout completo: sidebar, cabecera, KPIs, graficas y tabla.
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar reutilizado del dashboard admin para mantener navegacion consistente. */}
      <MonitoreoSidebar />

      {/* Contenedor principal desplazado por el sidebar fijo. */}
      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        {/* Cabecera superior con fecha y hora de actualizacion. */}
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
          {/* Titulo funcional de la HU10. */}
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

          {/* Tarjetas resumen alimentadas por /conductores/dashboard/resumen. */}
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

          {/* Graficas interactivas; sus clicks actualizan filtros de backend. */}
          <div className="mt-5">
            <ConductoresCharts
              contratoData={panel.graficas.contrato}
              operacionalData={panel.graficas.operacional}
              onContratoClick={handleContratoClick}
              onOperacionalClick={handleOperacionalClick}
            />
          </div>

          {/* Tabla de conductores alimentada por /conductores/dashboard/listado. */}
          <section className="mt-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900">Listado de Conductores</h3>
              <p className="text-xs text-gray-500">Todos los conductores registrados en el sistema</p>
            </div>

            {/* Controles que actualizan los query params enviados al backend. */}
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
              {/* Mientras llega la respuesta, se evita mostrar una tabla desactualizada. */}
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
