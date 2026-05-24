import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  exportHistorialJornadasCsv,
  getHistorialAlertaDetalle,
  getHistorialJornadas,
  getHistorialJornadasMetrics,
} from '@nanutech/api-client';
import type {
  HistorialAlertaDetalle,
  HistorialJornadaRaw,
  HistorialJornadasFilters,
  HistorialJornadasMetrics,
} from '@nanutech/api-client';

type EstadoJornada = 'EN_CURSO' | 'ACTIVA' | 'COMPLETADA';

type JornadaHistorial = {
  id: string;
  fecha: string;
  conductor: string;
  placa: string;
  contrato: string;
  horaInicio: string;
  horaFin: string;
  duracion: string;
  estado: EstadoJornada;
  observaciones: string;
  tieneObservaciones: boolean;
  tipoAlerta: 'PANICO' | 'AUXILIO_MECANICO' | null;
  cantidadAlertas: number;
  alertaDescripcion: string;
  fechaAlerta: string;
  latitud: string;
  longitud: string;
  origen: string;
  destino: string;
};

const emptyMetrics: HistorialJornadasMetrics = {
  total_jornadas: 0,
  alertas_panico: 0,
  auxilio_mecanico: 0,
  jornadas_observaciones: 0,
  km_promedio: 0,
};

