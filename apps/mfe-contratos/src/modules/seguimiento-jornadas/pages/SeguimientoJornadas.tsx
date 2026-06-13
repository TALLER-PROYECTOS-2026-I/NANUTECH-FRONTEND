import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  createSeguimientoJornada,
  exportSeguimientoJornadasCsv,
  getSeguimientoConductoresCatalogo,
  getSeguimientoContratosVigentesCatalogo,
  getSeguimientoJornadas,
  getSeguimientoUnidadesDisponibles,
} from '@nanutech/api-client';
import type {
  SeguimientoConductorOption,
  SeguimientoContratoOption,
  SeguimientoJornadaFilters,
  SeguimientoUnidadOption,
} from '@nanutech/api-client';

// Tipo flexible para recibir filas del backend antes de normalizarlas al modelo visual.
type JornadaRaw = Record<string, unknown>;

// Modelo que usa la tabla y los modales de HU05 luego de adaptar la respuesta del backend.
type JornadaSeguimiento = {
  id: string;
  fecha: string;
  chofer: string;
  placa: string;
  horario: string;
  horaInicio: string;
  horaFin: string | null;
  duracionTotal: string;
  estado: 'EN_CURSO' | 'COMPLETADA' | 'CANCELADA' | 'REGISTRADA';
  observaciones: string;
  tieneObservaciones: boolean;
  conductorId: string;
  contrato: string;
  kilometros: string;
};

// Estado controlado del formulario "+ Nueva Jornada".
type JornadaForm = {
  conductorId: string;
  unidadId: string;
  contratoId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  kilometros: string;
  origen: string;
  destino: string;
  observaciones: string;
};

// Valores iniciales para limpiar el formulario cada vez que se registra o cancela.
const initialForm: JornadaForm = {
  conductorId: '',
  unidadId: '',
  contratoId: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  kilometros: '',
  origen: '',
  destino: '',
  observaciones: '',
};

// Lee el primer campo disponible de una respuesta que puede venir con nombres alternativos.
const read = (source: JornadaRaw, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }

  return undefined;
};

// Convierte un valor desconocido a texto usable y aplica fallback cuando está vacío.
const toText = (value: unknown, fallback = 'N/A') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

// Normaliza fechas del backend a formato YYYY-MM-DD para ordenar, filtrar y renderizar.
const toDateValue = (value: unknown) => {
  const text = toText(value, '');
  if (!text) return '';

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text.slice(0, 10);

  return date.toISOString().slice(0, 10);
};

