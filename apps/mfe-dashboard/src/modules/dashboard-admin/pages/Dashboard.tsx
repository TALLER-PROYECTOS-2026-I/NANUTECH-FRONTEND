import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getCamiones,
  getDashboard,
  type Camion,
  type DashboardDetalleCamion,
  type DashboardPayload,
  type GraficaItem,
  type TopCamion,
} from "@nanutech/api-client";
import {
  ADMIN_DASHBOARD_HOME,
  adminNavItems,
  adminNavLinkClassName,
} from "../../../navigation/adminNav";
import { AdminSidebarSession } from "../../../components/AdminSidebarSession";

type DashboardCamion = Camion & { status?: string };

type ChartSlice = {
  name: string;
  value: number;
  color: string;
};

type DetailCamion = {
  unidad: string;
  placa: string;
  modelo: string;
  estado: string;
  jornadas: number;
  horas: number;
  kilometros: number;
  eficiencia: number;
};

type DashboardIconName =
  | "truck"
  | "file"
  | "alert"
  | "dollar"
  | "check"
  | "pulse"
  | "clock"
  | "send";

// Estado vacio usado cuando la API aun carga o cuando falla una peticion.
const EMPTY_DASHBOARD: DashboardPayload = {
  kpis: {
    totalCamiones: 0,
    contratosActivos: 0,
    alertasActivas: 0,
    ingresos: 0,
    jornadasCompletadas: 0,
    jornadasActivas: 0,
    horasTotales: 0,
    kilometrosTotales: 0,
  },
  alertas: {
    alertasActivas: [],
    contratosPorExpirar: [],
  },
  graficas: {
    gps: [],
    camiones: [],
  },
  topCamiones: [],
  detalleCamiones: [],
  contratos: [],
};

// Traduce los estados tecnicos del GPS a etiquetas visibles para el administrador.
const GPS_STATE_LABEL: Record<string, string> = {
  MOVIENDO: "En Ruta",
  EN_RUTA: "En Ruta",
  DETENIDO: "Detenido",
  EXCESO_VELOCIDAD: "Exceso Vel.",
};

// Mantiene los colores oficiales de los estados GPS solicitados por la HU12.
const GPS_STATE_COLOR: Record<string, string> = {
  MOVIENDO: "#10b981",
  EN_RUTA: "#10b981",
  DETENIDO: "#f97316",
  EXCESO_VELOCIDAD: "#ef4444",
};

// Traduce los estados tecnicos de unidades a etiquetas del dashboard.
const CAMION_STATE_LABEL: Record<string, string> = {
  EN_JORNADA: "En Uso",
  EN_USO: "En Uso",
  ACTIVO: "En Uso",
  DISPONIBLE: "Disponible",
  MANTENIMIENTO: "Mantenimiento",
  INACTIVO: "Inactivo",
};

// Mantiene los colores oficiales de disponibilidad de camiones.
const CAMION_STATE_COLOR: Record<string, string> = {
  EN_JORNADA: "#10b981",
  EN_USO: "#10b981",
  ACTIVO: "#10b981",
  DISPONIBLE: "#3b82f6",
  MANTENIMIENTO: "#f97316",
  INACTIVO: "#94a3b8",
};

// Normaliza valores que llegan del backend para comparar estados sin errores por espacios o minusculas.
const normalizeState = (value?: string) => (value || "").trim().toUpperCase();

// Formatea la fecha de cabecera usando idioma local de Peru.
const formatDate = (date: Date) =>
  date.toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Formatea la hora de ultima actualizacion visible en la cabecera.
const formatTime = (date: Date) =>
  date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

// Muestra kilometros del resumen conservando decimales cuando el backend los entrega.
const formatKilometersSummary = (value: number) =>
  value.toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

// Muestra horas sin forzar redondeo visual; respeta hasta dos decimales del backend.
const formatBackendDecimal = (value: number) =>
  value.toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

// Formatea ingresos y tarifas usando la moneda solicitada en los disenos.
const formatMoney = (value: number) =>
  `S/. ${value.toLocaleString("es-PE", { maximumFractionDigits: 2 })}`;