const readText = (value: unknown, fallback = 'N/A') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'N/A';

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatDateLong = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || 'N/A';

  return date.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${date.toLocaleDateString('es-PE')} ${date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const formatTime = (value?: string | null) => {
  if (!value) return '-';

  const text = String(value);
  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  const parsed = new Date(`2000-01-01 ${text}`);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  return text;
};

const getFechaValue = (raw: HistorialJornadaRaw) => {
  const value = raw.fecha ?? raw.fecha_jornada ?? '';
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
};

const extractPlaca = (raw: HistorialJornadaRaw) => {
  const camion = readText(raw.placa ?? raw.camion);
  return camion.includes(' - ') ? camion.split(' - ')[0] : camion;
};

const parseHorario = (raw: HistorialJornadaRaw) => {
  const horario = readText(raw.horario, '');
  const [inicio, fin] = horario.split(' - ');

  return {
    horaInicio: formatTime(raw.hora_inicio ?? inicio),
    horaFin: fin && fin !== 'En curso' ? formatTime(raw.hora_fin ?? fin) : formatTime(raw.hora_fin),
  };
};

const normalizeEstado = (value?: string): EstadoJornada => {
  const estado = readText(value, '').toUpperCase();
  if (estado.includes('COMPLET') || estado.includes('FINALIZ')) return 'COMPLETADA';
  if (estado.includes('REGISTR') || estado.includes('PENDIENT')) return 'ACTIVA';
  return 'EN_CURSO';
};

const normalizeJornada = (raw: HistorialJornadaRaw): JornadaHistorial => {
  const tipoAlerta = raw.es_panico
    ? 'PANICO'
    : raw.es_auxilio
      ? 'AUXILIO_MECANICO'
      : raw.tipo_alerta === 'PANICO' || raw.tipo_alerta === 'AUXILIO_MECANICO'
        ? raw.tipo_alerta
        : null;
  const observaciones = readText(raw.observaciones, '');
  const horario = parseHorario(raw);

  return {
    id: readText(raw.id, 'N/A'),
    fecha: getFechaValue(raw),
    conductor: readText(raw.conductor),
    placa: extractPlaca(raw),
    contrato: readText(raw.contrato),
    horaInicio: horario.horaInicio,
    horaFin: horario.horaFin,
    duracion: readText(raw.duracion_total, '-'),
    estado: normalizeEstado(raw.estado),
    observaciones,
    tieneObservaciones: Boolean(raw.tiene_observaciones ?? observaciones),
    tipoAlerta,
    cantidadAlertas: tipoAlerta ? 1 : 0,
    alertaDescripcion: readText(raw.alerta_descripcion, ''),
    fechaAlerta: readText(raw.fecha_alerta, ''),
    latitud: readText(raw.latitud, ''),
    longitud: readText(raw.longitud, ''),
    origen: readText(raw.origen),
    destino: readText(raw.destino),
  };
};

const buildBackendFilters = (
  search: string,
  alertFilter: string,
  from: string,
  to: string,
  observationFilter: string
): HistorialJornadasFilters => ({
  q: search,
  estado_alerta: alertFilter as HistorialJornadasFilters['estado_alerta'],
  fecha_desde: from,
  fecha_hasta: to,
  observaciones: observationFilter === 'con-observaciones' ? 'true' : '',
});

function Icon({ children, tone = 'slate' }: { children: string; tone?: 'blue' | 'red' | 'orange' | 'green' | 'purple' | 'slate' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`inline-grid h-8 w-8 place-items-center rounded-md text-sm font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function DocumentIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h7l5 5v13H7V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 3v6h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 13h6M10 17h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  helper,
  tone,
  symbol,
}: {
  label: string;
  value: number | string;
  helper: string;
  tone: 'blue' | 'red' | 'orange' | 'green' | 'purple';
  symbol: string;
}) {
  const borders = {
    blue: 'border-l-blue-500',
    red: 'border-l-red-500',
    orange: 'border-l-orange-500',
    green: 'border-l-emerald-500',
    purple: 'border-l-purple-500',
  };

  return (
    <article className={`rounded-lg border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${borders[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{helper}</p>
        </div>
        <Icon tone={tone}>{symbol}</Icon>
      </div>
    </article>
  );
}

function EstadoBadge({ estado }: { estado: EstadoJornada }) {
  const styles = {
    EN_CURSO: 'bg-blue-100 text-blue-700',
    ACTIVA: 'bg-amber-100 text-amber-700',
    COMPLETADA: 'bg-emerald-100 text-emerald-700',
  };

  const labels = {
    EN_CURSO: 'En Curso',
    ACTIVA: 'Activa',
    COMPLETADA: 'Completada',
  };

  return (
    <span className={`inline-flex min-w-24 justify-center rounded-full px-3 py-1 text-xs font-bold ${styles[estado]}`}>
      {labels[estado]}
    </span>
  );
}

function ObservacionesModal({ jornada, onClose }: { jornada: JornadaHistorial; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start gap-3">
        <Icon tone="purple">▣</Icon>
        <div>
          <h3 className="text-lg font-bold text-slate-950">Observaciones del Conductor</h3>
          <p className="text-sm text-slate-500">Comentarios registrados al finalizar la jornada</p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-purple-100 bg-purple-50 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Conductor" value={jornada.conductor} />
          <Info label="Fecha de Jornada" value={formatDate(jornada.fecha)} />
          <Info label="Placa" value={jornada.placa} />
          <Info label="Duracion" value={jornada.duracion} />
          <Info label="Origen" value={jornada.origen} />
          <Info label="Destino" value={jornada.destino} />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50/60 p-4">
        <p className="text-xs font-bold text-purple-700">Observaciones Registradas</p>
        <p className="mt-3 rounded-md bg-white p-3 text-sm text-slate-700">
          {jornada.observaciones || 'Sin observaciones'}
        </p>
      </div>

      <ModalActions onClose={onClose} />
    </Modal>
  );
}

function AlertasModal({
  jornada,
  detail,
  loading,
  onClose,
}: {
  jornada: JornadaHistorial;
  detail: HistorialAlertaDetalle | null;
  loading: boolean;
  onClose: () => void;
}) {
  const tipo = detail?.tipo_alerta ?? jornada.tipoAlerta;
  const isPanic = tipo === 'PANICO';
  const tone = isPanic ? 'red' : 'orange';
  const title = isPanic ? 'ALERTA DE PANICO' : 'AUXILIO MECANICO';
  const description = isPanic
    ? 'ALERTA DE PANICO - Prioridad Critica'
    : detail?.detalle_resolucion || detail?.detalle || jornada.alertaDescripcion || 'Asistencia tecnica requerida';
  const mapsUrl = `https://www.google.com/maps?q=${detail?.latitud ?? jornada.latitud},${detail?.longitud ?? jornada.longitud}`;

  return (
    <Modal onClose={onClose}>
      <div className="flex items-start gap-3">
        <Icon tone="red">!</Icon>
        <div>
          <h3 className="text-lg font-bold text-slate-950">Detalle de Alertas de Emergencia</h3>
          <p className="text-sm text-slate-500">Informacion completa de incidentes registrados durante la jornada</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 sm:grid-cols-2">
        <Info label="Conductor" value={detail?.conductor || jornada.conductor} />
        <Info label="Placa" value={detail?.placa || jornada.placa} />
        <Info label="Fecha" value={formatDate(String(detail?.fecha_jornada || jornada.fecha))} />
        <Info label="ID Jornada" value={detail?.jornada_id || jornada.id} />
        <Info label="Origen" value={detail?.origen || jornada.origen} />
        <Info label="Destino" value={detail?.destino || jornada.destino} />
      </div>

      <div className="mt-5">
        <p className="text-sm font-bold text-slate-900">Alertas Registradas</p>

        <div className={`mt-3 rounded-lg border p-4 ${isPanic ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
          <div className="flex items-center justify-between gap-3">
            <span className={`rounded-md px-3 py-1 text-xs font-bold text-white ${isPanic ? 'bg-red-500' : 'bg-orange-500'}`}>
              {title}
            </span>
            {detail?.estado === 'RESUELTA' && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                Resuelta
              </span>
            )}
          </div>

          {loading ? (
            <p className="mt-5 text-sm text-slate-500">Cargando detalle...</p>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Info label="Hora de Activacion" value={formatDateTime(detail?.fecha_hora || jornada.fechaAlerta)} />
                <Info label="Hora de Resolucion" value={formatDateTime(detail?.atendida_at)} />
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className={`mt-4 block rounded-lg border bg-white p-3 text-sm font-semibold ${isPanic ? 'border-red-200 text-red-700' : 'border-orange-200 text-orange-700'}`}
              >
                Ubicacion en ruta: {(detail?.latitud ?? jornada.latitud) || 'N/A'}, {(detail?.longitud ?? jornada.longitud) || 'N/A'}
              </a>

              <p className={`mt-4 rounded-md bg-white p-3 text-sm ${isPanic ? 'text-red-700' : 'text-orange-700'}`}>
                {description}
              </p>
            </>
          )}
        </div>
      </div>

      <ModalActions onClose={onClose} />
    </Modal>
  );
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/55 p-4">
      <div className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-5 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
          aria-label="Cerrar modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-5 flex justify-end">
      <button
        type="button"
        onClick={onClose}
        className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Cerrar
      </button>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value || 'N/A'}</p>
    </div>
  );
}

export default function HistorialJornadasPage() {
  const [rows, setRows] = useState<JornadaHistorial[]>([]);
  const [metrics, setMetrics] = useState<HistorialJornadasMetrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [conductor, setConductor] = useState('');
  const [alertFilter, setAlertFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [observationFilter, setObservationFilter] = useState('');
  const [selectedObservation, setSelectedObservation] = useState<JornadaHistorial | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<JornadaHistorial | null>(null);
  const [alertDetail, setAlertDetail] = useState<HistorialAlertaDetalle | null>(null);
  const [loadingAlert, setLoadingAlert] = useState(false);

  const backendFilters = useMemo(
    () => buildBackendFilters(search, alertFilter, from, to, observationFilter),
    [alertFilter, from, observationFilter, search, to]
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const [records, currentMetrics] = await Promise.all([
          getHistorialJornadas(backendFilters),
          getHistorialJornadasMetrics(backendFilters),
        ]);

        if (active) {
          setRows(records.map(normalizeJornada));
          setMetrics(currentMetrics);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [backendFilters]);

  const conductores = useMemo(
    () => Array.from(new Set(rows.map((row) => row.conductor).filter(Boolean))).sort(),
    [rows]
  );

  const filteredRows = useMemo(() => {
    const conductorText = conductor.toLowerCase();

    return rows.filter((row) => {
      const matchesConductor = !conductorText || row.conductor.toLowerCase() === conductorText;
      const matchesObservations =
        observationFilter !== 'sin-observaciones' || !row.tieneObservaciones;

      return matchesConductor && matchesObservations;
    });
  }, [conductor, observationFilter, rows]);

  const handleOpenAlert = async (row: JornadaHistorial) => {
    setSelectedAlert(row);
    setAlertDetail(null);
    setLoadingAlert(true);

    try {
      setAlertDetail(await getHistorialAlertaDetalle(row.id));
    } finally {
      setLoadingAlert(false);
    }
  };

  const handleExport = async () => {
    const blob = await exportHistorialJornadasCsv(backendFilters);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'historial-jornadas.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/15 text-xl font-bold">↗</div>
            <div>
              <h2 className="text-2xl font-bold">Historial de Jornadas</h2>
              <p className="text-sm text-blue-100">Monitoreo completo de operaciones con alertas de emergencia</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="rounded-md bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Jornadas" value={metrics.total_jornadas} helper="Registros del periodo" tone="blue" symbol="◎" />
        <MetricCard label="Alertas Panico" value={metrics.alertas_panico} helper="Jornadas afectadas" tone="red" symbol="!" />
        <MetricCard label="Auxilio Mecanico" value={metrics.auxilio_mecanico} helper="Jornadas afectadas" tone="orange" symbol="⌁" />
        <MetricCard label="Con Observaciones" value={metrics.jornadas_observaciones} helper="Auditoria pendiente" tone="purple" symbol="▣" />
        <MetricCard label="KM Promedio" value={Math.round(metrics.km_promedio)} helper="Kilometros por jornada" tone="green" symbol="↗" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <Icon tone="blue">▽</Icon>
            <div>
              <h3 className="text-sm font-bold text-slate-950">Filtros Avanzados</h3>
              <p className="text-xs text-slate-500">Refina tu busqueda con multiples criterios</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          <label className="text-xs font-semibold text-slate-600">
            Busqueda General
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Conductor, placa, ID de jornada..."
              className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500"
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Nombre de Chofer
            <select
              value={conductor}
              onChange={(event) => setConductor(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500"
            >
              <option value="">Todos los conductores</option>
              {conductores.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Estado de Alerta
            <select
              value={alertFilter}
              onChange={(event) => setAlertFilter(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500"
            >
              <option value="">Todas las alertas</option>
              <option value="PANICO">Panico</option>
              <option value="AUXILIO_MECANICO">Auxilio mecanico</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Rango de Fechas - Desde
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500"
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Rango de Fechas - Hasta
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500"
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Observaciones
            <select
              value={observationFilter}
              onChange={(event) => setObservationFilter(event.target.value)}
              className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500"
            >
              <option value="">Todas</option>
              <option value="con-observaciones">Con observaciones</option>
              <option value="sin-observaciones">Sin observaciones</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Registro Detallado de Jornadas</h3>
            <p className="text-xs text-slate-500">Historial completo con alertas, observaciones y auditoria de cumplimiento</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {filteredRows.length} registros
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[1080px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="px-3 py-3 font-bold">Fecha</th>
                <th className="px-3 py-3 font-bold">Nombre del Chofer</th>
                <th className="px-3 py-3 font-bold">Placa del Camion</th>
                <th className="px-3 py-3 font-bold">Hora de Inicio</th>
                <th className="px-3 py-3 font-bold">Hora de Fin</th>
                <th className="px-3 py-3 font-bold">Duracion Total</th>
                <th className="px-3 py-3 font-bold">Estado</th>
                <th className="px-3 py-3 font-bold">Alertas</th>
                <th className="px-3 py-3 font-bold">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center text-slate-500">
                    Cargando historial...
                  </td>
                </tr>
              )}

              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center text-slate-500">
                    No se encontraron jornadas
                  </td>
                </tr>
              )}

              {!loading &&
                filteredRows.map((row) => (
                  <tr
                    key={`${row.id}-${row.tipoAlerta ?? 'sin-alerta'}`}
                    className={`border-b border-slate-100 text-slate-700 ${row.tipoAlerta === 'PANICO' ? 'bg-red-50' : row.tipoAlerta === 'AUXILIO_MECANICO' ? 'bg-orange-50/60' : 'bg-white'}`}
                  >
                    <td className="px-3 py-3">{formatDate(row.fecha)}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{row.conductor}</td>
                    <td className="px-3 py-3">{row.placa}</td>
                    <td className="px-3 py-3">{row.horaInicio}</td>
                    <td className="px-3 py-3">{row.horaFin}</td>
                    <td className="px-3 py-3 font-medium">{row.duracion}</td>
                    <td className="px-3 py-3">
                      <EstadoBadge estado={row.estado} />
                    </td>
                    <td className="px-3 py-3">
                      {row.tipoAlerta ? (
                        <button
                          type="button"
                          onClick={() => handleOpenAlert(row)}
                          className={`rounded-md border px-3 py-1 text-xs font-bold ${row.tipoAlerta === 'PANICO' ? 'border-red-200 bg-red-100 text-red-700' : 'border-orange-200 bg-orange-100 text-orange-700'}`}
                          aria-label={`Ver alerta ${row.tipoAlerta === 'PANICO' ? 'panico' : 'auxilio'}`}
                        >
                          {row.tipoAlerta === 'PANICO' ? '⚠ 1' : '⌁ 1'}
                        </button>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {row.tieneObservaciones ? (
                        <button
                          type="button"
                          onClick={() => setSelectedObservation(row)}
                          className="inline-grid h-9 w-9 place-items-center rounded-md bg-purple-100 text-purple-600 transition hover:bg-purple-200"
                          aria-label="Ver observaciones"
                        >
                          <DocumentIcon />
                        </button>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedObservation && (
        <ObservacionesModal jornada={selectedObservation} onClose={() => setSelectedObservation(null)} />
      )}

      {selectedAlert && (
        <AlertasModal
          jornada={selectedAlert}
          detail={alertDetail}
          loading={loadingAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </section>
  );
}

export { normalizeJornada, buildBackendFilters, formatDateLong };

