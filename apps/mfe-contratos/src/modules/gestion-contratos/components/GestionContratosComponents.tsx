import type { ReactNode } from 'react';
import type { ContratosIndicadores } from '@nanutech/api-client';
import type { ContratoConUnidades, EstadoFiltro, SortDirection } from '../types';
import { estadoBadgeClass, estadoLabel, formatDate, formatMoney, tipoServicioLabel } from '../utils/formatters';

// Iconos SVG internos para evitar dependencias extra en el MFE.
export function Icon({ name }: { name: string }) {
  const common = 'h-4 w-4';

  if (name === 'truck') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    );
  }

  if (name === 'check') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  if (name === 'x') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6M9 9l6 6" />
      </svg>
    );
  }

  if (name === 'alert') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }

  if (name === 'search') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    );
  }

  if (name === 'eye') {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

// Tarjeta superior azul con estado general del modulo.
export function ModuleBanner({ indicadores }: { indicadores: ContratosIndicadores }) {
  return (
    <section className="rounded-lg bg-blue-600 p-5 text-white shadow-lg shadow-blue-950/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/15">
            <Icon name="file" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Modulo de Gestion de Contratos v1.0</h2>
            <p className="mt-1 text-xs text-blue-100">
              Sistema inicializado con {indicadores.total_contratos} contratos:{' '}
              {indicadores.contratos_activos} activos, {indicadores.contratos_vencidos} vencidos.
            </p>
          </div>
        </div>
        <div className="text-right text-xs">
          <p className="inline-flex items-center justify-end gap-2 font-bold text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Sistema Operativo
          </p>
          <p className="text-blue-100">Datos coherentes con flota y contratos</p>
        </div>
      </div>
    </section>
  );
}

// Encabezado de la HU con acceso a registrar nuevo contrato.
export function PageHeader({ currentTime, onNuevoContrato }: { currentTime: string; onNuevoContrato: () => void }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion de Contratos</h1>
        <p className="mt-1 text-sm text-gray-500">Administracion y seguimiento de contratos</p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <p className="text-xs text-gray-400">Actualizacion</p>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <p className="text-sm font-bold text-gray-800">{currentTime}</p>
          <p className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            En vivo
          </p>
        </div>
        <button
          type="button"
          onClick={onNuevoContrato}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
        >
          + Nuevo Contrato
        </button>
      </div>
    </header>
  );
}

