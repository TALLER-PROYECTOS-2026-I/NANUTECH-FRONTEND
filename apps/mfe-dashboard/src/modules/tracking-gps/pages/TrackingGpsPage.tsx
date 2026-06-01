import { useEffect, useMemo, useState } from 'react';
import {
  exportTrackingGpsCsv,
  getTrackingGpsRegistros,
  getTrackingGpsSummary,
} from '@nanutech/api-client';
import type {
  EstadoTrackingGpsApi,
  TrackingGpsFilters,
  TrackingGpsRegistroApi,
  TrackingGpsSummaryApi,
} from '@nanutech/api-client';
import { MonitoreoSidebar } from '../../monitoreo-camiones/components/MonitoreoSidebar';

// Modelo interno normalizado para renderizar la tabla de tracking GPS.
type RegistroTracking = {
  id: string;
  placa: string;
  proveedor: string;
  fechaHora: string;
  distanciaTotal: number;
  velocidadKmh: number;
  estado: EstadoTrackingGpsApi;
  excesoVelocidad: boolean;
};

// Resumen en cero para estados sin datos o error de conexion.
const EMPTY_SUMMARY: TrackingGpsSummaryApi = {
  total_registros: 0,
  unidades_movimiento: 0,
  unidades_detenidas: 0,
  excesos_velocidad: 0,
};

const ERROR_MESSAGE =
  'No se encontraron eventos de rastreo disponibles o error de conexión con el proveedor';

// Etiquetas visibles para los estados enviados por el backend.
const ESTADO_LABEL: Record<EstadoTrackingGpsApi, string> = {
  MOVIENDO: 'En Movimiento',
  DETENIDO: 'Detenido',
  EXCESO_VELOCIDAD: 'Exceso Velocidad',
};

// Nombres comerciales de los proveedores GPS.
const PROVIDER_LABEL: Record<string, string> = {
  GPSCONTROL: 'GPSControl.pe',
  GLOBALGPS: 'GlobalGPSPeru.com',
};

