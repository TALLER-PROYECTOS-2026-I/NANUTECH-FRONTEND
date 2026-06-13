import { useEffect, useMemo, useState, type ReactNode } from 'react';
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

type TrackingIconName = 'pin' | 'trend' | 'navigation' | 'bolt' | 'file' | 'gauge' | 'pulse';

const EMPTY_SUMMARY: TrackingGpsSummaryApi = {
  total_registros: 0,
  unidades_movimiento: 0,
  unidades_detenidas: 0,
  excesos_velocidad: 0,
};

const ERROR_MESSAGE =
  'No se encontraron eventos de rastreo disponibles o error de conexion con el proveedor';

const ESTADO_LABEL: Record<EstadoTrackingGpsApi, string> = {
  MOVIENDO: 'En Movimiento',
  DETENIDO: 'Detenido',
  EXCESO_VELOCIDAD: 'Exceso Velocidad',
};

const PROVIDER_LABEL: Record<string, string> = {
  GPSCONTROL: 'GPSControl.pe',
  GLOBALGPS: 'GlobalGPSPeru.com',
};

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isSpeedingRegistro = (
  registro: Pick<RegistroTracking, 'estado' | 'velocidadKmh' | 'excesoVelocidad'>,
): boolean =>
  registro.excesoVelocidad || registro.estado === 'EXCESO_VELOCIDAD' || registro.velocidadKmh > 90;

const normalizeRegistro = (registro: TrackingGpsRegistroApi): RegistroTracking => ({
  id: registro.id,
  placa: registro.placa,
  proveedor: PROVIDER_LABEL[registro.proveedor] ?? registro.proveedor,
  fechaHora: registro.fecha_hora,
  distanciaTotal: toNumber(registro.distancia_total),
  velocidadKmh: toNumber(registro.velocidad_kmh),
  estado: registro.estado,
  excesoVelocidad:
    Boolean(registro.exceso_velocidad) ||
    registro.estado === 'EXCESO_VELOCIDAD' ||
    toNumber(registro.velocidad_kmh) > 90,
});

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

const hasActiveFilters = (filters: TrackingGpsFilters): boolean =>
  Object.values(filters).some((value) => Boolean(value));

const buildRegistrosRequestFilters = (filters: TrackingGpsFilters): TrackingGpsFilters => ({
  placa: filters.placa,
  horaInicio: filters.horaInicio,
  horaFin: filters.horaFin,
});

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

const buildSummaryFromVisibleRegistros = (registros: RegistroTracking[]): TrackingGpsSummaryApi => ({
  total_registros: registros.length,
  unidades_movimiento: registros.filter(
    (registro) => registro.estado === 'MOVIENDO' || registro.estado === 'EXCESO_VELOCIDAD',
  ).length,
  unidades_detenidas: registros.filter((registro) => registro.estado === 'DETENIDO').length,
  excesos_velocidad: registros.filter(isSpeedingRegistro).length,
});

