import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  crearCamionHu11,
  descargarCamionesHu11Csv,
  getPanelCamionesHu11,
  type CamionHu11,
  type CrearCamionHu11Payload,
  type EstadoCamionHu11,
  type PanelCamionesHu11,
} from "@nanutech/api-client";

const menuItems = [
  { label: "Dashboard Admin", path: "/dashboard", icon: "grid" },
  { label: "Alertas y Emergencias", path: "/alertas", icon: "alert" },
  { label: "Camiones", path: "/camiones", icon: "truck" },
  { label: "Conductores", path: "/conductores", icon: "user" },
  { label: "GPS", path: "/gps", icon: "pin" },
  { label: "Tracking GPS", path: "/tracking", icon: "route" },
  { label: "Registro Jornadas", path: "/RegistroNuevaJornada", icon: "clock" },
  { label: "Auditoria", path: "/auditoria", icon: "shield" },
];

const estadoOptions = [
  { label: "Todos los estados", value: "TODOS" },
  { label: "En Uso", value: "EN_JORNADA" },
  { label: "Disponible", value: "DISPONIBLE" },
  { label: "Mantenimiento", value: "MANTENIMIENTO" },
  { label: "Inactivo", value: "INACTIVA" },
];

const mockCamiones: CamionHu11[] = [
  {
    id: "unidad-001",
    placa: "ABC-123",
    marca: "Volvo",
    modelo: "FH16",
    anio: 2022,
    capacidad_ton: 28,
    estado: "EN_JORNADA",
    gps_habilitado: true,
    vin: "VINABC123000001",
    color: "Azul",
    tipo_combustible: "DIESEL",
    kilometraje_actual: 25495,
    fecha_registro: "2026-04-07",
    ultima_fecha_mantenimiento: "2026-03-12",
    proxima_fecha_mantenimiento: "2026-06-12",
    horas_movimiento: 47.3,
    horas_detenido: 47.3,
    horas_totales: 94.5,
    kilometros_totales: 25495,
    ultimo_gps_at: "2026-05-05T05:13:00Z",
    activo: true,
  },
  {
    id: "unidad-002",
    placa: "DEF-456",
    marca: "Scania",
    modelo: "R450",
    anio: 2023,
    capacidad_ton: 30,
    estado: "EN_JORNADA",
    gps_habilitado: true,
    vin: "VINDEF456000002",
    color: "Blanco",
    tipo_combustible: "DIESEL",
    kilometraje_actual: 18310,
    fecha_registro: "2026-04-07",
    ultima_fecha_mantenimiento: "2026-03-04",
    proxima_fecha_mantenimiento: "2026-06-04",
    horas_movimiento: 72,
    horas_detenido: 0,
    horas_totales: 72,
    kilometros_totales: 18310,
    ultimo_gps_at: "2026-05-05T05:12:00Z",
    activo: true,
  },
  {
    id: "unidad-003",
    placa: "GHI-789",
    marca: "Mercedes-Benz",
    modelo: "Actros",
    anio: 2021,
    capacidad_ton: 26,
    estado: "EN_JORNADA",
    gps_habilitado: true,
    vin: "VINGHI789000003",
    color: "Azul",
    tipo_combustible: "DIESEL",
    kilometraje_actual: 31500,
    fecha_registro: "2026-04-07",
    ultima_fecha_mantenimiento: "2026-02-22",
    proxima_fecha_mantenimiento: "2026-05-22",
    horas_movimiento: 27.5,
    horas_detenido: 0,
    horas_totales: 27.5,
    kilometros_totales: 31500,
    ultimo_gps_at: "2026-05-05T05:14:00Z",
    activo: true,
  },
  {
    id: "unidad-004",
    placa: "JKL-012",
    marca: "Volvo",
    modelo: "FMX",
    anio: 2020,
    capacidad_ton: 24,
    estado: "EN_JORNADA",
    gps_habilitado: true,
    vin: "VINJKL012000004",
    color: "Rojo",
    tipo_combustible: "DIESEL",
    kilometraje_actual: 20440,
    fecha_registro: "2026-04-07",
    ultima_fecha_mantenimiento: "2026-01-18",
    proxima_fecha_mantenimiento: "2026-05-18",
    horas_movimiento: 42,
    horas_detenido: 0,
    horas_totales: 42,
    kilometros_totales: 20440,
    ultimo_gps_at: "2026-05-05T05:11:00Z",
    activo: true,
  },
  ...["MNO-345", "PQR-678", "STU-901", "VWX-234"].map((placa, index) => ({
    id: `unidad-disponible-${index + 1}`,
    placa,
    marca: index % 2 === 0 ? "Scania" : "Volvo",
    modelo: index % 2 === 0 ? "P360" : "FH",
    anio: 2020 + index,
    capacidad_ton: 24 + index,
    estado: "DISPONIBLE" as EstadoCamionHu11,
    gps_habilitado: index < 2,
    vin: `VINDISP${index + 1}000000`,
    color: "Blanco",
    tipo_combustible: "DIESEL",
    kilometraje_actual: 0,
    fecha_registro: "2026-04-07",
    ultima_fecha_mantenimiento: null,
    proxima_fecha_mantenimiento: null,
    horas_movimiento: 0,
    horas_detenido: 0,
    horas_totales: 0,
    kilometros_totales: 0,
    ultimo_gps_at: null,
    activo: true,
  })),
  ...["YZA-567", "BCD-890"].map((placa, index) => ({
    id: `unidad-mantenimiento-${index + 1}`,
    placa,
    marca: "Mercedes-Benz",
    modelo: "Arocs",
    anio: 2019 + index,
    capacidad_ton: 22,
    estado: "MANTENIMIENTO" as EstadoCamionHu11,
    gps_habilitado: false,
    vin: `VINMANT${index + 1}000000`,
    color: "Gris",
    tipo_combustible: "DIESEL",
    kilometraje_actual: 0,
    fecha_registro: "2026-04-07",
    ultima_fecha_mantenimiento: "2026-04-20",
    proxima_fecha_mantenimiento: "2026-05-20",
    horas_movimiento: 0,
    horas_detenido: 0,
    horas_totales: 0,
    kilometros_totales: 0,
    ultimo_gps_at: null,
    activo: true,
  })),
  ...["ZZZ-111", "ZZZ-222", "ZZZ-333"].map((placa, index) => ({
    id: `unidad-en-uso-${index + 1}`,
    placa,
    marca: "Volvo",
    modelo: "VM",
    anio: 2020,
    capacidad_ton: 18,
    estado: "EN_JORNADA" as EstadoCamionHu11,
    gps_habilitado: false,
    vin: `VINUSO${index + 1}000000`,
    color: "Negro",
    tipo_combustible: "DIESEL",
    kilometraje_actual: 0,
    fecha_registro: "2026-04-07",
    ultima_fecha_mantenimiento: null,
    proxima_fecha_mantenimiento: null,
    horas_movimiento: 0,
    horas_detenido: 0,
    horas_totales: 0,
    kilometros_totales: 0,
    ultimo_gps_at: null,
    activo: true,
  })),
];