// Convierte numeros recibidos como string/null a number seguro.
const toNumber = (value: number | string | null | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// Regla de exceso de velocidad: booleano backend, estado tecnico o velocidad mayor a 90.
const isSpeedingRegistro = (registro: Pick<RegistroTracking, 'estado' | 'velocidadKmh' | 'excesoVelocidad'>): boolean =>
  registro.excesoVelocidad || registro.estado === 'EXCESO_VELOCIDAD' || registro.velocidadKmh > 90;

// Normaliza la respuesta del API al modelo que usa la pagina.
const normalizeRegistro = (registro: TrackingGpsRegistroApi): RegistroTracking => ({
  id: registro.id,
  placa: registro.placa,
  proveedor: PROVIDER_LABEL[registro.proveedor] ?? registro.proveedor,
  fechaHora: registro.fecha_hora,
  distanciaTotal: toNumber(registro.distancia_total),
  velocidadKmh: toNumber(registro.velocidad_kmh),
  estado: registro.estado,
  excesoVelocidad: Boolean(registro.exceso_velocidad) || registro.estado === 'EXCESO_VELOCIDAD' || toNumber(registro.velocidad_kmh) > 90,
});

// Obtiene el registro mas reciente por placa para representar el estado actual.
const getLatestRegistrosByPlate = (registros: RegistroTracking[]): RegistroTracking[] => {
  const latestByPlate = new Map<string, RegistroTracking>();

  registros.forEach((registro) => {
    const current = latestByPlate.get(registro.placa);
    const currentTime = current ? new Date(current.fechaHora).getTime() : Number.NEGATIVE_INFINITY;
    const nextTime = new Date(registro.fechaHora).getTime();

    if (!current || nextTime >= currentTime) {
      latestByPlate.set(registro.placa, registro);
    }
  });

  return [...latestByPlate.values()];
};

// Indica si el usuario ya aplico al menos un filtro.
const hasActiveFilters = (filters: TrackingGpsFilters): boolean =>
  Object.values(filters).some((value) => Boolean(value));

// Envia al backend filtros base; el estado se aplica luego sobre registros actuales.
const buildRegistrosRequestFilters = (filters: TrackingGpsFilters): TrackingGpsFilters => ({
  placa: filters.placa,
  horaInicio: filters.horaInicio,
  horaFin: filters.horaFin,
});

// Filtra por estado operativo actual despues de quedarnos con el ultimo evento por placa.
const filterRegistrosByCurrentState = (
  registros: RegistroTracking[],
  filters: TrackingGpsFilters,
): RegistroTracking[] => {
  if (!filters.estado) return registros;

  return registros.filter((registro) => {
    if (filters.estado === 'EXCESO_VELOCIDAD') return isSpeedingRegistro(registro);
    return registro.estado === filters.estado;
  });
};

// Recalcula los KPIs con los registros visibles cuando hay filtros activos.
const buildSummaryFromVisibleRegistros = (registros: RegistroTracking[]): TrackingGpsSummaryApi => ({
  total_registros: registros.length,
  unidades_movimiento: registros.filter((registro) =>
    registro.estado === 'MOVIENDO' || registro.estado === 'EXCESO_VELOCIDAD',
  ).length,
  unidades_detenidas: registros.filter((registro) => registro.estado === 'DETENIDO').length,
  excesos_velocidad: registros.filter(isSpeedingRegistro).length,
});


// Formatea la fecha que se muestra en la cabecera de la pantalla.
const formatFechaActual = (date: Date) =>
  date.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// Formatea la hora de actualizacion visible en la cabecera.
const formatHoraActual = (date: Date) =>
  date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

// Convierte timestamps del backend a DD/MM/YYYY HH:MM:SS.
const formatFechaHora = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  const fecha = date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const hora = date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${fecha} ${hora}`;
};

// Formatea la distancia recorrida en kilometros.
const formatKm = (value: number) =>
  `${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} km`;

// Convierte el datetime-local al formato que espera la API.
const normalizeDateTimeForApi = (value: string) => {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
};

// Define estilos visuales por umbral de velocidad.
const getSpeedTone = (speed: number) => {
  if (speed > 90) {
    return {
      row: 'bg-red-50',
      text: 'font-bold text-red-600',
      icon: '↯',
    };
  }

  if (speed >= 81) {
    return {
      row: 'bg-yellow-50',
      text: 'text-orange-600',
      icon: '△',
    };
  }

  return {
    row: 'bg-white',
    text: 'text-emerald-600',
    icon: '↗',
  };
};

// Descarga el contenido CSV que devuelve el endpoint de exportacion.
const downloadBlob = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Tarjeta de KPI reutilizable para los cuatro indicadores superiores.
function SummaryCard({
  title,
  value,
  helper,
  tone,
  icon,
}: {
  title: string;
  value: number;
  helper: string;
  tone: 'blue' | 'green' | 'slate' | 'red';
  icon: string;
}) {
  const toneClass = {
    blue: 'border-blue-100 bg-blue-50 text-blue-600',
    green: 'border-emerald-100 bg-emerald-50 text-emerald-600',
    slate: 'border-slate-100 bg-slate-50 text-slate-500',
    red: 'border-red-200 bg-red-50 text-red-600',
  }[tone];

  return (
    <article className={`rounded-lg border bg-white p-5 shadow-sm ${tone === 'red' ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
          <p className={`mt-3 text-3xl font-black ${tone === 'red' ? 'text-red-600' : 'text-slate-950'}`}>{value}</p>
          <p className="mt-2 text-xs text-slate-500">{helper}</p>
        </div>
        <span className={`grid h-12 w-12 place-items-center rounded-lg border text-xl font-black ${toneClass}`}>{icon}</span>
      </div>
    </article>
  );
}

// Badge de estado para la columna Estado de la tabla.
function StatusBadge({ estado }: { estado: EstadoTrackingGpsApi }) {
  const classes = {
    MOVIENDO: 'bg-emerald-100 text-emerald-700',
    DETENIDO: 'bg-slate-100 text-slate-600',
    EXCESO_VELOCIDAD: 'bg-red-100 text-red-700',
  }[estado];

  return (
    <span className={`inline-flex min-w-28 items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${classes}`}>
      {estado === 'EXCESO_VELOCIDAD' ? '↯ ' : estado === 'DETENIDO' ? '△ ' : '↗ '}
      {ESTADO_LABEL[estado]}
    </span>
  );
}

