import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  DashboardGerencialPayload,
  GraficasGerencial,
  HistorialItem,
  OperacionEnProgreso,
  ResumenGeneral,
} from '@nanutech/api-client';

export type DashboardTab = 'resumen' | 'operaciones' | 'rendimiento' | 'historial';
export type TiempoFiltro = 'hoy' | 'semana' | 'mes' | 'todas';

const SECTOR_COLORS: Record<string, string> = {
  COMPLETADA: '#10b981',
  EN_PROCESO: '#3b82f6',
  ACTIVA: '#3b82f6',
  DISPONIBLE: '#10b981',
  EN_RUTA: '#3b82f6',
  EN_USO: '#3b82f6',
  EN_JORNADA: '#3b82f6',
  MANTENIMIENTO: '#f59e0b',
  ACTIVO: '#3b82f6',
  DESCANSO: '#f59e0b',
  DESCANSANDO: '#f59e0b',
};

const SECTOR_LABELS: Record<string, string> = {
  COMPLETADA: 'Completadas',
  EN_PROCESO: 'Activas',
  ACTIVA: 'Activas',
  DISPONIBLE: 'Disponibles',
  EN_RUTA: 'En Ruta',
  EN_USO: 'En Uso',
  EN_JORNADA: 'En Uso',
  MANTENIMIENTO: 'Mantenimiento',
  ACTIVO: 'En Ruta',
  DESCANSO: 'Descansando',
  DESCANSANDO: 'Descansando',
};

export function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export function formatDateTime(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const day = date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  const time = date
    .toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
    .replace(/\s/g, ' ');
  return `${day}, ${time}`;
}

export function formatTime(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date
    .toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })
    .replace(/\s/g, ' ');
}

