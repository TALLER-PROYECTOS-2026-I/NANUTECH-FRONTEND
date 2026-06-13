import { useEffect, useMemo, useState } from 'react';
import {
  getGpsPlantilla,
  getGpsProveedores,
  getGpsRegistros,
  getGpsResumen,
  importarGpsCsv,
  validarGpsCsv,
  type GpsProveedorApi,
  type GpsRegistroApi,
  type GpsResumenApi,
  type GpsValidationApi,
} from '@nanutech/api-client';
import { MonitoreoSidebar } from '../../monitoreo-camiones/components/MonitoreoSidebar';
import { formatFechaLarga, formatHora } from '../../gestión-conductores/utils/format';

type Tab = 'importar' | 'datos';

const providerFallback: GpsProveedorApi[] = [
  {
    proveedor: 'GPSCONTROL',
    nombre: 'GPSControl.pe',
    encabezados: ['fecha', 'hora', 'placa', 'latitud', 'longitud', 'velocidad', 'rumbo', 'distancia_total'],
  },
  {
    proveedor: 'GLOBALGPS',
    nombre: 'GlobalGPSPeru.com',
    encabezados: ['event_date', 'event_time', 'vehicle_plate', 'latitude', 'longitude', 'speed', 'heading', 'mileage'],
  },
];

const estadoLabel: Record<string, string> = {
  MOVIENDO: 'En Movimiento',
  DETENIDO: 'Detenido',
  EXCESO_VELOCIDAD: 'Exceso Velocidad',
};

const estadoClass: Record<string, string> = {
  MOVIENDO: 'bg-emerald-100 text-emerald-700',
  DETENIDO: 'bg-slate-100 text-slate-700',
  EXCESO_VELOCIDAD: 'bg-red-100 text-red-700',
};

function normalizeProviderName(provider: string, providers: GpsProveedorApi[]) {
  return providers.find((item) => item.proveedor === provider)?.nombre ?? provider;
}

function downloadText(content: string, filename: string, type = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function formatFecha(value: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('es-PE')}, ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
}

function HeaderIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function KpiIcon({ icon }: { icon: 'pin' | 'trend' | 'alert' | 'pulse' }) {
  if (icon === 'pin') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
        <circle cx="12" cy="11" r="2" />
      </svg>
    );
  }

  if (icon === 'trend') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M4 17l5-5 4 4 7-8" />
        <path d="M15 8h5v5" />
      </svg>
    );
  }

  if (icon === 'alert') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3 2.5 20h19L12 3z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </svg>
  );
}