// Convierte horas como "08:00 AM" a un formato de tabla consistente.
const toTimeDisplay = (value: string) => {
  const text = value.trim();
  if (!text) return '';
  if (/^\d{2}:\d{2}$/.test(text)) return text;

  const parsed = new Date(`2000-01-01 ${text}`);
  if (Number.isNaN(parsed.getTime())) return text;

  return parsed.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// Separa el campo compuesto "horario" que devuelve el backend en hora inicio y fin.
const parseHorario = (horario: unknown) => {
  const text = toText(horario, '');
  if (!text || text === 'Sin iniciar') {
    return { horaInicio: '', horaFin: null };
  }

  const [inicio, fin] = text.split(' - ');

  return {
    horaInicio: toTimeDisplay(inicio ?? ''),
    horaFin: fin && fin !== 'En curso' ? toTimeDisplay(fin) : null,
  };
};

// Extrae solo la placa desde textos como "ABC-123 - Volvo FH16".
const extractPlaca = (camion: unknown) => {
  const text = toText(camion);
  return text.includes(' - ') ? text.split(' - ')[0] : text;
};

// Traduce estados técnicos del backend a las llaves visuales usadas por la tabla.
const normalizeEstado = (value: unknown): JornadaSeguimiento['estado'] => {
  const estado = toText(value, 'EN_PROCESO').toUpperCase();

  if (estado.includes('COMPLET') || estado.includes('FINALIZ')) return 'COMPLETADA';
  if (estado.includes('CANCEL')) return 'CANCELADA';
  if (estado.includes('REGISTR')) return 'REGISTRADA';
  return 'EN_CURSO';
};

// Adapta una fila enriquecida de GET /jornadas al modelo que consume la UI.
const normalizeJornada = (raw: JornadaRaw, index: number): JornadaSeguimiento => {
  const horario = toText(read(raw, ['horario']), '');
  const parsedHorario = parseHorario(horario);
  const observaciones = toText(read(raw, ['observaciones']), '');

  return {
    id: toText(read(raw, ['id', 'jornada_id']), `jornada-${index}`),
    fecha: toDateValue(read(raw, ['fecha', 'fecha_jornada'])),
    chofer: toText(read(raw, ['conductor', 'chofer', 'conductor_nombre'])),
    placa: extractPlaca(read(raw, ['placa', 'camion'])),
    horario,
    horaInicio: parsedHorario.horaInicio,
    horaFin: parsedHorario.horaFin,
    duracionTotal: toText(read(raw, ['duracion_total']), parsedHorario.horaFin ? 'N/A' : 'En curso'),
    estado: normalizeEstado(read(raw, ['estado'])),
    observaciones,
    tieneObservaciones: Boolean(read(raw, ['tiene_observaciones']) ?? observaciones),
    conductorId: toText(read(raw, ['conductor_id']), ''),
    contrato: toText(read(raw, ['contrato']), ''),
    kilometros: toText(read(raw, ['km_recorridos', 'km_estimados']), ''),
  };
};

// Formatea la fecha para mostrarla al usuario en formato peruano.
const formatDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value || 'N/A';

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Etiquetas visibles para los estados normalizados.
const estadoLabel: Record<JornadaSeguimiento['estado'], string> = {
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  REGISTRADA: 'Sin iniciar',
};

function Icon({ children, tone = 'slate' }: { children: string; tone?: 'blue' | 'red' | 'orange' | 'green' | 'purple' | 'slate' | 'amber' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`inline-grid h-8 w-8 place-items-center rounded-md text-sm font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 21v-2a8 8 0 0116 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 3h15v13H1z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EstadoBadge({ estado }: { estado: JornadaSeguimiento['estado'] }) {
  const styles = {
    EN_CURSO: 'bg-blue-100 text-blue-700',
    COMPLETADA: 'bg-emerald-100 text-emerald-700',
    CANCELADA: 'bg-red-100 text-red-700',
    REGISTRADA: 'bg-slate-100 text-slate-700',
  };

  const dotStyles = {
    EN_CURSO: 'bg-blue-500',
    COMPLETADA: 'bg-emerald-500',
    CANCELADA: 'bg-red-500',
    REGISTRADA: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex min-w-24 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${styles[estado]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[estado]}`} />
      {estadoLabel[estado]}
    </span>
  );
}