const crearPanelDesdeCamiones = (camiones: CamionHu11[]): PanelCamionesHu11 => {
  const horasMovimiento = camiones.reduce((sum, camion) => sum + camion.horas_movimiento, 0);
  const horasDetenido = camiones.reduce((sum, camion) => sum + camion.horas_detenido, 0);
  const horasTotales = horasMovimiento + horasDetenido;

  return {
    resumen: {
      total_camiones: camiones.length,
      en_uso: camiones.filter((camion) => camion.estado === "EN_JORNADA").length,
      disponibles: camiones.filter((camion) => camion.estado === "DISPONIBLE").length,
      mantenimiento: camiones.filter((camion) => camion.estado === "MANTENIMIENTO").length,
    },
    grafica_movimiento: {
      horas_movimiento: Number(horasMovimiento.toFixed(1)),
      horas_detenido: Number(horasDetenido.toFixed(1)),
      porcentaje_movimiento: horasTotales ? Number(((horasMovimiento / horasTotales) * 100).toFixed(2)) : 0,
      porcentaje_detenido: horasTotales ? Number(((horasDetenido / horasTotales) * 100).toFixed(2)) : 0,
    },
    camiones,
  };
};

const initialPanel = crearPanelDesdeCamiones(mockCamiones);

type FormState = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: string;
  capacidad_ton: string;
  vin: string;
  color: string;
  combustible: string;
  gps: boolean;
  fecha_registro: string;
  kilometraje_actual: string;
  notas: string;
};