function RecordIcon({
  icon,
  className,
}: {
  icon: 'pin' | 'trend' | 'navigation' | 'speed' | 'location' | 'pulse';
  className: string;
}) {
  const baseClass = `h-4 w-4 shrink-0 ${className}`;

  if (icon === 'trend') {
    return (
      <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M4 17l5-5 4 4 7-8" />
        <path d="M15 8h5v5" />
      </svg>
    );
  }

  if (icon === 'navigation') {
    return (
      <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2 5 22l7-4 7 4-7-20z" />
      </svg>
    );
  }

  if (icon === 'speed') {
    return (
      <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 14a8 8 0 0 1 16 0" />
        <path d="m12 14 4-5" />
        <path d="M12 14h.01" />
      </svg>
    );
  }

  if (icon === 'pulse') {
    return (
      <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h4l2-6 4 12 2-6h6" />
      </svg>
    );
  }

  if (icon === 'location') {
    return (
      <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
        <circle cx="12" cy="11" r="2" />
      </svg>
    );
  }

  return (
    <svg className={baseClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function KpiCard({
  title,
  value,
  helper,
  tone,
  icon,
}: {
  title: string;
  value: string | number;
  helper: string;
  tone: 'blue' | 'green' | 'orange' | 'purple';
  icon: 'pin' | 'trend' | 'alert' | 'pulse';
}) {
  const toneClass = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    orange: 'text-orange-500',
    purple: 'text-purple-500',
  }[tone];

  return (
    <article className="flex min-h-[112px] items-center justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold text-gray-600">{title}</p>
        <p className="mt-5 text-2xl font-extrabold leading-none text-gray-950">{value}</p>
        <p className="mt-3 text-xs text-gray-500">{helper}</p>
      </div>
      <span className={`flex h-8 w-8 items-start justify-center ${toneClass}`} aria-hidden="true">
        <KpiIcon icon={icon} />
      </span>
    </article>
  );
}

function GpsIntegrationPage() {
  const [fechaActual, setFechaActual] = useState('');
  const [horaActual, setHoraActual] = useState('');
  const [tab, setTab] = useState<Tab>('importar');
  const [providers, setProviders] = useState<GpsProveedorApi[]>(providerFallback);
  const [provider, setProvider] = useState('GPSCONTROL');
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<GpsValidationApi | null>(null);
  const [summary, setSummary] = useState<GpsResumenApi | null>(null);
  const [registros, setRegistros] = useState<GpsRegistroApi[]>([]);
  const [filterProveedor, setFilterProveedor] = useState('');
  const [filterPlaca, setFilterPlaca] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedProvider = providers.find((item) => item.proveedor === provider) ?? providers[0];

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setFechaActual(formatFechaLarga(now));
      setHoraActual(formatHora(now));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [providerData, summaryData, registrosData] = await Promise.all([
        getGpsProveedores(),
        getGpsResumen(),
        getGpsRegistros(),
      ]);

      setProviders(providerData.length ? providerData : providerFallback);
      setSummary(summaryData);
      setRegistros(registrosData);
    } catch (requestError) {
      console.error('Error al cargar HU08 GPS:', requestError);
      setError('No se pudo cargar la informacion GPS desde el backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(
    () =>
      registros.filter((registro) => {
        const matchProvider = !filterProveedor || registro.proveedor === filterProveedor;
        const matchPlaca = !filterPlaca || registro.placa.toLowerCase().includes(filterPlaca.toLowerCase());
        return matchProvider && matchPlaca;
      }),
    [filterPlaca, filterProveedor, registros],
  );

  const total = summary?.total_registros_activos ?? registros.length;
  const moving = summary?.unidades_en_movimiento ?? registros.filter((item) => item.estado === 'MOVIENDO').length;
  const stopped = summary?.unidades_detenidas ?? registros.filter((item) => item.estado === 'DETENIDO').length;
  const speedAvg = summary?.velocidad_promedio ?? 0;

  useEffect(() => {
    if (tab !== 'datos') return;

    const timeout = window.setTimeout(async () => {
      setBusy(true);
      setError(null);

      try {
        const data = await getGpsRegistros({
          proveedor: filterProveedor,
          placa: filterPlaca,
        });
        setRegistros(data);
      } catch (requestError) {
        console.error('Error al filtrar registros GPS:', requestError);
        setError('No se pudieron filtrar los registros GPS.');
      } finally {
        setBusy(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [filterPlaca, filterProveedor, tab]);

  const handleDownloadTemplate = async () => {
    setError(null);

    try {
      const template = await getGpsPlantilla(provider);
      downloadText(template.csv, template.filename, template.content_type);
    } catch (requestError) {
      console.error('Error al descargar plantilla GPS:', requestError);
      setError('No se pudo descargar la plantilla desde el backend.');
    }
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setValidation(null);
    setMessage(null);
    setError(null);

    if (!selected) return;

    setBusy(true);

    try {
      const csv = await selected.text();
      const result = await validarGpsCsv({
        proveedor: provider,
        nombreArchivo: selected.name,
        csv,
      });
      setValidation(result);
      setMessage(result.importacion_habilitada ? 'Archivo GPS validado correctamente.' : 'El archivo contiene errores de validacion.');
    } catch (requestError) {
      console.error('Error al validar CSV GPS:', requestError);
      setError('No se pudo validar el archivo GPS.');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    if (!file || !validation?.importacion_habilitada) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const csv = await file.text();
      const result = await importarGpsCsv({
        proveedor: provider,
        nombreArchivo: file.name,
        csv,
      });
      setMessage(`Importacion procesada. Registros validos: ${result.registros_validos ?? 0}.`);
      setTab('datos');
      await loadData();
    } catch (requestError) {
      console.error('Error al importar GPS:', requestError);
      setError('No se pudo importar el archivo GPS.');
    } finally {
      setBusy(false);
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
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <section className="mb-5 rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-violet-700 px-5 py-4 text-white shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15">
                  <HeaderIcon />
                </div>
                <div>
                  <p className="text-base font-extrabold">Modulo de Integracion GPS v2.0</p>
                  <p className="text-xs text-white/85">Carga masiva de datos GPS con validacion automatica y deteccion de duplicados</p>
                </div>
              </div>
              <div className="text-right text-xs text-white/90">
                <p className="font-bold">Sistema Operativo</p>
                <p>Proveedores GPSControl.pe | GlobalGPSPeru.com</p>
              </div>
            </div>
          </section>

          <section className="mb-5">
            <h2 className="text-2xl font-bold text-gray-950">Integracion GPS</h2>
            <p className="text-sm text-gray-500">Importacion y analisis de datos de rastreo GPS desde proveedores certificados</p>
          </section>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {message}
            </div>
          )}

          <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Total Registros" value={loading ? '...' : total} helper="Registros GPS activos" tone="blue" icon="pin" />
            <KpiCard
              title="En Movimiento"
              value={loading ? '...' : moving}
              helper={total ? `${Math.round((moving / total) * 100)}% del total` : '0% del total'}
              tone="green"
              icon="trend"
            />
            <KpiCard
              title="Detenidos"
              value={loading ? '...' : stopped}
              helper={total ? `${Math.round((stopped / total) * 100)}% del total` : '0% del total'}
              tone="orange"
              icon="alert"
            />
            <KpiCard title="Velocidad Promedio" value={loading ? '...' : `${Number(speedAvg).toFixed(1)} km/h`} helper="Eventos de exceso" tone="purple" icon="pulse" />
          </section>

          <div className="my-4 grid grid-cols-2 rounded-lg bg-gray-200 p-1">
            <button
              type="button"
              onClick={() => setTab('importar')}
              className={`rounded-md px-4 py-2 text-xs font-bold transition ${tab === 'importar' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Importar Datos GPS
            </button>
            <button
              type="button"
              onClick={() => setTab('datos')}
              className={`rounded-md px-4 py-2 text-xs font-bold transition ${tab === 'datos' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Ver Datos GPS
            </button>
          </div>

          {tab === 'importar' ? (
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="text-sm font-bold text-gray-950">Carga Masiva de Datos GPS</h3>
                <p className="text-xs text-gray-500">Importa datos GPS desde archivos CSV de proveedores certificados</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-900" htmlFor="proveedor-gps">
                    1. Seleccionar Proveedor GPS
                  </label>
                  <select
                    id="proveedor-gps"
                    value={provider}
                    onChange={(event) => {
                      setProvider(event.target.value);
                      setValidation(null);
                      setFile(null);
                    }}
                    className="mt-2 h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-xs outline-none focus:border-blue-400"
                  >
                    {providers.map((item) => (
                      <option key={item.proveedor} value={item.proveedor}>
                        {item.nombre} ({item.proveedor})
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px] text-gray-500">El sistema adaptara automaticamente el formato de las columnas segun el proveedor.</p>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold text-blue-800">¿No conoces el formato requerido?</p>
                      <p className="mt-1 text-xs text-blue-700">
                        Descarga nuestra plantilla CSV de ejemplo con los encabezados correctos y datos de muestra para el proveedor seleccionado.
                      </p>
                      <p className="mt-3 text-[11px] font-bold text-blue-800">La plantilla incluye:</p>
                      <ul className="mt-1 space-y-0.5 text-[11px] text-blue-700">
                        <li>Encabezados obligatorios segun proveedor</li>
                        <li>5 registros de ejemplo con formato correcto</li>
                        <li>Valores reales de referencia</li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                    >
                      Descargar Plantilla
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-900" htmlFor="gps-file">
                    2. Seleccionar Archivo CSV
                  </label>
                  <div className="mt-2 flex gap-3">
                    <input
                      id="gps-file"
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFile}
                      className="h-9 flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      disabled={busy || !validation?.importacion_habilitada}
                      onClick={handleImport}
                      className="rounded-md bg-emerald-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
                    >
                      {busy ? 'Procesando...' : 'Importar Datos'}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">El boton Importar Datos se habilitara solo cuando el archivo sea valido.</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-bold text-gray-900">Columnas Requeridas para {selectedProvider?.nombre}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedProvider?.encabezados.map((header) => (
                      <div key={header} className="flex items-center gap-2 text-xs text-gray-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {header}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-2 text-xs font-bold text-amber-800">Reglas de Validacion</p>
                  <ul className="space-y-1 text-[11px] text-amber-800">
                    <li>Fecha: formato YYYY-MM-DD</li>
                    <li>Hora: formato HH:MM:SS</li>
                    <li>Latitud: entre -90 y 90 grados</li>
                    <li>Longitud: entre -180 y 180 grados</li>
                    <li>Velocidad: numero positivo en km/h</li>
                    <li>Duplicados: se detectan automaticamente por proveedor, unidad y fecha/hora</li>
                  </ul>
                </div>

                {validation && validation.errores.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-bold text-red-800">Errores encontrados</p>
                    <ul className="mt-2 space-y-1 text-xs text-red-700">
                      {validation.errores.slice(0, 5).map((item, index) => (
                        <li key={`${item.row}-${item.field}-${index}`}>{item.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <RecordIcon icon="pin" className="text-purple-500" />
                  <h3 className="text-sm font-bold text-gray-950">Datos GPS Importados</h3>
                </div>
                <p className="text-xs text-gray-500">Visualizacion de todos los registros GPS en el sistema</p>
              </div>

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold text-gray-700">Filtrar por Proveedor</span>
                  <select
                    value={filterProveedor}
                    onChange={(event) => setFilterProveedor(event.target.value)}
                    className="mt-2 h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-xs"
                  >
                    <option value="">Todos los Proveedores</option>
                    {providers.map((item) => (
                      <option key={item.proveedor} value={item.proveedor}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-gray-700">Filtrar por Camion</span>
                  <input
                    value={filterPlaca}
                    onChange={(event) => setFilterPlaca(event.target.value)}
                    placeholder="Todos los Camiones"
                    className="mt-2 h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-xs"
                  />
                </label>
              </div>

              <div className="max-h-[520px] overflow-y-auto rounded-lg border border-gray-200">
                {filteredData.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-500">No hay registros GPS para mostrar.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredData.map((registro) => (
                      <article key={registro.id} className="grid gap-3 px-4 py-3 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-extrabold text-gray-950">{registro.placa}</p>
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${estadoClass[registro.estado] ?? 'bg-gray-100 text-gray-700'}`}>
                              {estadoLabel[registro.estado] ?? registro.estado}
                            </span>
                            <span className="rounded border border-purple-300 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                              {normalizeProviderName(registro.proveedor, providers)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{formatFecha(registro.fecha_hora)}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <RecordIcon
                              icon={registro.estado === 'EXCESO_VELOCIDAD' ? 'pulse' : 'trend'}
                              className={registro.estado === 'EXCESO_VELOCIDAD' ? 'text-red-500' : 'text-emerald-500'}
                            />
                            <div>
                              <p className="text-[10px] font-bold text-gray-400">Estado</p>
                              <p className="text-xs font-semibold text-gray-800">{estadoLabel[registro.estado] ?? registro.estado}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <RecordIcon icon="navigation" className="text-blue-500" />
                            <div>
                              <p className="text-[10px] font-bold text-gray-400">Kilometros</p>
                              <p className="text-xs font-semibold text-gray-800">{Number(registro.distancia_total).toLocaleString('es-PE')} km</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <RecordIcon icon="location" className="text-purple-500" />
                            <div>
                              <p className="text-[10px] font-bold text-gray-400">Latitud</p>
                              <p className="text-xs font-semibold text-gray-800">{registro.latitud}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <RecordIcon icon="location" className="text-purple-500" />
                            <div>
                              <p className="text-[10px] font-bold text-gray-400">Longitud</p>
                              <p className="text-xs font-semibold text-gray-800">{registro.longitud}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-extrabold text-gray-950">{Number(registro.velocidad_kmh).toFixed(0)}</p>
                          <p className="text-xs text-gray-500">km/h</p>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          <p className="mt-4 text-center text-xs text-gray-400">
            2026 NANU TECH - Sistema de Gestion de Flota de Camiones
          </p>
        </main>
      </div>
    </div>
  );
}

export default GpsIntegrationPage;