// Convierte fechas ISO del backend a una fecha corta para las tarjetas de contratos.
const formatShortDate = (value?: string) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Convierte los arreglos de graficas del backend en segmentos compatibles con Recharts.
const chartFromGrafica = (
  items: GraficaItem[] = [],
  labels: Record<string, string>,
  colors: Record<string, string>,
): ChartSlice[] =>
  items.map((item) => {
    const state = normalizeState(item.estado || item.tipo_evento);

    return {
      name: labels[state] || state || "Sin estado",
      value: Number(item.porcentaje ?? item.total ?? item.total_estados ?? 0),
      color: colors[state] || "#64748b",
    };
  });

// Obtiene los kilometros del camion contemplando nombres antiguos y nuevos del backend.
const topCamionKilometros = (item: TopCamion) => Number(item.kilometros ?? item.km ?? 0);

// Prepara el ranking Top 6 para la grafica de barras de rendimiento.
const buildTopChartData = (items: TopCamion[] = []) =>
  items.slice(0, 6).map((item, index) => ({
    name: item.placa || `U-${index + 1}`,
    kilometros: topCamionKilometros(item),
    horas: Number(item.horas ?? 0),
  }));

// Construye la tabla detallada con datos directos del backend o con camiones + topCamiones si aun no llega detalleCamiones.
const buildDetalleCamiones = (
  dashboard: DashboardPayload,
  camiones: DashboardCamion[],
): DetailCamion[] => {
  if (dashboard.detalleCamiones?.length) {
    return dashboard.detalleCamiones.map((item: DashboardDetalleCamion) => ({
      unidad: item.unidad,
      placa: item.placa,
      modelo: item.modelo || "Sin modelo",
      estado: item.estado || "SIN_ESTADO",
      jornadas: Number(item.jornadas || 0),
      horas: Number(item.horas || 0),
      kilometros: Number(item.kilometros || 0),
      eficiencia: Number(item.eficiencia || 0),
    }));
  }

  const topByPlate = new Map(
    (dashboard.topCamiones || []).map((item) => [item.placa || item.unidad, item]),
  );

  return camiones.map((camion) => {
    const top = topByPlate.get(camion.placa) || topByPlate.get(camion.id);
    const kilometros = top ? topCamionKilometros(top) : 0;
    const horas = Number(top?.horas ?? 0);

    return {
      unidad: camion.id,
      placa: camion.placa,
      modelo: [camion.marca, camion.modelo].filter(Boolean).join(" ") || "Sin modelo",
      estado: camion.estado || camion.status || "DISPONIBLE",
      jornadas: 0,
      horas,
      kilometros,
      eficiencia: horas === 0 ? 0 : Number((kilometros / horas).toFixed(2)),
    };
  });
};

// Renderiza iconos SVG locales para no depender de texto o fuentes externas.
function DashboardIcon({ name }: { name: DashboardIconName }) {
  const commonProps = {
    className: "h-7 w-7",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "truck") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="6" width="11" height="9" rx="1.5" />
        <path d="M14 9h3.5l2.5 3v3h-6" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    );
  }

  if (name === "file") {
    return (
      <svg {...commonProps}>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </svg>
    );
  }

  if (name === "alert") {
    return (
      <svg {...commonProps}>
        <path d="M12 4 21 20H3z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (name === "dollar") {
    return (
      <svg {...commonProps}>
        <path d="M12 2v20" />
        <path d="M17 6H9.5a3 3 0 0 0 0 6H14a3 3 0 0 1 0 6H6" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16.5 8" />
      </svg>
    );
  }

  if (name === "pulse") {
    return (
      <svg {...commonProps}>
        <path d="M3 12h4l2-7 4 14 2-7h6" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4z" />
    </svg>
  );
}

// Renderiza la navegacion lateral del dashboard admin usando la configuracion compartida.
function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-20 flex h-full min-h-screen w-52 shrink-0 flex-col bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-700 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">NANU TECH</p>
          <p className="text-xs text-slate-400">Gestion de Flota</p>
        </div>
      </div>

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

      <AdminSidebarSession />
    </aside>
  );
}