// Card de indicador usado por Total, Activos, Vencidos y Camiones.
export function KpiCard({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  tone: 'blue' | 'green' | 'red' | 'purple';
  icon: string;
}) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-500',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <article className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`mt-2 text-3xl font-bold ${tone === 'red' ? 'text-red-500' : tone === 'green' ? 'text-green-600' : tone === 'purple' ? 'text-purple-600' : 'text-gray-900'}`}>
          {value}
        </p>
        <p className="mt-2 text-xs text-gray-500">{hint}</p>
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${toneClass[tone]}`}>
        <Icon name={icon} />
      </div>
    </article>
  );
}

// Contenedor comun para graficas.
export function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      {children}
    </section>
  );
}

// Grafica circular con tooltip al hover para ver cantidad por estado.
export function EstadoPieChart({ items }: { items: Array<{ estado: string; cantidad: number }> }) {
  const total = items.reduce((sum, item) => sum + item.cantidad, 0) || 1;
  const colors: Record<string, string> = {
    VIGENTE: 'bg-green-500',
    ACTIVO: 'bg-green-500',
    VENCIDO: 'bg-red-500',
    SUSPENDIDO: 'bg-orange-500',
    INACTIVO: 'bg-slate-500',
  };
  const colorHex: Record<string, string> = {
    VIGENTE: '#10b981',
    ACTIVO: '#10b981',
    VENCIDO: '#ef4444',
    SUSPENDIDO: '#f59e0b',
    INACTIVO: '#64748b',
  };

  // Construye el pastel desde los datos reales. Si todo esta activo, queda 100% verde.
  const pieGradient = items.length
    ? `conic-gradient(${items
        .reduce(
          (segments, item) => {
            const start = segments.cursor;
            const end = start + (item.cantidad / total) * 100;
            return {
              cursor: end,
              values: [
                ...segments.values,
                `${colorHex[item.estado] || '#3b82f6'} ${start}% ${end}%`,
              ],
            };
          },
          { cursor: 0, values: [] as string[] }
        )
        .values.join(', ')})`
    : 'conic-gradient(#e5e7eb 0 100%)';

  return (
    <div className="mt-6 flex min-h-56 items-center justify-center">
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Sin datos disponibles</p>
      ) : (
        <div className="relative h-56 w-full max-w-md">
          <div
            className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-inner"
            style={{ background: pieGradient }}
            aria-label="Grafica de distribucion por estado"
          />
          {items.map((item, index) => {
            const labelClass =
              index === 0
                ? 'left-[22%] top-2 text-green-600'
                : index === 1
                  ? 'left-[52%] bottom-4 text-red-500'
                  : 'right-0 top-1/2 text-orange-500';

            return (
              <div key={item.estado} className={`group absolute text-sm font-medium ${labelClass}`}>
                {estadoLabel(item.estado)}s: {Math.round((item.cantidad / total) * 100)}%
                <span className="pointer-events-none absolute left-0 top-6 z-10 hidden rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white group-hover:block">
                  {item.cantidad} contratos
                </span>
              </div>
            );
          })}
        </div>
      )}
      <div className="sr-only">
        {items.length === 0 ? (
          'Sin datos disponibles'
        ) : (
          items.map((item) => (
            <div key={item.estado}>
              <span className={colors[item.estado] || 'bg-blue-500'} />
              {estadoLabel(item.estado)}: {Math.round((item.cantidad / total) * 100)}%
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Grafica de barras con tooltip al hover para comparar tipos de servicio.
export function TipoServicioBarChart({ items }: { items: Array<{ tipo_servicio: string; cantidad: number }> }) {
  const max = Math.max(...items.map((item) => item.cantidad), 1);
  const axisMax = Math.max(8, Math.ceil(max / 2) * 2);
  const ticks = Array.from({ length: axisMax / 2 + 1 }, (_, index) => axisMax - index * 2);

  return (
    <div className="mt-6 h-64">
      {items.length === 0 ? (
        <div className="grid h-full place-items-center text-sm text-gray-500">Sin datos disponibles</div>
      ) : (
        <div className="grid h-full grid-cols-[34px_1fr] grid-rows-[1fr_28px]">
          <div className="relative row-start-1 border-r border-dashed border-gray-200">
            {ticks.map((tick) => (
              <span
                key={tick}
                className="absolute right-2 -translate-y-1/2 text-xs font-medium text-gray-400"
                style={{ top: `${((axisMax - tick) / axisMax) * 100}%` }}
              >
                {tick}
              </span>
            ))}
          </div>
          <div className="relative row-start-1 overflow-hidden border-b border-l border-dashed border-gray-200">
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute left-0 w-full border-t border-dashed border-gray-200"
                style={{ top: `${((axisMax - tick) / axisMax) * 100}%` }}
              />
            ))}
            <div className="relative z-10 flex h-full items-end gap-8 px-8">
              {items.map((item) => (
                <div key={item.tipo_servicio} className="group relative flex h-full flex-1 items-end justify-center">
                  <div
                    className="w-full max-w-44 rounded-t-md bg-blue-500 transition-colors group-hover:bg-blue-600"
                    style={{ height: `${Math.max(18, (item.cantidad / axisMax) * 100)}%` }}
                  />
                  <span className="pointer-events-none absolute bottom-full z-10 mb-2 hidden rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white group-hover:block">
                    {item.cantidad} contratos
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="col-start-2 row-start-2 grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
            {items.map((item) => (
              <p key={item.tipo_servicio} className="px-2 pt-2 text-center text-[11px] text-gray-500">
                {tipoServicioLabel(item.tipo_servicio)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Alerta de contratos por vencer con acceso directo al detalle.
export function ExpirationAlert({
  contratos,
  onView,
}: {
  contratos: ContratoConUnidades[];
  onView: (contrato: ContratoConUnidades) => void;
}) {
  if (contratos.length === 0) return null;

  return (
    <section className="rounded-lg border border-orange-200 border-l-4 border-l-orange-500 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-orange-500">
          <Icon name="alert" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-orange-700">Contratos Proximos a Expirar</h2>
          <p className="text-xs text-gray-500">{contratos.length} contratos expiran en los proximos 30 dias</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {contratos.map((contrato) => (
          <button
            key={contrato.id}
            type="button"
            onClick={() => onView(contrato)}
            className="flex items-center justify-between rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-left text-xs hover:bg-orange-100"
          >
            <span>
              <span className="block font-bold text-orange-900">{contrato.codigo || contrato.id}</span>
              <span className="text-orange-700">{contrato.cliente}</span>
            </span>
            <span className="font-bold text-orange-600">Expira: {formatDate(contrato.fecha_fin)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// Panel expandido que resume configuracion tecnica y economica del contrato seleccionado.
export function ContractDetailPanel({ contrato, onClose }: { contrato: ContratoConUnidades; onClose: () => void }) {
  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-blue-700">Vista expandida del contrato</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">{contrato.codigo || contrato.id}</h2>
          <p className="text-sm text-gray-600">{contrato.cliente}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-md border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700">
          Cerrar detalle
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Ruta" value={`${contrato.origen} -> ${contrato.destino}`} />
        <DetailItem label="Tipo servicio" value={tipoServicioLabel(contrato.tipo_servicio)} />
        <DetailItem label="Vigencia" value={`${formatDate(contrato.fecha_inicio)} - ${formatDate(contrato.fecha_fin)}`} />
        <DetailItem label="Tarifa" value={formatMoney(contrato)} />
        <DetailItem label="Distancia estimada" value={`${contrato.distancia_estimada_km} km`} />
        <DetailItem label="Tarifa por KM" value={`S/ ${Number(contrato.tarifa_por_km || 0).toFixed(2)}`} />
        <DetailItem label="Tarifa por hora" value={`S/ ${Number(contrato.tarifa_por_hora || 0).toFixed(2)}`} />
        <DetailItem label="Tarifa espera" value={`S/ ${Number(contrato.tarifa_espera || 0).toFixed(2)}`} />
      </div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-blue-100 bg-white p-3">
      <p className="text-[11px] font-bold uppercase text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Boton de filtro de estado.
function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-xs font-bold ${
        active ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

// Tabla principal con busqueda, filtros, ordenamiento y paginacion.
export function ContractsTable({
  contratos,
  allCount,
  query,
  statusFilter,
  sortDirection,
  currentPage,
  totalPages,
  onQueryChange,
  onStatusChange,
  onSortChange,
  onPageChange,
  onView,
}: {
  contratos: ContratoConUnidades[];
  allCount: number;
  query: string;
  statusFilter: EstadoFiltro;
  sortDirection: SortDirection;
  currentPage: number;
  totalPages: number;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: EstadoFiltro) => void;
  onSortChange: () => void;
  onPageChange: (value: number) => void;
  onView: (contrato: ContratoConUnidades) => void;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-sm font-bold text-gray-900">Listado de Contratos</h2>
        <p className="mt-1 text-xs text-gray-500">Todos los contratos registrados en el sistema</p>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:flex-1">
          <span className="absolute left-3 top-2.5 text-gray-400">
            <Icon name="search" />
          </span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por codigo o cliente..."
            className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterButton active={statusFilter === 'TODOS'} onClick={() => onStatusChange('TODOS')} label={`Todos (${allCount})`} />
          <FilterButton active={statusFilter === 'VIGENTE'} onClick={() => onStatusChange('VIGENTE')} label="Activos" />
          <FilterButton active={statusFilter === 'VENCIDO'} onClick={() => onStatusChange('VENCIDO')} label="Vencidos" />
        </div>
      </div>

      {contratos.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <h2 className="text-lg font-bold text-gray-900">No hay contratos registrados</h2>
          <p className="mt-2 text-sm text-gray-500">Registra un nuevo contrato comercial para iniciar.</p>
        </div>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-4 py-3">Codigo</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo Servicio</th>
                  <th className="px-4 py-3">Tarifa</th>
                  <th className="px-4 py-3">Fecha Inicio</th>
                  <th className="px-4 py-3">
                    <button
                      type="button"
                      onClick={onSortChange}
                      className="inline-flex items-center gap-1 font-semibold text-gray-600 hover:text-blue-600"
                    >
                      Fecha Fin {sortDirection === 'asc' ? 'Asc' : 'Desc'}
                    </button>
                  </th>
                  <th className="px-4 py-3">Camiones</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((contrato) => (
                  <tr key={contrato.id} onClick={() => onView(contrato)} className="cursor-pointer border-b border-gray-100 hover:bg-blue-50/40">
                    <td className="px-4 py-3 font-bold text-gray-900">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-blue-500">
                          <Icon name="file" />
                        </span>
                        {contrato.codigo || contrato.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{contrato.cliente}</td>
                    <td className="px-4 py-3 text-gray-600">{tipoServicioLabel(contrato.tipo_servicio)}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{formatMoney(contrato)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(contrato.fecha_inicio)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(contrato.fecha_fin)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-700">{contrato.camiones_asignados || contrato.unidad_ids?.length || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${estadoBadgeClass(contrato.estado, contrato.activo)}`}>
                        {estadoLabel(contrato.estado, contrato.activo)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onView(contrato);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <Icon name="eye" /> Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Mostrando {contratos.length} de {allCount} contratos. Pagina {currentPage} de {totalPages}.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className="rounded-md border border-gray-300 px-3 py-2 font-semibold text-gray-700 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className="rounded-md border border-gray-300 px-3 py-2 font-semibold text-gray-700 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
