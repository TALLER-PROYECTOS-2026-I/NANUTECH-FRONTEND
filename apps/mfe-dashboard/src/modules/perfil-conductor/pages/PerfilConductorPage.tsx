import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MonitoreoSidebar } from '../../monitoreo-camiones/components/MonitoreoSidebar';
import type { ConductorDashboard } from '../../gestión-conductores/types';
import { CamionAsignadoCard } from '../components/CamionAsignadoCard';
import { ConductorHeader } from '../components/ConductorHeader';
import { HistorialJornadas } from '../components/HistorialJornadas';
import { InfoCard } from '../components/InfoCard';
import { StatCard } from '../components/StatCard';
import { useFiltroJornadas } from '../hooks/useFiltroJornadas';
import { usePerfilConductor } from '../hooks/usePerfilConductor';

// ── Iconos SVG inline ────────────────────────────────────────────────────────

function IdIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="16" y1="10" x2="16" y2="14" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <path d="M8 10h.01" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 5.45 5.45l1.52-1.52a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 14.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatFechaCorta(fechaIso: string | undefined): string {
  if (!fechaIso) return '—';
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(fechaIso));
  } catch {
    return fechaIso;
  }
}

// ── Página ───────────────────────────────────────────────────────────────────

export function PerfilConductorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const conductor = (location.state as { conductor?: ConductorDashboard } | null)?.conductor;

  const { estadisticas, jornadas, loading, error } = usePerfilConductor(id ?? '');
  const { filtro, setFiltro, busqueda, setBusqueda, jornadasFiltradas, totales } =
    useFiltroJornadas(jornadas);

  const handleBack = () => navigate('/dashboard/admin/conductores');

  if (!conductor) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <MonitoreoSidebar />
        <div className="ml-52 flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-gray-500">No se encontraron datos del conductor.</p>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Volver al listado
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <MonitoreoSidebar />

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Conductores</h1>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          {/* Breadcrumb + título */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleBack}
              className="mb-1 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Volver al listado
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Perfil del Conductor</h2>
            <p className="text-sm text-gray-400">Vista completa del historial y estadísticas</p>
          </div>

          {/* Header azul del conductor */}
          <ConductorHeader
            nombre={conductor.nombre}
            licencia={conductor.licencia}
            estadoOperacional={conductor.estadoOperacional}
          />

          {/* Tarjetas de info personal */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              label="DNI"
              value={conductor.dni}
              icon={<IdIcon />}
              borderColor="border-blue-400"
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
            />
            <InfoCard
              label="Teléfono"
              value={conductor.contacto}
              icon={<PhoneIcon />}
              borderColor="border-green-400"
              iconBg="bg-green-100"
              iconColor="text-green-600"
            />
            <InfoCard
              label="Email"
              value={conductor.email}
              icon={<MailIcon />}
              borderColor="border-purple-400"
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
            />
            <InfoCard
              label="Contratado"
              value={formatFechaCorta((conductor as ConductorDashboard & { fechaContrato?: string }).fechaContrato)}
              icon={<CalendarIcon />}
              borderColor="border-orange-400"
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>

          {/* Camión asignado */}
          <CamionAsignadoCard placa={conductor.camionAsignado} />

          {/* Estadísticas */}
          {loading ? (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
              ))}
            </div>
          ) : error ? (
            <p className="mb-6 text-sm text-red-500">{error}</p>
          ) : estadisticas ? (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Jornadas"
                value={String(estadisticas.totalJornadas)}
                sublabel={`${estadisticas.jornadasCompletadas} completadas, ${estadisticas.jornadasActivas} activas`}
                icon={<ChartIcon />}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
              />
              <StatCard
                label="Horas Totales"
                value={String(estadisticas.horasTotalesTrabajadas)}
                sublabel="Horas trabajadas"
                icon={<ClockIcon />}
                iconBg="bg-green-100"
                iconColor="text-green-600"
              />
              <StatCard
                label="Promedio/Jornada"
                value={`${estadisticas.promedioHorasPorJornada}h`}
                sublabel="Horas por jornada"
                icon={<TrendIcon />}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
              />
              <StatCard
                label="Estado Actual"
                value={estadisticas.estadoActual}
                sublabel={
                  estadisticas.jornadasActivas > 0
                    ? 'Conductor actualmente en jornada'
                    : 'Sin jornada activa'
                }
                icon={<StatusIcon />}
                iconBg={estadisticas.jornadasActivas > 0 ? 'bg-green-100' : 'bg-gray-100'}
                iconColor={estadisticas.jornadasActivas > 0 ? 'text-green-600' : 'text-gray-500'}
              />
            </div>
          ) : null}

          {/* Historial */}
          <HistorialJornadas
            jornadas={jornadas}
            jornadasFiltradas={jornadasFiltradas}
            filtro={filtro}
            setFiltro={setFiltro}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            totales={totales}
          />
        </main>
      </div>
    </div>
  );
}