// Renderiza una tarjeta principal de KPI del dashboard ejecutivo.
function SummaryCard({
  title,
  value,
  helper,
  tone,
  icon,
}: {
  title: string;
  value: string | number;
  helper: string;
  tone: "blue" | "green" | "red" | "purple" | "orange";
  icon: ReactNode;
}) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  }[tone];

  return (
    <article className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className={`mt-2 text-3xl font-black ${tone === "red" ? "text-red-600" : "text-gray-950"}`}>{value}</p>
        <p className="mt-2 text-xs text-gray-500">{helper}</p>
      </div>
      <span className={`grid h-12 w-12 place-items-center rounded-lg ${toneClasses}`}>{icon}</span>
    </article>
  );
}

// Renderiza una tarjeta compacta del resumen operativo de jornadas.
function OperationalCard({
  title,
  value,
  tone,
  icon,
}: {
  title: string;
  value: string | number;
  tone: "green" | "blue" | "purple" | "orange";
  icon: ReactNode;
}) {
  const classes = {
    green: "border-l-emerald-500 text-emerald-600",
    blue: "border-l-blue-500 text-blue-600",
    purple: "border-l-purple-500 text-purple-600",
    orange: "border-l-orange-500 text-orange-600",
  }[tone];

  return (
    <article className={`flex items-center gap-4 rounded-lg border border-l-4 border-gray-200 bg-white p-4 shadow-sm ${classes}`}>
      <span className="shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-black text-gray-950">{value}</p>
      </div>
    </article>
  );
}

