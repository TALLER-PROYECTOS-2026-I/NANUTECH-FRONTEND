import { useEffect, useMemo, useState } from 'react';
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

// Colores de badge asociados a cada estado operacional de la jornada.
const estadoClass: Record<JornadaSeguimiento['estado'], string> = {
  EN_CURSO: 'bg-blue-100 text-blue-700',
  COMPLETADA: 'bg-emerald-100 text-emerald-700',
  CANCELADA: 'bg-red-100 text-red-700',
  REGISTRADA: 'bg-slate-100 text-slate-700',
};

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

  // Carga catálogos una sola vez para poblar el modal de Nueva Jornada.
  useEffect(() => {
    const loadCatalogs = async () => {
      setCatalogLoading(true);

      try {
        const [conductoresRes, unidadesRes, contratosRes] = await Promise.all([
          getSeguimientoConductoresCatalogo(),
          getSeguimientoUnidadesDisponibles(),
          getSeguimientoContratosVigentesCatalogo(),
        ]);

        setConductoresCatalogo(
          conductoresRes.filter((item) => item.activo === true || `${item.estado ?? ''}`.toUpperCase() === 'ACTIVO'),
        );
        setUnidadesCatalogo(unidadesRes);
        setContratosCatalogo(contratosRes);
      } catch {
        setConductoresCatalogo([]);
        setUnidadesCatalogo([]);
        setContratosCatalogo([]);
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalogs();
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
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Seguimiento de Jornadas</h2>
          <p className="mt-1 text-sm text-slate-500">
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
            }}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Nueva Jornada
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Exportar CSV
          </button>
        </div>
      </section>

      {formSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {formSuccess}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Filtros de busqueda</h3>

        <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1.2fr_1fr_1fr]">
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Busqueda general</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por conductor, placa..."
              className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Conductor</span>
            <select
              value={conductor}
              onChange={(event) => setConductor(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
            >
              <option value="TODOS">Todos los conductores</option>
              {conductores.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Fecha desde</span>
            <input
              type="date"
              value={desde}
              onChange={(event) => setDesde(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Fecha hasta</span>
            <input
              type="date"
              value={hasta}
              onChange={(event) => setHasta(event.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Historial de Jornadas</h3>
            <p className="text-xs text-slate-500">
              Mostrando {filtered.length} de {data.length} jornadas registradas
            </p>
          </div>
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-orange-500">!</span>
            Haz clic en una fila con observaciones para ver los detalles
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Cargando jornadas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-700">
                  <th className="px-3 py-3">Fecha</th>
                  <th className="px-3 py-3">Nombre del Chofer</th>
                  <th className="px-3 py-3">Placa del Camion</th>
                  <th className="px-3 py-3">Hora de Inicio</th>
                  <th className="px-3 py-3">Hora de Fin</th>
                  <th className="px-3 py-3">Duracion Total</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3 text-center">Observaciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-sm text-slate-500">
                      Sin datos
                    </td>
                  </tr>
                ) : (
                  filtered.map((jornada) => {
                    const hasObservaciones = jornada.tieneObservaciones;

                    return (
                      <tr
                        key={jornada.id}
                        onClick={() => hasObservaciones && setObservacionModal(jornada)}
                        className={`border-b border-slate-100 text-xs transition ${
                          hasObservaciones
                            ? 'cursor-pointer bg-amber-50 hover:bg-amber-100'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-3 py-3 font-semibold text-slate-900">{formatDate(jornada.fecha)}</td>
                        <td className="px-3 py-3 text-slate-700">{jornada.chofer}</td>
                        <td className="px-3 py-3 text-slate-700">{jornada.placa}</td>
                        <td className="px-3 py-3 text-slate-700">{jornada.horaInicio || 'N/A'}</td>
                        <td className="px-3 py-3">
                          {jornada.horaFin ? (
                            <span className="text-slate-700">{jornada.horaFin}</span>
                          ) : (
                            <button
                              type="button"
                              onClick={(event) => event.stopPropagation()}
                              className="font-bold text-blue-600 hover:text-blue-800"
                            >
                              Activa
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-700">{jornada.duracionTotal}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${estadoClass[jornada.estado]}`}>
                            {estadoLabel[jornada.estado]}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          {hasObservaciones ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setObservacionModal(jornada);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-orange-500 transition hover:bg-orange-100"
                              aria-label="Ver observaciones"
                            >
                              !
                            </button>
                          ) : (
                            <span className="text-slate-400">-</span>
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
      </section>

      {observacionModal && (
        // Modal de auditoría: muestra observaciones en modo solo lectura.
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <article className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl">
            <header className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Observaciones de la Jornada</h3>
                <p className="text-xs text-slate-500">
                  Jornada del {formatDate(observacionModal.fecha)} - {observacionModal.chofer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setObservacionModal(null)}
                className="text-lg font-bold text-slate-400 hover:text-slate-700"
              >
                x
              </button>
            </header>

            <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Conductor</p>
                <p className="font-bold text-slate-900">{observacionModal.chofer}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Camion</p>
                <p className="font-bold text-slate-900">{observacionModal.placa}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Horario</p>
                <p className="font-bold text-slate-900">{observacionModal.horario || 'Sin iniciar'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Duracion</p>
                <p className="font-bold text-slate-900">{observacionModal.duracionTotal}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-slate-900">Observaciones del Conductor</p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
                {observacionModal.observaciones || 'Sin observaciones'}
              </div>
            </div>

            <footer className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setObservacionModal(null)}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </footer>
          </article>
        </div>
      )}

      {showForm && (
        // Modal de registro: captura IDs de catálogos y datos mínimos para crear la jornada.
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
          <article className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl">
            <header className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registrar Nueva Jornada</h3>
                <p className="text-xs text-slate-500">
                  Complete los datos para vincular correctamente los recursos operativos y crear la jornada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-lg font-bold text-slate-400 hover:text-slate-700"
              >
                x
              </button>
            </header>

            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">
              Los campos marcados con (*) son obligatorios para continuar con el registro.
            </div>

            <section className="mt-5">
              <h4 className="border-b border-slate-200 pb-2 text-sm font-bold text-slate-900">
                Asignacion de Recursos Operativos
              </h4>
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
                      <option value="" disabled>Cargando conductores...</option>
                    )}
                    {!catalogLoading && conductoresCatalogo.length === 0 && (
                      <option value="" disabled>No hay conductores activos</option>
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
                      <option value="" disabled>Cargando unidades...</option>
                    )}
                    {!catalogLoading && unidadesCatalogo.length === 0 && (
                      <option value="" disabled>No hay unidades disponibles</option>
                    )}
                  </select>
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
                      <option value="" disabled>Cargando contratos...</option>
                    )}
                    {!catalogLoading && contratosCatalogo.length === 0 && (
                      <option value="" disabled>No hay contratos vigentes</option>
                    )}
                  </select>
                </Field>
              </div>
            </section>

            <section className="mt-5">
              <h4 className="border-b border-slate-200 pb-2 text-sm font-bold text-slate-900">
                Detalles de la Jornada
              </h4>
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

              <label className="mt-4 block">
                <span className="text-xs font-semibold text-slate-700">Observaciones</span>
                <textarea
                  value={form.observaciones}
                  onChange={(event) => updateForm('observaciones', event.target.value)}
                  disabled={saving}
                  placeholder="Ingrese cualquier observacion o detalle adicional sobre la jornada..."
                  className="mt-1 min-h-24 w-full resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
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

            <footer className="mt-5 flex justify-between gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowForm(false);
                  setFormError('');
                }}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleCreateJornada}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {saving ? 'Registrando...' : 'Registrar Jornada'}
              </button>
            </footer>
          </article>
        </div>
      )}
    </div>
  );
}

// Wrapper reutilizable para mantener consistentes labels e inputs del modal.
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <div className="mt-1 [&_.form-input]:h-10 [&_.form-input]:w-full [&_.form-input]:rounded-md [&_.form-input]:border [&_.form-input]:border-slate-200 [&_.form-input]:bg-slate-50 [&_.form-input]:px-3 [&_.form-input]:text-sm [&_.form-input]:text-slate-700 [&_.form-input]:outline-none [&_.form-input]:transition [&_.form-input:focus]:border-blue-400 [&_.form-input:focus]:bg-white [&_.form-select]:h-10 [&_.form-select]:w-full [&_.form-select]:rounded-md [&_.form-select]:border [&_.form-select]:border-slate-200 [&_.form-select]:bg-slate-50 [&_.form-select]:px-3 [&_.form-select]:text-sm [&_.form-select]:text-slate-700 [&_.form-select]:outline-none [&_.form-select]:transition [&_.form-select:focus]:border-blue-400 [&_.form-select:focus]:bg-white">
        {children}
      </div>
    </label>
  );
}