const initialForm: FormState = {
  id: "",
  placa: "",
  marca: "",
  modelo: "",
  anio: String(new Date().getFullYear()),
  capacidad_ton: "",
  vin: "",
  color: "",
  combustible: "DIESEL",
  gps: true,
  fecha_registro: new Date().toISOString().slice(0, 10),
  kilometraje_actual: "0",
  notas: "",
};

function Icon({ name }: { name: string }) {
  const common = "h-4 w-4";

  if (name === "truck") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    );
  }

  if (name === "alert") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }

  if (name === "pin" || name === "route") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

const estadoLabel: Record<string, string> = {
  DISPONIBLE: "Disponible",
  EN_JORNADA: "En Uso",
  EN_AUXILIO: "En Uso",
  MANTENIMIENTO: "Mantenimiento",
  INACTIVA: "Inactivo",
};

const estadoBadgeClass: Record<string, string> = {
  DISPONIBLE: "bg-green-500 text-white",
  EN_JORNADA: "bg-blue-600 text-white",
  EN_AUXILIO: "bg-blue-600 text-white",
  MANTENIMIENTO: "bg-orange-500 text-white",
  INACTIVA: "bg-slate-400 text-white",
};

function formatNumber(value: number, decimals = 1) {
  return new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value || 0));
}

function csvValue(value: unknown) {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replaceAll('"', '""')}"`;
}