// Renderiza una grafica circular con fallback visual cuando no hay datos del backend.
function PiePanel({ title, subtitle, data }: { title: string; subtitle: string; data: ChartSlice[] }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-950">{title}</h3>
      <p className="text-xs text-gray-500">{subtitle}</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length ? data : [{ name: "Sin datos", value: 100, color: "#e5e7eb" }]}
              dataKey="value"
              nameKey="name"
              outerRadius={78}
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {(data.length ? data : [{ color: "#e5e7eb" }]).map((entry, index) => (
                <Cell key={`slice-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// Renderiza el badge de estado de camion con colores consistentes por disponibilidad.
function StateBadge({ estado }: { estado: string }) {
  const normalized = normalizeState(estado);
  const label = CAMION_STATE_LABEL[normalized] || estado || "Sin estado";
  const classes =
    normalized === "DISPONIBLE"
      ? "bg-blue-100 text-blue-700"
      : normalized === "MANTENIMIENTO"
        ? "bg-orange-100 text-orange-700"
        : normalized === "INACTIVO"
          ? "bg-slate-100 text-slate-600"
          : "bg-emerald-100 text-emerald-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${classes}`}>
      {label}
    </span>
  );
}

// Orquesta la carga del dashboard ejecutivo, refresco en vivo y render de todas las secciones HU12.
export default function Dashboard() {
  const navigate = useNavigate();
  const contratosSectionRef = useRef<HTMLElement | null>(null);
  const [camiones, setCamiones] = useState<DashboardCamion[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardPayload>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [horaActual, setHoraActual] = useState("");
  const [fechaActual, setFechaActual] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setHoraActual(formatTime(now));
      setFechaActual(formatDate(now));
    };

    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const [units, dashboard] = await Promise.all([getCamiones(), getDashboard()]);
        if (!mounted) return;

        setCamiones(units);
        setDashboardData({ ...EMPTY_DASHBOARD, ...dashboard });
      } catch (err) {
        console.error("Error cargando dashboard admin:", err);
        if (!mounted) return;

        setCamiones([]);
        setDashboardData(EMPTY_DASHBOARD);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    const interval = window.setInterval(loadDashboard, 10000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const kpis = dashboardData.kpis || EMPTY_DASHBOARD.kpis;
  const alertas = dashboardData.alertas || EMPTY_DASHBOARD.alertas;
  const contratos = dashboardData.contratos || [];
  const contratosPorExpirar = alertas.contratosPorExpirar || [];
  const alertasVelocidad = alertas.alertasActivas || [];
  const graficas = dashboardData.graficas || EMPTY_DASHBOARD.graficas;
  const topChartData = useMemo(() => buildTopChartData(dashboardData.topCamiones), [dashboardData.topCamiones]);
  const detallesCamiones = useMemo(
    () => buildDetalleCamiones(dashboardData, camiones),
    [dashboardData, camiones],
  );
  const gpsChartData = useMemo(
    () => chartFromGrafica(graficas.gps, GPS_STATE_LABEL, GPS_STATE_COLOR),
    [graficas.gps],
  );
  const camionesChartData = useMemo(
    () => chartFromGrafica(graficas.camiones, CAMION_STATE_LABEL, CAMION_STATE_COLOR),
    [graficas.camiones],
  );

  const totalCamiones = kpis.totalCamiones ?? camiones.length;
  const contratosActivos = kpis.contratosActivos ?? contratos.length;
  const alertasActivas = kpis.alertasActivas ?? alertasVelocidad.length;
  const ingresosEstimados = kpis.ingresos ?? 0;
  const jornadasCompletadas = kpis.jornadasCompletadas ?? 0;
  const jornadasActivas = kpis.jornadasActivas ?? 0;
  const horasTotales = kpis.horasTotales ?? 0;
  const kilometrosTotales = kpis.kilometrosTotales ?? 0;
  const enUso =
    graficas.camiones?.find((item) => ["EN_JORNADA", "EN_USO", "ACTIVO"].includes(normalizeState(item.estado)))?.total ??
    detallesCamiones.filter((item) => ["EN_JORNADA", "EN_USO", "ACTIVO"].includes(normalizeState(item.estado))).length;
  const disponibles =
    graficas.camiones?.find((item) => normalizeState(item.estado) === "DISPONIBLE")?.total ??
    detallesCamiones.filter((item) => normalizeState(item.estado) === "DISPONIBLE").length;
  const scrollToContratos = () => {
    const section = contratosSectionRef.current;
    if (!section) return;

    const headerOffset = 96;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: sectionTop - headerOffset, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Ultima actualizacion</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-950">Dashboard Ejecutivo</h2>
              <p className="text-sm text-gray-500">Resumen general de operaciones y flota</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Ultima actualizacion</p>
              <p className="text-sm font-bold text-gray-800">{horaActual}</p>
              <p className="mt-1 flex items-center justify-end gap-1 text-xs text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Actualizando en tiempo real
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-8 text-sm font-semibold text-slate-500">Cargando dashboard ejecutivo...</p>
          ) : (
            <>
              <section className="mt-6 grid gap-4 lg:grid-cols-4">
                <SummaryCard
                  title="Total Camiones"
                  value={totalCamiones}
                  helper={`${enUso} en uso - ${disponibles} disponibles`}
                  tone="blue"
                  icon={<DashboardIcon name="truck" />}
                />
                <SummaryCard
                  title="Contratos Activos"
                  value={contratosActivos}
                  helper={`${contratos.length} totales - ${contratosPorExpirar.length} por expirar`}
                  tone="green"
                  icon={<DashboardIcon name="file" />}
                />
                <SummaryCard
                  title="Alertas Activas"
                  value={alertasActivas}
                  helper={`${alertasVelocidad.length} velocidad`}
                  tone="red"
                  icon={<DashboardIcon name="alert" />}
                />
                <SummaryCard
                  title="Ingresos Estimados"
                  value={formatMoney(ingresosEstimados)}
                  helper="Contratos activos"
                  tone="purple"
                  icon={<DashboardIcon name="dollar" />}
                />
              </section>

              <section className="mt-4 grid gap-4 lg:grid-cols-4">
                <OperationalCard
                  title="Jornadas Completadas"
                  value={jornadasCompletadas}
                  tone="green"
                  icon={<DashboardIcon name="check" />}
                />
                <OperationalCard
                  title="Jornadas Activas"
                  value={jornadasActivas}
                  tone="blue"
                  icon={<DashboardIcon name="pulse" />}
                />
                <OperationalCard
                  title="Horas Totales"
                  value={`${formatBackendDecimal(horasTotales)}h`}
                  tone="purple"
                  icon={<DashboardIcon name="clock" />}
                />
                <OperationalCard
                  title="Kilometros Totales"
                  value={formatKilometersSummary(kilometrosTotales)}
                  tone="orange"
                  icon={<DashboardIcon name="send" />}
                />
              </section>

              <section className="mt-6 rounded-lg border border-red-200 border-l-4 border-l-red-500 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-red-600">Centro de Alertas</h3>
                  <p className="text-xs text-gray-500">Requieren atencion inmediata</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-red-600">Exceso de Velocidad</p>
                      <p className="text-xs text-red-500">
                        {alertasVelocidad.length} camiones detectados con velocidad excesiva
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/admin/gps")}
                      className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      Ver GPS
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-yellow-700">Contratos por Expirar</p>
                      <p className="text-xs text-yellow-600">
                        {contratosPorExpirar.length} contratos expiran en los proximos 30 dias
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={scrollToContratos}
                      className="rounded-md border border-yellow-400 bg-white px-3 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-50"
                    >
                      Ver Contratos
                    </button>
                  </div>
                </div>
              </section>

              <section className="mt-6 grid gap-6 lg:grid-cols-2">
                <PiePanel
                  title="Estado GPS en Tiempo Real"
                  subtitle="Distribucion actual del estado de los camiones"
                  data={gpsChartData}
                />
                <PiePanel
                  title="Estado Operativo de Camiones"
                  subtitle="Distribucion por estado de disponibilidad"
                  data={camionesChartData}
                />
              </section>

              <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-950">Rendimiento de Camiones - Top 6</h3>
                <p className="text-xs text-gray-500">Kilometros y horas de operacion por placa</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="kilometros" name="Kilometros" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="horas" name="Horas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section
                id="resumen-contratos-activos"
                ref={contratosSectionRef}
                className="mt-6 scroll-mt-24 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-sm font-bold text-gray-950">Estadisticas Detalladas por Camion</h3>
                <p className="text-xs text-gray-500">Rendimiento completo de cada unidad</p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-slate-500">
                        <th className="px-4 py-3">Camion</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-center">Jornadas</th>
                        <th className="px-4 py-3 text-center">Horas</th>
                        <th className="px-4 py-3 text-center">Kilometros</th>
                        <th className="px-4 py-3 text-center">Eficiencia (km/h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detallesCamiones.map((camion) => (
                        <tr key={camion.unidad || camion.placa} className="border-b border-gray-100">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                                <DashboardIcon name="truck" />
                              </span>
                              <div>
                                <p className="font-bold text-slate-800">{camion.placa}</p>
                                <p className="text-xs text-slate-500">{camion.modelo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><StateBadge estado={camion.estado} /></td>
                          <td className="px-4 py-3 text-center font-semibold">{camion.jornadas}</td>
                          <td className="px-4 py-3 text-center font-semibold">{formatBackendDecimal(camion.horas)}h</td>
                          <td className="px-4 py-3 text-center font-semibold">{formatKilometersSummary(camion.kilometros)} km</td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              {formatBackendDecimal(camion.eficiencia)} km/h
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-950">Resumen de Contratos Activos</h3>
                <p className="text-xs text-gray-500">Resumen de contratos en operacion</p>
                <div className="mt-4 space-y-3">
                  {contratos.slice(0, 5).map((contrato) => {
                    const isExpiring = contratosPorExpirar.some((item) => item.id === contrato.id);

                    return (
                      <article
                        key={contrato.id}
                        className={`rounded-lg border px-4 py-3 ${isExpiring ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-black text-slate-800">{contrato.id}</p>
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Activo</span>
                              {isExpiring && (
                                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-bold text-white">Por Expirar</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600">{contrato.cliente}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatMoney(contrato.tarifa)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Vence</p>
                            <p className="text-xs font-bold text-red-500">{formatShortDate(contrato.fecha_fin)}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {contrato.camionesAsignados ?? 0} camiones asignados
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => window.location.assign("/dashboard/contratos")}
                  className="mt-4 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Ver todos los contratos ({contratos.length})
                </button>
              </section>
            </>
          )}
        </main>

        <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
          2026 NANU TECH - Sistema de Gestion de Flota de Camiones
        </footer>
      </div>
    </div>
  );
}