function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const props = { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 };

  if (name === 'calendar') {
    return (
      <svg {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }
  if (name === 'truck') {
    return (
      <svg {...props}>
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    );
  }
  if (name === 'user') {
    return (
      <svg {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (name === 'file') {
    return (
      <svg {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    );
  }
  if (name === 'clock') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  if (name === 'dollar') {
    return (
      <svg {...props}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );
  }
  if (name === 'trend') {
    return (
      <svg {...props}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
  }
  if (name === 'check-circle') {
    return (
      <svg {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  if (name === 'activity') {
    return (
      <svg {...props}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    );
  }
  if (name === 'search') {
    return (
      <svg {...props}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    );
  }
  if (name === 'download') {
    return (
      <svg {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    );
  }
  if (name === 'grid') {
    return (
      <svg {...props}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    );
  }
  if (name === 'zap') {
    return (
      <svg {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  }
  if (name === 'bar-chart') {
    return (
      <svg {...props}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    );
  }
  if (name === 'list') {
    return (
      <svg {...props}>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    );
  }
  if (name === 'alert') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'blue' | 'green' | 'orange' }) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-amber-50 text-amber-700',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass[tone]}`}>{label}</span>;
}

export function DashboardSkeletonState() {
  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Dashboard de Gerencia</h1>
          <p className="mt-1 text-sm text-slate-500">Preparando informacion operativa de la flota</p>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-right">
          <p className="text-xs font-semibold text-blue-600">Sincronizando</p>
          <p className="mt-1 text-xs text-slate-500">Conectando con backend</p>
        </div>
      </header>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="h-1 w-full overflow-hidden bg-slate-100">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-600" />
        </div>
        <div className="space-y-5 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="h-10 flex-1 animate-pulse rounded-md bg-slate-100" />
            <div className="flex gap-2">
              <div className="h-9 w-16 animate-pulse rounded-md bg-slate-100" />
              <div className="h-9 w-20 animate-pulse rounded-md bg-blue-100" />
              <div className="h-9 w-16 animate-pulse rounded-md bg-slate-100" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-28 animate-pulse rounded-md bg-blue-100" />
            <div className="h-8 w-24 animate-pulse rounded-md bg-slate-100" />
            <div className="h-8 w-28 animate-pulse rounded-md bg-slate-100" />
            <div className="h-8 w-20 animate-pulse rounded-md bg-slate-100" />
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                <div className="h-8 w-12 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-32 animate-pulse rounded-full bg-slate-100" />
              </div>
              <div className="h-11 w-11 animate-pulse rounded-lg bg-blue-50" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-6 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-3 w-28 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-100" />
            <div className="mt-5 h-56 animate-pulse rounded-md border border-dashed border-slate-200 bg-slate-50" />
          </div>
        ))}
      </section>
    </div>
  );
}

export function LoadingDashboardState() {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-blue-600">
          <Icon name="bar-chart" />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-900">Cargando dashboard gerencial</p>
        <p className="mt-1 text-sm text-slate-500">Consultando información actual del backend.</p>
      </div>
    </div>
  );
}

export function ErrorDashboardState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid min-h-[420px] place-items-center rounded-lg border border-red-200 bg-red-50 p-8 text-center shadow-sm">
      <div className="max-w-md">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-red-100 text-red-600">
          <Icon name="alert" />
        </div>
        <p className="mt-4 text-sm font-bold text-red-700">{message}</p>
        <p className="mt-1 text-sm text-red-600">La vista no mostrará datos referenciales para evitar información falsa.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

export function EmptyDashboardState({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`grid place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 ${
        compact ? 'min-h-28' : 'min-h-[320px]'
      }`}
    >
      No hay datos disponibles para el dashboard gerencial.
    </div>
  );
}

export function DashboardHeader({
  estadoSistema,
  ultimaActualizacion,
  currentTime,
}: {
  estadoSistema: string;
  ultimaActualizacion: string;
  currentTime: string;
}) {
  const updateLabel = ultimaActualizacion
    ? formatTime(ultimaActualizacion) !== '-'
      ? formatDateTime(ultimaActualizacion).split(', ').slice(1).join(', ')
      : ultimaActualizacion
    : currentTime;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Dashboard de Gerencia</h1>
          <p className="mt-1 text-sm text-slate-500">
            Supervisión completa y análisis estadístico del sistema de gestión de flota
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-slate-500">Última actualización</p>
          <p className="text-sm font-bold text-slate-900">{updateLabel || currentTime}</p>
          <p className="mt-1 inline-flex items-center justify-end gap-1 text-xs font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {estadoSistema}
          </p>
        </div>
    </header>
  );
}

export function DashboardToolbar({
  query,
  onQueryChange,
  filtro,
  onFiltroChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  filtro: TiempoFiltro;
  onFiltroChange: (value: TiempoFiltro) => void;
}) {
  const filtros: { id: TiempoFiltro; label: string }[] = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mes' },
    { id: 'todas', label: 'Todas' },
  ];

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por ID, conductor o camión..."
          className="w-full rounded-md border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-slate-200 bg-white p-1">
          {filtros.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onFiltroChange(item.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                filtro === item.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled
          title="Backend no expone endpoint de exportación para HU16"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 opacity-70"
        >
          <Icon name="download" className="h-4 w-4" />
          Exportar
        </button>
      </div>
    </div>
  );
}

export function DashboardTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  const tabs: { id: DashboardTab; label: string; icon: string }[] = [
    { id: 'resumen', label: 'Resumen General', icon: 'grid' },
    { id: 'operaciones', label: 'Operaciones', icon: 'zap' },
    { id: 'rendimiento', label: 'Rendimiento', icon: 'bar-chart' },
    { id: 'historial', label: 'Historial', icon: 'list' },
  ];

  return (
    <nav className="mb-5 inline-flex flex-wrap gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Icon name={tab.icon} className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function SummaryMainCard({
  title,
  value,
  badges,
  subtext,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  badges?: { label: string; tone: 'blue' | 'green' | 'orange' }[];
  subtext?: string;
  icon: string;
  tone: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-amber-50 text-amber-600',
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {badges && badges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <StatusBadge key={badge.label} label={badge.label} tone={badge.tone} />
              ))}
            </div>
          )}
          {subtext && <p className="mt-2 text-xs text-slate-500">{subtext}</p>}
        </div>
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${toneClass[tone]}`}>
          <Icon name={icon} />
        </div>
      </div>
    </article>
  );
}

function SummaryMetricCard({
  title,
  value,
  subtext,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: string;
  tone: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-amber-50 text-amber-600',
  };

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{subtext}</p>
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${toneClass[tone]}`}>
          <Icon name={icon} className="h-4 w-4" />
        </div>
      </div>
    </article>
  );
}