// Pagina de HU09 con resumen, filtros, tabla y exportacion CSV.
export default function TrackingGpsPage() {
  const [summary, setSummary] = useState<TrackingGpsSummaryApi>(EMPTY_SUMMARY);
  const [registros, setRegistros] = useState<RegistroTracking[]>([]);
  const [filters, setFilters] = useState({ placa: '', estado: '', horaInicio: '', horaFin: '' });
  const [appliedFilters, setAppliedFilters] = useState<TrackingGpsFilters>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [fechaActual, setFechaActual] = useState('');
  const [horaActual, setHoraActual] = useState('');

  // Mantiene la fecha y hora de la cabecera actualizadas en vivo.
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setFechaActual(formatFechaActual(now));
      setHoraActual(formatHoraActual(now));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Carga resumen y registros; refresca cada 10s y reintenta cada 30s si no hay datos.
  useEffect(() => {
    let mounted = true;
    let timeoutId: number | undefined;

    const loadTracking = async () => {
      setLoading(true);
      let nextRefreshMs = 10000;

      try {
        const [summaryData, registrosData] = await Promise.all([
          getTrackingGpsSummary(),
          getTrackingGpsRegistros(buildRegistrosRequestFilters(appliedFilters)),
        ]);

        if (!mounted) return;

        const latestRegistros = getLatestRegistrosByPlate(registrosData.map(normalizeRegistro));
        const normalized = filterRegistrosByCurrentState(latestRegistros, appliedFilters);
        const nextSummary = hasActiveFilters(appliedFilters)
          ? buildSummaryFromVisibleRegistros(normalized)
          : summaryData;

        setSummary(normalized.length > 0 ? nextSummary : EMPTY_SUMMARY);
        setRegistros(normalized);
        setMessage(normalized.length > 0 ? '' : ERROR_MESSAGE);
        nextRefreshMs = normalized.length > 0 ? 10000 : 30000;
      } catch {
        if (!mounted) return;

        setSummary(EMPTY_SUMMARY);
        setRegistros([]);
        setMessage(ERROR_MESSAGE);
        nextRefreshMs = 30000;
      } finally {
        if (mounted) {
          setLoading(false);
          timeoutId = window.setTimeout(loadTracking, nextRefreshMs);
        }
      }
    };

    loadTracking();

    return () => {
      mounted = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [appliedFilters]);

  // Ordena los excesos de velocidad al inicio de la tabla.
  const sortedRegistros = useMemo(
    () => [...registros].sort((a, b) => Number(b.excesoVelocidad) - Number(a.excesoVelocidad)),
    [registros],
  );

  // Aplica los filtros seleccionados por el administrador.
  const applyFilters = () => {
    setAppliedFilters({
      placa: filters.placa.trim() || undefined,
      estado: filters.estado ? (filters.estado as EstadoTrackingGpsApi) : undefined,
      horaInicio: normalizeDateTimeForApi(filters.horaInicio),
      horaFin: normalizeDateTimeForApi(filters.horaFin),
    });
  };

  // Restablece el formulario y vuelve al listado general.
  const clearFilters = () => {
    setFilters({ placa: '', estado: '', horaInicio: '', horaFin: '' });
    setAppliedFilters({});
  };

  // Exporta el CSV desde el endpoint oficial de HU09.
  const handleExportCsv = async () => {
    const result = await exportTrackingGpsCsv(appliedFilters);
    downloadBlob(result.csv, result.filename);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <MonitoreoSidebar />

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">GPS</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Última actualización</p>
            <p className="text-sm font-semibold text-gray-900">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <section className="mb-5">
            <h2 className="text-2xl font-bold text-gray-950">Tracking GPS en Tiempo Real</h2>
            <p className="text-sm text-gray-500">Monitoreo global de telemetría y registros cargados</p>
          </section>

          <section className="grid gap-4 lg:grid-cols-4">
            <SummaryCard title="Total Registros" value={summary.total_registros} helper="Eventos recibidos" tone="blue" icon="◎" />
            <SummaryCard title="Unidades en Movimiento" value={summary.unidades_movimiento} helper="Último estado activo" tone="green" icon="↗" />
            <SummaryCard title="Unidades Detenidas" value={summary.unidades_detenidas} helper="Sin desplazamiento" tone="slate" icon="△" />
            <SummaryCard title="Excesos de Velocidad" value={summary.excesos_velocidad} helper="Sobre 90 km/h" tone="red" icon="↯" />
          </section>

          <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto_auto]">
              <label className="text-xs font-bold uppercase text-slate-500">
                Placa de la unidad
                <input
                  value={filters.placa}
                  onChange={(event) => setFilters((current) => ({ ...current, placa: event.target.value }))}
                  className="mt-2 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-blue-500"
                  placeholder="Ej: ABC-123"
                />
              </label>

              <label className="text-xs font-bold uppercase text-slate-500">
                Hora inicio
                <input
                  type="datetime-local"
                  value={filters.horaInicio}
                  onChange={(event) => setFilters((current) => ({ ...current, horaInicio: event.target.value }))}
                  className="mt-2 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-xs font-bold uppercase text-slate-500">
                Hora fin
                <input
                  type="datetime-local"
                  value={filters.horaFin}
                  onChange={(event) => setFilters((current) => ({ ...current, horaFin: event.target.value }))}
                  className="mt-2 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-blue-500"
                />
              </label>

              <label className="text-xs font-bold uppercase text-slate-500">
                Estado del vehículo
                <select
                  value={filters.estado}
                  onChange={(event) => setFilters((current) => ({ ...current, estado: event.target.value }))}
                  className="mt-2 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-normal text-gray-900 outline-none focus:border-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="MOVIENDO">En Movimiento</option>
                  <option value="DETENIDO">Detenido</option>
                  <option value="EXCESO_VELOCIDAD">Exceso Velocidad</option>
                </select>
              </label>

              <button
                type="button"
                onClick={applyFilters}
                className="self-end rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                Aplicar Filtros
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="self-end rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Limpiar
              </button>
            </div>
          </section>

          <section className="mt-5 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 p-5">
              <div>
                <h3 className="text-sm font-bold text-gray-950">Registros de Telemetría GPS</h3>
                <p className="text-xs text-gray-500">
                  {registros.length} registros · {summary.excesos_velocidad} excesos de velocidad priorizados al inicio
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Exportar CSV
              </button>
            </div>

            <div className="border-b border-gray-100 px-5 py-3 text-xs text-gray-500">
              <span className="font-bold text-gray-700">LEYENDA:</span>
              <span className="ml-3 text-emerald-600">● Normal · 0-80 km/h</span>
              <span className="ml-3 text-orange-600">● Precaución · 81-90 km/h</span>
              <span className="ml-3 font-bold text-red-600">● Exceso · &gt;90 km/h</span>
            </div>

            {loading ? (
              <p className="p-10 text-center text-sm text-gray-500">Cargando registros de rastreo...</p>
            ) : message ? (
              <p className="p-10 text-center text-sm font-semibold text-gray-500">{message}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1024px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold uppercase text-slate-500">
                      <th className="px-5 py-3">Placa</th>
                      <th className="px-5 py-3">Marca de Tiempo</th>
                      <th className="px-5 py-3">Proveedor</th>
                      <th className="px-5 py-3">Distancia Recorrida</th>
                      <th className="px-5 py-3">Velocidad</th>
                      <th className="px-5 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRegistros.map((registro) => {
                      const speedTone = getSpeedTone(registro.velocidadKmh);

                      return (
                        <tr key={registro.id} className={`border-b border-gray-100 ${speedTone.row}`}>
                          <td className="px-5 py-3 font-black text-slate-800">⌁ {registro.placa}</td>
                          <td className="px-5 py-3 font-mono text-xs text-slate-700">{formatFechaHora(registro.fechaHora)}</td>
                          <td className="px-5 py-3">
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                              {registro.proveedor}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-700">△ {formatKm(registro.distanciaTotal)}</td>
                          <td className={`px-5 py-3 ${speedTone.text}`}>
                            {speedTone.icon} {registro.velocidadKmh} km/h
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge estado={registro.estado} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