function TrackingIcon({
  name,
  className = 'h-5 w-5',
}: {
  name: TrackingIconName;
  className?: string;
}) {
  const paths: Record<TrackingIconName, ReactNode> = {
    pin: (
      <>
        <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    trend: (
      <>
        <path d="m4 16 5-5 4 4 7-8" />
        <path d="M15 7h5v5" />
      </>
    ),
    navigation: <path d="M12 3 5 21l7-4 7 4-7-18Z" />,
    bolt: <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" />,
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M12 12v6" />
        <path d="m9 15 3 3 3-3" />
      </>
    ),
    gauge: (
      <>
        <path d="M4 14a8 8 0 0 1 16 0" />
        <path d="M12 14l4-5" />
        <path d="M12 14h.01" />
      </>
    ),
    pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

const formatFechaActual = (date: Date) =>
  date.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatHoraActual = (date: Date) =>
  date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

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

const formatKm = (value: number) =>
  `${value.toLocaleString('es-PE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })} km`;

const normalizeDateTimeForApi = (value: string) => {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
};

const getSpeedTone = (speed: number) => {
  if (speed > 90) {
    return {
      row: 'bg-red-50',
      text: 'font-bold text-red-600',
      iconClass: 'text-red-400',
    };
  }

  if (speed >= 81) {
    return {
      row: 'bg-yellow-50',
      text: 'text-orange-600',
      iconClass: 'text-orange-500',
    };
  }

  return {
    row: 'bg-white',
    text: 'text-emerald-600',
    iconClass: 'text-emerald-500',
  };
};

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
  icon: TrackingIconName;
}) {
  const iconClass = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    slate: 'bg-slate-100 text-slate-500',
    red: 'bg-red-100 text-red-600',
  }[tone];

  return (
    <article className={`rounded-lg border bg-white p-5 shadow-sm ${tone === 'red' ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
          <p className={`mt-3 text-3xl font-black ${tone === 'red' ? 'text-red-600' : 'text-slate-950'}`}>
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{helper}</p>
        </div>
        <span className={`grid h-14 w-14 place-items-center rounded-2xl ${iconClass}`}>
          <TrackingIcon name={icon} className="h-7 w-7" />
        </span>
      </div>
    </article>
  );
}

function StatusBadge({ estado }: { estado: EstadoTrackingGpsApi }) {
  const classes = {
    MOVIENDO: 'bg-emerald-100 text-emerald-700',
    DETENIDO: 'bg-slate-100 text-slate-600',
    EXCESO_VELOCIDAD: 'bg-red-100 text-red-700',
  }[estado];
  const icon: TrackingIconName =
    estado === 'EXCESO_VELOCIDAD' ? 'bolt' : estado === 'DETENIDO' ? 'navigation' : 'trend';

  return (
    <span className={`inline-flex min-w-28 items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${classes}`}>
      <TrackingIcon name={icon} className="mr-1 h-3.5 w-3.5" />
      {ESTADO_LABEL[estado]}
    </span>
  );
}

export default function TrackingGpsPage() {
  const [summary, setSummary] = useState<TrackingGpsSummaryApi>(EMPTY_SUMMARY);
  const [registros, setRegistros] = useState<RegistroTracking[]>([]);
  const [filters, setFilters] = useState({ placa: '', estado: '', horaInicio: '', horaFin: '' });
  const [appliedFilters, setAppliedFilters] = useState<TrackingGpsFilters>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [exportMessage, setExportMessage] = useState('');
  const [fechaActual, setFechaActual] = useState('');
  const [horaActual, setHoraActual] = useState('');

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

  const sortedRegistros = useMemo(
    () =>
      [...registros].sort(
        (a, b) =>
          Number(b.excesoVelocidad) - Number(a.excesoVelocidad) ||
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
      ),
    [registros],
  );
  const visibleExcessCount = useMemo(
    () => registros.filter(isSpeedingRegistro).length,
    [registros],
  );

  const applyFilters = () => {
    setExportMessage('');
    setAppliedFilters({
      placa: filters.placa.trim() || undefined,
      estado: filters.estado ? (filters.estado as EstadoTrackingGpsApi) : undefined,
      horaInicio: normalizeDateTimeForApi(filters.horaInicio),
      horaFin: normalizeDateTimeForApi(filters.horaFin),
    });
  };

  const clearFilters = () => {
    setFilters({ placa: '', estado: '', horaInicio: '', horaFin: '' });
    setAppliedFilters({});
    setExportMessage('');
  };

  const handleExportCsv = async () => {
    setExporting(true);
    setExportMessage('');

    try {
      const result = await exportTrackingGpsCsv(appliedFilters);
      downloadBlob(result.csv, result.filename);
    } catch (error) {
      console.error('Error al exportar tracking GPS:', error);
      setExportMessage(
        'No se pudo exportar el reporte GPS. Verifique la conexion o la configuracion CORS del backend.',
      );
    } finally {
      setExporting(false);
    }
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
            <p className="text-xs text-gray-400">Ultima actualizacion</p>
            <p className="text-sm font-semibold text-gray-900">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <section className="mb-5">
            <h2 className="text-2xl font-bold text-gray-950">Tracking GPS en Tiempo Real</h2>
            <p className="text-sm text-gray-500">
              Monitoreo global de telemetria - {summary.total_registros} registros cargados
            </p>
          </section>

          <section className="grid gap-4 lg:grid-cols-4">
            <SummaryCard title="Total Registros" value={summary.total_registros} helper="Eventos recibidos" tone="blue" icon="pin" />
            <SummaryCard title="Unidades en Movimiento" value={summary.unidades_movimiento} helper="Ultimo estado activo" tone="green" icon="trend" />
            <SummaryCard title="Unidades Detenidas" value={summary.unidades_detenidas} helper="Sin desplazamiento" tone="slate" icon="navigation" />
            <SummaryCard title="Excesos de Velocidad" value={summary.excesos_velocidad} helper="Sobre 90 km/h" tone="red" icon="bolt" />
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
                Estado del vehiculo
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
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-600">
                  <TrackingIcon name="pin" className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-950">Registros de Telemetria GPS</h3>
                  <p className="text-sm text-gray-500">
                    {registros.length} registros -{' '}
                    <span className="font-bold text-red-600">{visibleExcessCount} excesos de velocidad</span>{' '}
                    priorizados al inicio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <TrackingIcon name="file" className="h-4 w-4" />
                {exporting ? 'Exportando...' : 'Exportar CSV'}
              </button>
            </div>

            {exportMessage && (
              <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {exportMessage}
              </div>
            )}

            <div className="border-b border-gray-100 px-5 py-3 text-xs text-gray-500">
              <span className="font-bold text-gray-700">LEYENDA:</span>
              <span className="ml-3 inline-flex items-center gap-2 text-emerald-600">
                <span className="h-3 w-3 rounded-full border border-slate-300 bg-white" />
                Normal 0-80 km/h
              </span>
              <span className="ml-3 inline-flex items-center gap-2 text-orange-600">
                <span className="h-3 w-3 rounded-full border border-yellow-300 bg-yellow-50" />
                Precaucion 81-90 km/h
              </span>
              <span className="ml-3 inline-flex items-center gap-2 font-bold text-red-600">
                <span className="h-3 w-3 rounded-full border border-red-300 bg-red-50" />
                Exceso &gt;90 km/h
              </span>
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
                          <td className="px-5 py-3 font-black text-slate-800">
                            <span className="inline-flex items-center gap-2">
                              <TrackingIcon name="gauge" className="h-4 w-4 text-blue-500" />
                              {registro.placa}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-slate-700">{formatFechaHora(registro.fechaHora)}</td>
                          <td className="px-5 py-3">
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                              {registro.proveedor}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-700">
                            <span className="inline-flex items-center gap-2">
                              <TrackingIcon name="navigation" className="h-4 w-4 text-slate-400" />
                              {formatKm(registro.distanciaTotal)}
                            </span>
                          </td>
                          <td className={`px-5 py-3 ${speedTone.text}`}>
                            <span className="inline-flex items-center gap-2">
                              <TrackingIcon name="pulse" className={`h-4 w-4 ${speedTone.iconClass}`} />
                              {registro.velocidadKmh} km/h
                            </span>
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