function buildSectorData(items: { estado: string; total: string }[]) {
  return items.map((item) => ({
    name: SECTOR_LABELS[item.estado] ?? item.estado,
    value: Number(item.total) || 0,
    color: SECTOR_COLORS[item.estado] ?? '#64748b',
  }));
}

function SectorPieChart({ title, subtitle, data }: { title: string; subtitle: string; data: ReturnType<typeof buildSectorData> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  const renderLabel = (props: unknown) => {
    const { cx, cy, midAngle, outerRadius, name, value, fill } = props as {
      cx?: number;
      cy?: number;
      midAngle?: number;
      outerRadius?: number;
      name?: string;
      value?: number;
      fill?: string;
    };

    const RADIAN = Math.PI / 180;
    const percent = Math.round((Number(value ?? 0) / total) * 100);
    const radius = Number(outerRadius ?? 0) + 34;
    const x = Number(cx ?? 0) + radius * Math.cos(-Number(midAngle ?? 0) * RADIAN);
    const y = Number(cy ?? 0) + radius * Math.sin(-Number(midAngle ?? 0) * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={fill ?? '#334155'}
        textAnchor={x > Number(cx ?? 0) ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${name ?? ''}: ${percent}%`}
      </text>
    );
  };

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div className="h-64">
        {data.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-slate-500">Sin datos disponibles</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 16, right: 88, bottom: 16, left: 88 }}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={72}
                label={renderLabel}
                labelLine={false}
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [Number(value ?? 0), 'Total']} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

function getSectorTotal(items: { estado: string; total: string }[], ...estados: string[]) {
  return items
    .filter((item) => estados.includes(item.estado))
    .reduce((sum, item) => sum + (Number(item.total) || 0), 0);
}

export function ResumenGeneralTab({
  resumen,
  graficas,
}: {
  resumen: ResumenGeneral;
  graficas: GraficasGerencial;
}) {
  const jornadasActivas = resumen.jornadas - resumen.jornadas_completadas;
  const flotaEnUso = getSectorTotal(graficas.sectores_camiones, 'EN_RUTA', 'EN_USO');
  const flotaDisponible = getSectorTotal(graficas.sectores_camiones, 'DISPONIBLE');
  const conductoresEnRuta = getSectorTotal(graficas.sectores_conductores, 'ACTIVO', 'EN_RUTA');
  const conductoresDisponibles = getSectorTotal(graficas.sectores_conductores, 'DESCANSO', 'DESCANSANDO');
  const promedioKm =
    resumen.jornadas > 0 ? Math.round(resumen.km_totales / resumen.jornadas).toLocaleString('es-PE') : '0';

  const jornadasChartData = graficas.jornadas_por_dia.map((item) => ({
    fecha: formatShortDate(item.fecha_jornada),
    jornadas: Number(item.total) || 0,
    km: Number(item.km) || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMainCard
          title="Jornadas"
          value={resumen.jornadas}
          badges={[
            { label: `${jornadasActivas} activas`, tone: 'blue' },
            { label: `${resumen.jornadas_completadas} completadas`, tone: 'green' },
          ]}
          icon="calendar"
          tone="blue"
        />
        <SummaryMainCard
          title="Flota de Camiones"
          value={resumen.flota_activa}
          badges={[
            { label: `${flotaEnUso} en uso`, tone: 'blue' },
            { label: `${flotaDisponible} disponibles`, tone: 'green' },
          ]}
          icon="truck"
          tone="green"
        />
        <SummaryMainCard
          title="Conductores"
          value={resumen.conductores_activos + conductoresDisponibles || resumen.conductores_activos}
          badges={[
            { label: `${conductoresEnRuta || resumen.conductores_activos} en ruta`, tone: 'blue' },
            { label: `${conductoresDisponibles} disponibles`, tone: 'green' },
          ]}
          icon="user"
          tone="purple"
        />
        <SummaryMainCard
          title="Contratos Activos"
          value={resumen.contratos_activos}
          subtext="Contratos vigentes en el periodo"
          icon="file"
          tone="orange"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SummaryMetricCard
          title="Horas Trabajadas"
          value={`${resumen.horas_acumuladas}h`}
          subtext="Total del periodo"
          icon="clock"
          tone="purple"
        />
        <SummaryMetricCard
          title="Ingresos Estimados"
          value={`${resumen.ingresos_estimados.toLocaleString('es-PE')} USD`}
          subtext="Basado en contratos activos"
          icon="dollar"
          tone="orange"
        />
        <SummaryMetricCard
          title="Total Kilómetros"
          value={`${resumen.km_totales.toLocaleString('es-PE')} km`}
          subtext={`Promedio: ${promedioKm} km/jornada`}
          icon="trend"
          tone="green"
        />
        <SummaryMetricCard
          title="Jornadas Completadas"
          value={resumen.jornadas_completadas}
          subtext={`De ${resumen.jornadas} totales`}
          icon="check-circle"
          tone="purple"
        />
        <SummaryMetricCard
          title="Eficiencia"
          value={resumen.eficiencia}
          subtext="Velocidad promedio operativa"
          icon="activity"
          tone="orange"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Jornadas por Día" subtitle="Últimos 14 días con registro">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={jornadasChartData}>
                <defs>
                  <linearGradient id="jornadasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="jornadas" stroke="#3b82f6" fill="url(#jornadasGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Kilómetros por Día" subtitle="Últimos 14 días con registro">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={jornadasChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="km" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectorPieChart
          title="Estado de Jornadas"
          subtitle="Distribución actual"
          data={buildSectorData(graficas.sectores_jornadas)}
        />
        <SectorPieChart
          title="Estado de Camiones"
          subtitle="Disponibilidad de flota"
          data={buildSectorData(graficas.sectores_camiones)}
        />
        <SectorPieChart
          title="Estado de Conductores"
          subtitle="Disponibilidad operativa"
          data={buildSectorData(graficas.sectores_conductores)}
        />
      </div>
    </div>
  );
}

export function OperacionesTab({
  enProgreso,
  camionesMantenimiento,
  conductoresDisponibles,
}: {
  enProgreso: OperacionEnProgreso[];
  camionesMantenimiento: DashboardGerencialPayload['operaciones']['camiones_mantenimiento'];
  conductoresDisponibles: DashboardGerencialPayload['operaciones']['conductores_disponibles'];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <Icon name="zap" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Jornadas Activas Ahora</h3>
            <p className="text-xs text-slate-500">Operaciones en curso - {enProgreso.length} jornadas activas</p>
          </div>
        </div>

        <div className="space-y-3">
          {enProgreso.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No hay jornadas en progreso</p>
          ) : (
            enProgreso.map((item) => (
              <article
                key={item.id}
                className="grid gap-4 rounded-lg border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
              >
                <div>
                  <p className="text-xs text-slate-500">Conductor</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">{item.conductor}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Camión</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">{item.camion}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Inicio</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">{formatTime(item.hora_inicio)}</p>
                </div>
                <StatusBadge label="En Progreso" tone="blue" />
              </article>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <Icon name="alert" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Camiones en Mantenimiento</h3>
              <p className="text-xs text-slate-500">{camionesMantenimiento.length} unidades</p>
            </div>
          </div>
          <div className="space-y-3">
            {camionesMantenimiento.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No hay camiones en mantenimiento</p>
            ) : (
              camionesMantenimiento.map((camion) => (
                <div
                  key={camion.placa}
                  className="flex items-center justify-between rounded-lg bg-amber-50/70 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    {camion.placa} {camion.marca} {camion.modelo}
                  </p>
                  <StatusBadge label="Mantenimiento" tone="orange" />
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <Icon name="check-circle" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Conductores Disponibles</h3>
              <p className="text-xs text-slate-500">{conductoresDisponibles.length} disponibles</p>
            </div>
          </div>
          {conductoresDisponibles.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No hay conductores disponibles</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {conductoresDisponibles.map((conductor) => (
                <span
                  key={conductor.nombre}
                  className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
                >
                  {conductor.nombre}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const tone =
    rank === 1
      ? 'bg-amber-100 text-amber-700'
      : rank === 2
        ? 'bg-slate-200 text-slate-700'
        : rank === 3
          ? 'bg-orange-100 text-orange-700'
          : 'bg-slate-100 text-slate-600';

  return (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${tone}`}>{rank}</span>
  );
}

export function RendimientoTab({ data }: { data: DashboardGerencialPayload['rendimiento'] }) {
  const topConductores = data.top_conductores_km.slice(0, 5);
  const topCamiones = data.top_camiones_uso.slice(0, 5);

  const productividadData = topConductores.map((item) => ({
    nombre: item.conductor.split(' ')[0] ?? item.conductor,
    km: Number(item.km_totales) || 0,
  }));

  const eficienciaData = topCamiones.map((item) => ({
    placa: item.placa,
    promedio: Number(item.usos) > 0 ? Math.round(Number(item.km_totales) / Number(item.usos)) : 0,
  }));

  const comparativaData = topConductores.map((item, index) => {
    const camion = topCamiones[index];
    const jornadas = Number(camion?.usos) || 0;
    const km = Number(item.km_totales) || 0;
    return {
      nombre: item.conductor.split(' ')[0] ?? item.conductor,
      jornadas,
      promedioKm: jornadas > 0 ? Math.round(km / jornadas) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Top Conductores por Kilómetros" subtitle="Mejores desempeños del periodo">
          <div className="mt-2 space-y-3">
            {topConductores.map((item, index) => (
              <div key={item.conductor} className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-0">
                <RankBadge rank={index + 1} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.conductor}</p>
                  <p className="text-xs text-slate-500">Jornadas completadas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{Number(item.km_totales).toLocaleString('es-PE')} km</p>
                  <p className="text-xs text-slate-500">
                    Prom: {Math.round(Number(item.km_totales) / 10).toLocaleString('es-PE')} km
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Top Camiones por Uso" subtitle="Unidades más utilizadas">
          <div className="mt-2 space-y-3">
            {topCamiones.map((item, index) => (
              <div key={item.placa} className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-0">
                <RankBadge rank={index + 1} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.placa}</p>
                  <p className="text-xs text-slate-500">{item.usos} jornadas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{Number(item.km_totales).toLocaleString('es-PE')} km</p>
                  <p className="text-xs text-slate-500">
                    Prom:{' '}
                    {Number(item.usos) > 0
                      ? Math.round(Number(item.km_totales) / Number(item.usos)).toLocaleString('es-PE')
                      : 0}{' '}
                    km
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Productividad por Conductor" subtitle="Comparativa de kilómetros recorridos">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productividadData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="nombre" width={80} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="km" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Eficiencia por Unidad (Placa)" subtitle="Comparativa por camión">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eficienciaData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="placa" width={80} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="promedio" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Comparativa: Jornadas vs Promedio por Conductor" subtitle="Análisis de productividad y eficiencia">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparativaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="jornadas" name="Total Jornadas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="promedioKm" name="Promedio KM" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

export function EstadoBadge({ estado }: { estado: string }) {
  const normalized = estado.toUpperCase();
  const isCompletada = normalized.includes('COMPLET');
  const isProgreso = normalized.includes('PROCESO') || normalized.includes('ACTIV') || normalized.includes('CURSO');

  if (isCompletada) {
    return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Completada</span>;
  }
  if (isProgreso) {
    return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Activa</span>;
  }
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{estado}</span>;
}

export function HistorialTab({ historial }: { historial: HistorialItem[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <Icon name="list" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Historial Completo de Jornadas</h3>
            <p className="text-xs text-slate-500">Mostrando {historial.length} jornadas</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Conductor</th>
              <th className="px-5 py-3">Camión</th>
              <th className="px-5 py-3">Inicio</th>
              <th className="px-5 py-3">Fin</th>
              <th className="px-5 py-3">KM</th>
              <th className="px-5 py-3">Duración</th>
              <th className="px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-3 font-medium text-slate-700">#{item.id}</td>
                <td className="px-5 py-3 text-slate-800">{item.conductor}</td>
                <td className="px-5 py-3 text-slate-800">{item.camion}</td>
                <td className="px-5 py-3 text-slate-600">{formatDateTime(item.hora_inicio)}</td>
                <td className="px-5 py-3 text-slate-600">{formatDateTime(item.hora_fin)}</td>
                <td className="px-5 py-3 text-slate-800">{item.km_recorridos ? `${item.km_recorridos} km` : '-'}</td>
                <td className="px-5 py-3 text-slate-800">
                  {item.horas_duracion ? `${parseFloat(item.horas_duracion).toFixed(0)}h` : '-'}
                </td>
                <td className="px-5 py-3">
                  <EstadoBadge estado={item.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