function Modal({ children, onClose, wide = false }: { children: ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/55 p-4">
      <div
        className={`relative max-h-[88vh] w-full overflow-y-auto rounded-lg bg-white p-5 shadow-2xl ${
          wide ? 'max-w-2xl' : 'max-w-xl'
        }`}
      >
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

function ModalActions({
  onClose,
  primaryLabel,
  onPrimary,
  primaryDisabled,
}: {
  onClose: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
}) {
  return (
    <div className={`mt-5 flex gap-3 ${primaryLabel ? 'justify-between' : 'justify-end'}`}>
      <button
        type="button"
        onClick={onClose}
        disabled={primaryDisabled}
        className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancelar
      </button>
      {primaryLabel && onPrimary && (
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {primaryLabel}
        </button>
      )}
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

const inputClassName =
  'mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-blue-500';

// Página principal de HU05: lista jornadas, filtra, exporta, muestra observaciones y registra nuevas jornadas.
export default function SeguimientoJornadas() {
  // Datos principales del historial y filtros visibles.
  const [data, setData] = useState<JornadaSeguimiento[]>([]);
  const [search, setSearch] = useState('');
  const [conductor, setConductor] = useState('TODOS');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  // Estados de modales, carga y feedback del formulario.
  const [observacionModal, setObservacionModal] = useState<JornadaSeguimiento | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [form, setForm] = useState<JornadaForm>(initialForm);

  // Catálogos usados por el modal de registro para enviar IDs reales al backend.
  const [conductoresCatalogo, setConductoresCatalogo] = useState<SeguimientoConductorOption[]>([]);
  const [unidadesCatalogo, setUnidadesCatalogo] = useState<SeguimientoUnidadOption[]>([]);
  const [contratosCatalogo, setContratosCatalogo] = useState<SeguimientoContratoOption[]>([]);

  // Filtros que se envían a GET /jornadas y GET /jornadas/exportar.
  const backendFilters = useMemo<SeguimientoJornadaFilters>(
    () => ({
      q: search,
      fecha_desde: desde,
      fecha_hasta: hasta,
    }),
    [desde, hasta, search],
  );

  // Carga el historial cada vez que cambian búsqueda o rango de fechas.
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const jornadas = (await getSeguimientoJornadas(backendFilters)) as JornadaRaw[];
        setData(jornadas.map(normalizeJornada));
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [backendFilters]);

  // Carga catalogos bajo demanda para poblar el modal de Nueva Jornada.
  const loadCatalogs = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError('');

    const [conductoresRes, unidadesRes, contratosRes] = await Promise.allSettled([
      getSeguimientoConductoresCatalogo(),
      getSeguimientoUnidadesDisponibles(),
      getSeguimientoContratosVigentesCatalogo(),
    ]);

    if (conductoresRes.status === 'fulfilled') {
      setConductoresCatalogo(
        conductoresRes.value.filter((item) => item.activo === true || `${item.estado ?? ''}`.toUpperCase() === 'ACTIVO'),
      );
    } else {
      setConductoresCatalogo([]);
    }

    if (unidadesRes.status === 'fulfilled') {
      setUnidadesCatalogo(unidadesRes.value);
    } else {
      setUnidadesCatalogo([]);
    }

    if (contratosRes.status === 'fulfilled') {
      setContratosCatalogo(contratosRes.value);
    } else {
      setContratosCatalogo([]);
    }

    const failedCatalogs = [
      conductoresRes.status === 'rejected' ? 'conductores' : '',
      unidadesRes.status === 'rejected' ? 'unidades' : '',
      contratosRes.status === 'rejected' ? 'contratos' : '',
    ].filter(Boolean);

    if (failedCatalogs.length > 0) {
      setCatalogError(`No se pudo cargar el catalogo de ${failedCatalogs.join(', ')} desde el backend.`);
    }

    setCatalogLoading(false);
  }, []);

  // Construye el selector local de conductores a partir de los registros cargados.
  const conductores = useMemo(
    () =>
      Array.from(new Set(data.map((jornada) => jornada.chofer).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b)),
    [data],
  );

  // Aplica el filtro local por conductor porque el backend de HU05 filtra por conductor_id.
  const filtered = useMemo(
    () =>
      conductor === 'TODOS'
        ? data
        : data.filter((jornada) => jornada.chofer === conductor),
    [conductor, data],
  );

  // Descarga el CSV oficial generado por el backend con los filtros vigentes.
  const exportCSV = async () => {
    const blob = await exportSeguimientoJornadasCsv(backendFilters);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'jornadas.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Recarga la tabla después de registrar una jornada nueva.
  const reloadJornadas = async () => {
    const jornadas = (await getSeguimientoJornadas(backendFilters)) as JornadaRaw[];
    setData(jornadas.map(normalizeJornada));
  };

  // Actualiza un campo del formulario y limpia mensajes anteriores.
  const updateForm = (field: keyof JornadaForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError('');
    setFormSuccess('');
  };

  // Recupera el usuario autenticado para llenar creado_por en POST /jornadas.
  const getCurrentUserId = () => {
    const rawUser = localStorage.getItem('nanutech_user');
    if (!rawUser) return '';

    try {
      const user = JSON.parse(rawUser) as { id?: string };
      return user.id || '';
    } catch {
      return '';
    }
  };

  // Valida el formulario, crea la jornada en backend y refresca la tabla.
  const handleCreateJornada = async () => {
    setFormError('');
    setFormSuccess('');

    if (!form.conductorId || !form.unidadId || !form.contratoId || !form.fecha) {
      setFormError('Complete conductor, unidad, contrato y fecha para registrar la jornada.');
      return;
    }

    if (form.kilometros && Number.isNaN(Number(form.kilometros))) {
      setFormError('Los kilometros recorridos deben ser un numero valido.');
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      setFormError('No se pudo identificar el usuario que registra la jornada.');
      return;
    }

    try {
      setSaving(true);
      await createSeguimientoJornada({
        conductor_id: form.conductorId,
        unidad_id: form.unidadId,
        contrato_id: form.contratoId,
        creado_por: userId,
        fecha_jornada: form.fecha,
        origen: form.origen,
        destino: form.destino,
        km_recorridos: form.kilometros ? Number(form.kilometros) : 0,
        observaciones: form.observaciones,
        estado: 'REGISTRADA',
      });
      await reloadJornadas();
      setForm(initialForm);
      setFormSuccess('Jornada registrada correctamente.');
      setShowForm(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Error al registrar jornada.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Seguimiento de Jornadas</h2>
          <p className="text-sm text-slate-500">
            Monitorea el historial completo de jornadas laborales de los conductores
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setFormError('');
              setFormSuccess('');
              setShowForm(true);
              if (
                conductoresCatalogo.length === 0 ||
                unidadesCatalogo.length === 0 ||
                contratosCatalogo.length === 0
              ) {
                void loadCatalogs();
              }
            }}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Nueva Jornada
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <DownloadIcon />
            Exportar CSV
          </button>
        </div>
      </div>

      {formSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {formSuccess}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <Icon tone="blue">▽</Icon>
            <div>
              <h3 className="text-sm font-bold text-slate-950">Filtros de busqueda</h3>
              <p className="text-xs text-slate-500">Busca por conductor, placa o rango de fechas</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[2fr_1.2fr_1fr_1fr]">
          <label className="text-xs font-semibold text-slate-600">
            Busqueda general
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por conductor, placa..."
              className={inputClassName}
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Conductor
            <select value={conductor} onChange={(event) => setConductor(event.target.value)} className={inputClassName}>
              <option value="TODOS">Todos los conductores</option>
              {conductores.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Fecha desde
            <input
              type="date"
              value={desde}
              onChange={(event) => setDesde(event.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Fecha hasta
            <input
              type="date"
              value={hasta}
              onChange={(event) => setHasta(event.target.value)}
              className={inputClassName}
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Historial de Jornadas</h3>
            <p className="text-xs text-slate-500">
              Mostrando {filtered.length} de {data.length} jornadas registradas
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <WarningIcon />
              Haz clic en el icono de observaciones para ver los detalles
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Cargando jornadas...</div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="px-3 py-3 font-bold">Fecha</th>
                  <th className="px-3 py-3 font-bold">Nombre del Chofer</th>
                  <th className="px-3 py-3 font-bold">Placa del Camion</th>
                  <th className="px-3 py-3 font-bold">Hora de Inicio</th>
                  <th className="px-3 py-3 font-bold">Hora de Fin</th>
                  <th className="px-3 py-3 font-bold">Duracion Total</th>
                  <th className="px-3 py-3 font-bold">Estado</th>
                  <th className="px-3 py-3 font-bold text-center">Observaciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-12 text-center text-slate-500">
                      Sin datos
                    </td>
                  </tr>
                ) : (
                  filtered.map((jornada) => {
                    const hasObservaciones = jornada.tieneObservaciones;

                    return (
                      <tr
                        key={jornada.id}
                        className={`border-b border-slate-100 text-slate-700 transition ${
                          hasObservaciones
                            ? 'bg-amber-50/70 hover:bg-amber-100/80'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-3 py-3">{formatDate(jornada.fecha)}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                            <PersonIcon />
                            {jornada.chofer}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <TruckIcon />
                            {jornada.placa}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <ClockIcon />
                            {jornada.horaInicio || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {jornada.horaFin ? (
                            <span className="inline-flex items-center gap-1.5 text-slate-700">
                              <ClockIcon />
                              {jornada.horaFin}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(event) => event.stopPropagation()}
                              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"
                            >
                              Activa
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                            <ClockIcon />
                            {jornada.duracionTotal}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <EstadoBadge estado={jornada.estado} />
                        </td>
                        <td className="px-3 py-3 text-center">
                          {hasObservaciones ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setObservacionModal(jornada);
                              }}
                              className="inline-grid place-items-center rounded-md transition hover:opacity-70"
                              aria-label="Ver observaciones"
                            >
                              <WarningIcon />
                            </button>
                          ) : (
                            <span className="text-slate-300">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {observacionModal && (
        <Modal onClose={() => setObservacionModal(null)}>
          <div className="flex items-start gap-3">
            <Icon tone="amber">▣</Icon>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Observaciones de la Jornada</h3>
              <p className="text-sm text-slate-500">
                Jornada del {formatDate(observacionModal.fecha)} - {observacionModal.chofer}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-amber-100 bg-amber-50 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Conductor" value={observacionModal.chofer} />
              <Info label="Camion" value={observacionModal.placa} />
              <Info label="Horario" value={observacionModal.horario || 'Sin iniciar'} />
              <Info label="Duracion" value={observacionModal.duracionTotal} />
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
            <p className="text-xs font-bold text-amber-700">Observaciones del Conductor</p>
            <p className="mt-3 rounded-md bg-white p-3 text-sm text-slate-700">
              {observacionModal.observaciones || 'Sin observaciones'}
            </p>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setObservacionModal(null)}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}

      {showForm && (
        <Modal wide onClose={() => setShowForm(false)}>
          <div className="flex items-start gap-3">
            <Icon tone="blue">+</Icon>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Registrar Nueva Jornada</h3>
              <p className="text-sm text-slate-500">
                Complete los datos para vincular correctamente los recursos operativos y crear la jornada.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">
            Los campos marcados con (*) son obligatorios para continuar con el registro.
          </div>

          {catalogError && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
              {catalogError}
            </div>
          )}

          <section className="mt-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Icon tone="slate">◎</Icon>
              <h4 className="text-sm font-bold text-slate-900">Asignacion de Recursos Operativos</h4>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Conductor *">
                <select
                  value={form.conductorId}
                  onChange={(event) => updateForm('conductorId', event.target.value)}
                  disabled={catalogLoading || saving}
                  className="form-select"
                >
                  <option value="">Seleccionar...</option>
                  {conductoresCatalogo.map((item) => {
                    const label = `${item.nombres ?? ''} ${item.apellidos ?? ''}`.trim() || item.correo || item.id;
                    return (
                      <option key={item.id} value={item.id}>
                        {label}
                      </option>
                    );
                  })}
                  {catalogLoading && (
                    <option value="" disabled>
                      Cargando conductores...
                    </option>
                  )}
                  {!catalogLoading && conductoresCatalogo.length === 0 && (
                    <option value="" disabled>
                      No hay conductores activos
                    </option>
                  )}
                </select>
              </Field>
              <Field label="Unidad de Transporte *">
                <select
                  value={form.unidadId}
                  onChange={(event) => updateForm('unidadId', event.target.value)}
                  disabled={catalogLoading || saving}
                  className="form-select"
                >
                  <option value="">Seleccionar...</option>
                  {unidadesCatalogo.map((item) => (
                    <option key={item.id} value={item.id}>
                      {`${item.placa ?? item.id} ${item.marca ? `- ${item.marca}` : ''} ${item.modelo ?? ''}`.trim()}
                    </option>
                  ))}
                  {catalogLoading && (
                    <option value="" disabled>
                      Cargando unidades...
                    </option>
                  )}
                  {!catalogLoading && unidadesCatalogo.length === 0 && (
                    <option value="" disabled>
                      No hay unidades disponibles
                    </option>
                  )}
                </select>
                {!catalogLoading && (
                  <p className="mt-1 text-[11px] text-slate-500">{unidadesCatalogo.length} unidad(es) disponible(s)</p>
                )}
              </Field>
              <Field label="Contrato Comercial *">
                <select
                  value={form.contratoId}
                  onChange={(event) => updateForm('contratoId', event.target.value)}
                  disabled={catalogLoading || saving}
                  className="form-select"
                >
                  <option value="">Seleccionar...</option>
                  {contratosCatalogo.map((item) => (
                    <option key={item.id} value={item.id}>
                      {`${item.codigo ?? item.id}${item.cliente ? ` - ${item.cliente}` : ''}`}
                    </option>
                  ))}
                  {catalogLoading && (
                    <option value="" disabled>
                      Cargando contratos...
                    </option>
                  )}
                  {!catalogLoading && contratosCatalogo.length === 0 && (
                    <option value="" disabled>
                      No hay contratos vigentes
                    </option>
                  )}
                </select>
              </Field>
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Icon tone="green">↗</Icon>
              <h4 className="text-sm font-bold text-slate-900">Detalles de la Jornada</h4>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Fecha *">
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(event) => updateForm('fecha', event.target.value)}
                  disabled={saving}
                  className="form-input"
                />
              </Field>
              <Field label="Hora de inicio">
                <input
                  type="time"
                  value={form.horaInicio}
                  onChange={(event) => updateForm('horaInicio', event.target.value)}
                  disabled={saving}
                  className="form-input"
                />
              </Field>
              <Field label="Hora de fin">
                <input
                  type="time"
                  value={form.horaFin}
                  onChange={(event) => updateForm('horaFin', event.target.value)}
                  disabled={saving}
                  className="form-input"
                />
              </Field>
              <Field label="Kilometros Recorridos">
                <input
                  value={form.kilometros}
                  onChange={(event) => updateForm('kilometros', event.target.value)}
                  disabled={saving}
                  placeholder="0.00"
                  className="form-input"
                />
              </Field>
              <Field label="Origen">
                <input
                  value={form.origen}
                  onChange={(event) => updateForm('origen', event.target.value)}
                  disabled={saving}
                  placeholder="Ciudad o ubicacion"
                  className="form-input"
                />
              </Field>
              <Field label="Destino">
                <input
                  value={form.destino}
                  onChange={(event) => updateForm('destino', event.target.value)}
                  disabled={saving}
                  placeholder="Ciudad o ubicacion"
                  className="form-input"
                />
              </Field>
            </div>

            <label className="mt-4 block text-xs font-semibold text-slate-600">
              Observaciones
              <textarea
                value={form.observaciones}
                onChange={(event) => updateForm('observaciones', event.target.value)}
                disabled={saving}
                placeholder="Ingrese cualquier observacion o detalle adicional sobre la jornada..."
                className="mt-2 min-h-24 w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm font-normal text-slate-700 outline-none transition focus:border-blue-500"
              />
            </label>
          </section>

          {formError ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {formError}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold text-orange-700">
              Complete todos los campos obligatorios (*) para continuar.
            </div>
          )}

          <ModalActions
            onClose={() => {
              setShowForm(false);
              setFormError('');
            }}
            primaryLabel={saving ? 'Registrando...' : 'Registrar Jornada'}
            onPrimary={handleCreateJornada}
            primaryDisabled={saving}
          />
        </Modal>
      )}
    </section>
  );
}

// Wrapper reutilizable para mantener consistentes labels e inputs del modal.
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-slate-600">
      {label}
      <div className="mt-2 [&_.form-input]:h-10 [&_.form-input]:w-full [&_.form-input]:rounded-md [&_.form-input]:border [&_.form-input]:border-slate-200 [&_.form-input]:px-3 [&_.form-input]:text-sm [&_.form-input]:font-normal [&_.form-input]:text-slate-700 [&_.form-input]:outline-none [&_.form-input]:transition [&_.form-input:focus]:border-blue-500 [&_.form-select]:h-10 [&_.form-select]:w-full [&_.form-select]:rounded-md [&_.form-select]:border [&_.form-select]:border-slate-200 [&_.form-select]:px-3 [&_.form-select]:text-sm [&_.form-select]:font-normal [&_.form-select]:text-slate-700 [&_.form-select]:outline-none [&_.form-select]:transition [&_.form-select:focus]:border-blue-500">
        {children}
      </div>
    </label>
  );
}