function buildCsv(camiones: CamionHu11[]) {
  const headers = [
    "ID",
    "Placa",
    "Marca",
    "Modelo",
    "Año",
    "Capacidad (ton)",
    "Estado",
    "VIN",
    "Color",
    "GPS",
    "Kilometraje",
    "Fecha de Registro",
    "Ultimo Mantenimiento",
    "Proximo Mantenimiento",
  ];

  const rows = camiones.map((camion) => [
    camion.id,
    camion.placa,
    camion.marca,
    camion.modelo,
    camion.anio,
    camion.capacidad_ton,
    camion.estado,
    camion.vin,
    camion.color,
    camion.gps_habilitado ? "SI" : "NO",
    camion.kilometros_totales || camion.kilometraje_actual || 0,
    camion.fecha_registro,
    camion.ultima_fecha_mantenimiento || "",
    camion.proxima_fecha_mantenimiento || "",
  ]);

  return [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
}

function downloadCsv(csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "camiones.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function MonitoreoCamionesPage() {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<PanelCamionesHu11>(initialPanel);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("TODOS");
  const [horaActual, setHoraActual] = useState("");
  const [fechaActual, setFechaActual] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<{ placa: string; modelo: string } | null>(null);

  useEffect(() => {
    const actualizar = () => {
      const ahora = new Date();
      setHoraActual(
        ahora.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
      setFechaActual(
        ahora.toLocaleDateString("es-PE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    };

    actualizar();
    const interval = window.setInterval(actualizar, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    getPanelCamionesHu11()
      .then((data) => {
        if (mounted) setPanel(data);
      })
      .catch(() => {
        if (mounted) setPanel(initialPanel);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCamiones = useMemo(() => {
    const normalizedSearch = search.trim().toUpperCase();

    return panel.camiones.filter((camion) => {
      const matchesSearch =
        !normalizedSearch ||
        camion.placa.toUpperCase().includes(normalizedSearch) ||
        camion.marca.toUpperCase().includes(normalizedSearch);
      const matchesEstado = estado === "TODOS" || camion.estado === estado;

      return matchesSearch && matchesEstado;
    });
  }, [estado, panel.camiones, search]);

  const filteredPanel = useMemo(() => crearPanelDesdeCamiones(filteredCamiones), [filteredCamiones]);

  const chartData = filteredCamiones.map((camion) => ({
    placa: camion.placa,
    movimiento: camion.horas_movimiento,
    detenido: camion.horas_detenido,
  }));

  const handleFormChange = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const payload: CrearCamionHu11Payload = {
      id: form.id.trim() || undefined,
      placa: form.placa.trim().toUpperCase(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      anio: Number(form.anio),
      capacidad_ton: Number(form.capacidad_ton),
      vin: form.vin.trim().toUpperCase(),
      color: form.color.trim(),
      combustible: form.combustible,
      gps: form.gps,
      fecha_registro: form.fecha_registro,
      kilometraje_actual: Number(form.kilometraje_actual || 0),
      notas: form.notas.trim() || undefined,
    };

    if (!payload.placa || !payload.marca || !payload.modelo || !payload.vin || !payload.color) {
      setFormError("Completa los campos obligatorios antes de registrar.");
      return;
    }

    if (!payload.anio || !payload.capacidad_ton || payload.capacidad_ton <= 0) {
      setFormError("Ingresa un año y una capacidad validos.");
      return;
    }

    if (panel.camiones.some((camion) => camion.placa.toUpperCase() === payload.placa)) {
      setFormError("Ya existe un camion con esta placa.");
      return;
    }

    try {
      const creado = await crearCamionHu11(payload);
      setPanel((current) => crearPanelDesdeCamiones([...current.camiones, creado]));
    } catch {
      const nuevoCamion: CamionHu11 = {
        id: payload.id || `unidad-local-${Date.now()}`,
        placa: payload.placa,
        marca: payload.marca,
        modelo: payload.modelo,
        anio: payload.anio,
        capacidad_ton: payload.capacidad_ton,
        estado: "DISPONIBLE",
        gps_habilitado: payload.gps,
        vin: payload.vin,
        color: payload.color,
        tipo_combustible: payload.combustible,
        kilometraje_actual: payload.kilometraje_actual || 0,
        fecha_registro: payload.fecha_registro || new Date().toISOString().slice(0, 10),
        ultima_fecha_mantenimiento: null,
        proxima_fecha_mantenimiento: null,
        horas_movimiento: 0,
        horas_detenido: 0,
        horas_totales: 0,
        kilometros_totales: payload.kilometraje_actual || 0,
        ultimo_gps_at: null,
        activo: true,
      };

      setPanel((current) => crearPanelDesdeCamiones([...current.camiones, nuevoCamion]));
    }

    setToast({ placa: payload.placa, modelo: payload.modelo });
    setModalOpen(false);
    setForm(initialForm);
    window.setTimeout(() => setToast(null), 4200);
  };

  const handleDownloadCsv = async () => {
    try {
      const csv = await descargarCamionesHu11Csv({
        placa: search || undefined,
        estado: estado === "TODOS" ? undefined : estado,
      });
      downloadCsv(csv);
    } catch {
      downloadCsv(buildCsv(filteredCamiones));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <aside className="fixed left-0 top-0 z-20 flex h-full min-h-screen w-52 shrink-0 flex-col bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-700 px-4 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
            <Icon name="truck" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-white">NANU TECH</p>
            <p className="text-xs text-slate-400">Gestion de Flota</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-600 font-semibold text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="shrink-0 text-current">
                <Icon name={item.icon} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 px-4 py-3">
          <div className="mb-3 rounded-lg border border-orange-500/40 bg-orange-500/10 p-3 text-xs text-orange-300">
            <p className="font-semibold">Sesion activa</p>
            <p className="mt-1 text-white">0h 13m</p>
            <p className="mt-1">Por vencer</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg p-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              C
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">Carlos Administr...</p>
              <p className="truncate text-xs text-slate-400">Administrador Gene...</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Camiones</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Ultima actualizacion</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          {loading ? (
            <div className="rounded-lg bg-white p-6 text-sm text-slate-500">Cargando panel de camiones...</div>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard label="Total Camiones" value={panel.resumen.total_camiones} tone="blue" icon="truck" />
                <KpiCard label="En Uso" value={panel.resumen.en_uso} tone="green" icon="route" />
                <KpiCard label="Disponibles" value={panel.resumen.disponibles} tone="blue" icon="pin" />
                <KpiCard label="Mantenimiento" value={panel.resumen.mantenimiento} tone="orange" icon="alert" />
              </section>

              <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Filtros</h2>
                    <p className="text-xs text-gray-500">Buscar y filtrar camiones</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <span className="text-base leading-none">+</span>
                      Registrar Camion
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadCsv}
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <span aria-hidden="true">↓</span>
                      Exportar CSV
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_0.9fr]">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por placa o marca..."
                    className="h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <select
                    value={estado}
                    onChange={(event) => setEstado(event.target.value)}
                    className="h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                    aria-label="Estado"
                  >
                    {estadoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="text-sm font-bold text-gray-900">Comparativa de Horas: Movimiento vs Detenido</h2>
                <p className="mb-4 text-xs text-gray-500">Analisis de tiempo de operacion por camion</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="placa" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="movimiento" fill="#10b981" radius={[4, 4, 0, 0]} name="Movimiento" />
                      <Bar dataKey="detenido" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Detenido" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-right text-xs text-gray-500">
                  Movimiento {filteredPanel.grafica_movimiento.porcentaje_movimiento}% · Detenido{" "}
                  {filteredPanel.grafica_movimiento.porcentaje_detenido}%
                </p>
              </section>

              <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">
                        <Icon name="truck" />
                      </span>
                      <h2 className="text-sm font-bold text-gray-900">Flota de Camiones</h2>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Mostrando {filteredCamiones.length} de {panel.camiones.length} camiones
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {filteredCamiones.map((camion) => (
                    <TruckCard key={camion.id} camion={camion} onDetail={() => navigate(`/camiones/${camion.id}/configuracion`)} />
                  ))}
                </div>
              </section>
            </>
          )}
        </main>

        <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
          © 2026 NANU TECH · Sistema de Gestion de Flota de Camiones
        </footer>
      </div>

      {modalOpen && (
        <RegistrationModal
          form={form}
          error={formError}
          onChange={handleFormChange}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed right-6 top-6 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
        >
          <p className="text-sm font-bold text-gray-900">¡Camión registrado con éxito!</p>
          <p className="mt-1 text-xs text-gray-500">
            {toast.placa} · {toast.modelo} fue agregado al sistema.
          </p>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, tone, icon }: { label: string; value: number; tone: string; icon: string }) {
  const toneClass: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClass[tone]}`}>
        <Icon name={icon} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${tone === "orange" ? "text-orange-600" : tone === "green" ? "text-green-600" : "text-blue-600"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function TruckCard({ camion, onDetail }: { camion: CamionHu11; onDetail: () => void }) {
  const eficiencia = camion.horas_totales > 0 ? Math.round((camion.horas_movimiento / camion.horas_totales) * 100) : 0;
  const hasGps = camion.gps_habilitado && Boolean(camion.ultimo_gps_at);

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="bg-blue-600 p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <Icon name="truck" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{camion.placa}</h3>
              <p className="mt-2 text-sm">{camion.marca} {camion.modelo}</p>
              <p className="text-xs text-blue-100">Año: {camion.anio}</p>
            </div>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-bold ${estadoBadgeClass[camion.estado] || estadoBadgeClass.INACTIVA}`}>
            {estadoLabel[camion.estado] || "Inactivo"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <Metric label="Capacidad de Carga" value={`${formatNumber(camion.capacidad_ton, 1)} TM`} tone="purple" />
        <Metric label="Horas Totales" value={`${formatNumber(camion.horas_totales, 1)} h`} tone="blue" />
        <Metric label="Movimiento" value={`${formatNumber(camion.horas_movimiento, 1)} h`} tone="green" />
        <Metric label="Detenido" value={`${formatNumber(camion.horas_detenido, 1)} h`} tone="orange" />
        <Metric label="Kilometros Totales" value={`${new Intl.NumberFormat("es-PE").format(camion.kilometros_totales || 0)} km`} tone="sky" wide />
      </div>

      <div className="px-5 pb-5">
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>Eficiencia Operativa</span>
          <span className="font-semibold text-green-600">{eficiencia}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-green-500" style={{ width: `${eficiencia}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
          <span>GPS {hasGps ? "Activo" : "N/A"}</span>
          <span>{hasGps ? "95 km/h" : "0 km/h"}</span>
        </div>
        <button
          type="button"
          onClick={onDetail}
          className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Ver detalle
        </button>
      </div>
    </article>
  );
}

function Metric({ label, value, tone, wide = false }: { label: string; value: string; tone: string; wide?: boolean }) {
  const toneClass: Record<string, string> = {
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <div className={`rounded-md border p-3 ${toneClass[tone]} ${wide ? "col-span-2" : ""}`}>
      <p className="text-[11px] font-semibold">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function RegistrationModal({
  form,
  error,
  onChange,
  onClose,
  onSubmit,
}: {
  form: FormState;
  error: string;
  onChange: (field: keyof FormState, value: string | boolean) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Icon name="truck" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Registrar Nuevo Camion</h2>
              <p className="text-xs text-gray-500">Completa todos los datos requeridos del vehiculo</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-700">
            ×
          </button>
        </div>

        <h3 className="mb-3 text-sm font-bold text-gray-900">Informacion Basica</h3>
        <div className="grid grid-cols-2 gap-3">
          <Input label="ID" value={form.id} onChange={(value) => onChange("id", value)} placeholder="unidad-001" />
          <Input label="Placa *" value={form.placa} onChange={(value) => onChange("placa", value)} placeholder="ABC-123" />
          <Input label="Marca *" value={form.marca} onChange={(value) => onChange("marca", value)} placeholder="Volvo, Scania..." />
          <Input label="Modelo *" value={form.modelo} onChange={(value) => onChange("modelo", value)} placeholder="FH16, R450..." />
          <Input label="Año *" type="number" value={form.anio} onChange={(value) => onChange("anio", value)} />
          <Input label="Capacidad (toneladas) *" type="number" value={form.capacidad_ton} onChange={(value) => onChange("capacidad_ton", value)} placeholder="28" />
          <Input label="VIN *" value={form.vin} onChange={(value) => onChange("vin", value)} placeholder="VIN unico" />
          <Input label="Color *" value={form.color} onChange={(value) => onChange("color", value)} placeholder="Blanco, Rojo..." />
        </div>

        <h3 className="mb-3 mt-5 text-sm font-bold text-gray-900">Informacion Tecnica</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-gray-700">
            Tipo de Combustible
            <select
              value={form.combustible}
              onChange={(event) => onChange("combustible", event.target.value)}
              className="h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal outline-none focus:border-blue-500"
            >
              <option value="DIESEL">Diesel</option>
              <option value="GASOLINA">Gasolina</option>
              <option value="GNV">GNV</option>
              <option value="GLP">GLP</option>
              <option value="ELECTRICO">Electrico</option>
              <option value="HIBRIDO">Hibrido</option>
            </select>
          </label>
          <Input label="Fecha de Registro" type="date" value={form.fecha_registro} onChange={(value) => onChange("fecha_registro", value)} />
          <Input label="Kilometraje Actual" type="number" value={form.kilometraje_actual} onChange={(value) => onChange("kilometraje_actual", value)} />
        </div>

        <h3 className="mb-3 mt-5 text-sm font-bold text-gray-900">Configuracion GPS</h3>
        <label className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.gps}
            onChange={(event) => onChange("gps", event.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block font-semibold">Habilitar GPS</span>
            <span className="text-xs text-gray-500">El camion quedara disponible para ser monitoreado en el sistema GPS.</span>
          </span>
        </label>

        <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-gray-700">
          Notas Adicionales
          <textarea
            value={form.notas}
            onChange={(event) => onChange("notas", event.target.value)}
            placeholder="Informacion adicional sobre el camion..."
            className="min-h-20 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-normal outline-none focus:border-blue-500"
          />
        </label>

        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-700">
          <strong>Estado Inicial: Disponible.</strong> El camion sera registrado con estado Disponible y estara listo para asignar a conductores.
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
            Cancelar
          </button>
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Registrar Camion
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-gray-700">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal outline-none focus:border-blue-500"
      />
    </label>
  );
}

export default MonitoreoCamionesPage;
