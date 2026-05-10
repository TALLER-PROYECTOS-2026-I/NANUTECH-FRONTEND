import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  getContratos,
  getContratosVigentes,
  getIndicadoresContratos,
  type Contrato,
  type ContratosIndicadores,
} from '@nanutech/api-client';

type Props = {
  onNuevoContrato: () => void;
};

const emptyIndicadores: ContratosIndicadores = {
  total_contratos: 0,
  contratos_activos: 0,
  contratos_vencidos: 0,
  proximos_a_vencer: 0,
  camiones_asignados: 0,
  distribucion_por_estado: [],
  distribucion_por_tipo_servicio: [],
};

const formatMoney = (value: number) => `S/ ${Number(value || 0).toFixed(2)}`;

const getTarifaTotal = (contrato: Contrato) => {
  if (contrato.tarifa !== undefined) return Number(contrato.tarifa);
  if (contrato.total_referencial !== undefined) return Number(contrato.total_referencial);

  return Number(contrato.distancia_estimada_km || 0) * Number(contrato.tarifa_por_km || 0);
};

const tipoServicioLabel = (value?: string) =>
  ({
    POR_VIAJE: 'Por Viaje',
    POR_HORA: 'Por Hora',
    POR_TONELADA: 'Por Tonelada',
    POR_KM: 'Por Kilómetro',
    MENSUAL: 'Mensual',
  })[value || ''] || value || '-';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const [date] = value.split('T');
  return date.split('-').reverse().join('/');
};

const getStatusClass = (estado?: string) => {
  if (estado === 'VENCIDO') return 'bg-red-500 text-white';
  if (estado === 'SUSPENDIDO') return 'bg-orange-500 text-white';
  return 'bg-emerald-500 text-white';
};

function buildIndicadoresFromContratos(contratos: Contrato[]): ContratosIndicadores {
  const estados = new Map<string, number>();
  const tipos = new Map<string, number>();

  contratos.forEach((contrato) => {
    const estado = contrato.estado || 'VIGENTE';
    estados.set(estado, (estados.get(estado) || 0) + 1);
    tipos.set(contrato.tipo_servicio, (tipos.get(contrato.tipo_servicio) || 0) + 1);
  });

  return {
    total_contratos: contratos.length,
    contratos_activos: estados.get('VIGENTE') || 0,
    contratos_vencidos: estados.get('VENCIDO') || 0,
    proximos_a_vencer: contratos.filter((contrato) => contrato.proximo_a_vencer).length,
    camiones_asignados: contratos.reduce(
      (total, contrato) => total + Number(contrato.camiones_asignados || 0),
      0
    ),
    distribucion_por_estado: Array.from(estados, ([estado, cantidad]) => ({ estado, cantidad })),
    distribucion_por_tipo_servicio: Array.from(tipos, ([tipo_servicio, cantidad]) => ({
      tipo_servicio: tipo_servicio as ContratosIndicadores['distribucion_por_tipo_servicio'][number]['tipo_servicio'],
      cantidad,
    })),
  };
}

export default function ContratosPage({ onNuevoContrato }: Props) {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [indicadores, setIndicadores] = useState<ContratosIndicadores>(emptyIndicadores);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'VIGENTE' | 'VENCIDO'>('TODOS');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const [listResult, indicadoresResult] = await Promise.allSettled([
          getContratos({ limit: 100, order_by: 'fecha_fin' }),
          getIndicadoresContratos(),
        ]);

        let nextContratos: Contrato[] = [];
        if (listResult.status === 'fulfilled') {
          nextContratos = listResult.value.data;
        } else {
          nextContratos = await getContratosVigentes();
        }

        if (!active) return;
        setContratos(nextContratos);
        setIndicadores(
          indicadoresResult.status === 'fulfilled'
            ? indicadoresResult.value
            : buildIndicadoresFromContratos(nextContratos)
        );
      } catch {
        if (!active) return;
        setContratos([]);
        setIndicadores(emptyIndicadores);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const filteredContratos = useMemo(() => {
    return contratos.filter((contrato) => {
      const matchesQuery = `${contrato.codigo || ''} ${contrato.cliente}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === 'TODOS' || (contrato.estado || 'VIGENTE') === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [contratos, query, statusFilter]);

  const proximos = contratos.filter((contrato) => contrato.proximo_a_vencer).slice(0, 2);

  return (
    <main className="space-y-6">
      <section className="rounded-xl bg-blue-700 p-5 text-white shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Módulo de Gestión de Contratos v1.0</h2>
            <p className="mt-1 text-sm text-blue-100">
              Sistema inicializado con {indicadores.total_contratos} contratos:{' '}
              {indicadores.contratos_activos} activos, {indicadores.contratos_vencidos} vencidos.
            </p>
          </div>
          <div className="text-sm font-semibold text-emerald-200">Sistema Operativo</div>
        </div>
      </section>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Contratos</h1>
          <p className="mt-1 text-slate-600">Administración y seguimiento de contratos</p>
        </div>
        <button
          type="button"
          onClick={onNuevoContrato}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          + Nuevo Contrato
        </button>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Contratos" value={indicadores.total_contratos} hint="Registrados en el sistema" />
        <MetricCard
          label="Contratos Activos"
          value={indicadores.contratos_activos}
          hint={`${indicadores.contratos_activos} vigentes sin expirar`}
          tone="green"
        />
        <MetricCard
          label="Contratos Vencidos"
          value={indicadores.contratos_vencidos}
          hint={`${indicadores.proximos_a_vencer} por expirar (30 días)`}
          tone="red"
        />
        <MetricCard
          label="Camiones Asignados"
          value={indicadores.camiones_asignados}
          hint="En contratos vigentes"
          tone="purple"
        />
      </section>

      {proximos.length > 0 && (
        <section className="rounded-xl border-l-4 border-orange-500 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-orange-900">Contratos Próximos a Expirar</h2>
          <p className="mt-1 text-slate-600">
            {proximos.length} contratos expiran en los próximos 30 días
          </p>
          <div className="mt-5 grid gap-3">
            {proximos.map((contrato) => (
              <div
                key={contrato.id}
                className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-orange-950">{contrato.codigo || contrato.id}</p>
                    <p className="text-orange-700">{contrato.cliente}</p>
                  </div>
                  <p className="font-semibold text-orange-600">Expira: {formatDate(contrato.fecha_fin)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Distribución por Estado" subtitle="Estado actual de los contratos">
          <div className="flex h-56 items-center justify-center">
            <PieLegend items={indicadores.distribucion_por_estado} />
          </div>
        </ChartCard>
        <ChartCard title="Tipo de Servicio" subtitle="Distribución de contratos por modalidad">
          <BarChart items={indicadores.distribucion_por_tipo_servicio} />
        </ChartCard>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold">Listado de Contratos</h2>
          <p className="mt-1 text-slate-600">Todos los contratos registrados en el sistema</p>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por código o cliente..."
            className="field-base lg:flex-1"
          />
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={statusFilter === 'TODOS'}
              onClick={() => setStatusFilter('TODOS')}
              label={`Todos (${contratos.length})`}
            />
            <FilterButton
              active={statusFilter === 'VIGENTE'}
              onClick={() => setStatusFilter('VIGENTE')}
              label={`Activos (${indicadores.contratos_activos})`}
            />
            <FilterButton
              active={statusFilter === 'VENCIDO'}
              onClick={() => setStatusFilter('VENCIDO')}
              label={`Vencidos (${indicadores.contratos_vencidos})`}
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-600">
            Cargando contratos...
          </div>
        ) : filteredContratos.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <h2 className="text-xl font-bold text-slate-950">No hay contratos registrados</h2>
            <p className="mt-2 text-slate-500">Registra un nuevo contrato comercial para iniciar.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="p-4">Código</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Tipo Servicio</th>
                  <th className="p-4">Tarifa</th>
                  <th className="p-4">Fecha Inicio</th>
                  <th className="p-4">Fecha Fin</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredContratos.map((contrato) => (
                  <tr key={contrato.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-4 font-semibold">{contrato.codigo || contrato.id}</td>
                    <td className="p-4">{contrato.cliente}</td>
                    <td className="p-4 text-slate-600">{tipoServicioLabel(contrato.tipo_servicio)}</td>
                    <td className="p-4 font-semibold">{formatMoney(getTarifaTotal(contrato))}</td>
                    <td className="p-4 text-slate-600">{formatDate(contrato.fecha_inicio)}</td>
                    <td className="p-4 text-slate-600">{formatDate(contrato.fecha_fin)}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                          contrato.estado
                        )}`}
                      >
                        {contrato.estado || 'VIGENTE'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button type="button" className="rounded-lg border border-slate-200 px-4 py-2 font-semibold">
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone = 'blue',
}: {
  label: string;
  value: number;
  hint: string;
  tone?: 'blue' | 'green' | 'red' | 'purple';
}) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-4xl font-bold">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{hint}</p>
        </div>
        <div className={`grid h-14 w-14 place-items-center rounded-lg text-2xl font-bold ${colors[tone]}`}>
          {tone === 'green' ? '✓' : tone === 'red' ? '×' : '#'}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="font-bold">{title}</h2>
      <p className="mt-1 text-slate-600">{subtitle}</p>
      {children}
    </div>
  );
}

function PieLegend({ items }: { items: Array<{ estado: string; cantidad: number }> }) {
  const total = items.reduce((sum, item) => sum + item.cantidad, 0) || 1;

  return (
    <div className="grid gap-3">
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Sin datos disponibles</p>
      ) : (
        items.map((item) => (
          <div key={item.estado} className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-blue-600" />
            <span className="text-sm font-semibold">
              {item.estado}: {Math.round((item.cantidad / total) * 100)}%
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function BarChart({ items }: { items: Array<{ tipo_servicio: string; cantidad: number }> }) {
  const max = Math.max(...items.map((item) => item.cantidad), 1);

  return (
    <div className="mt-8 flex h-56 items-end gap-6 border-b border-l border-slate-200 px-6">
      {items.length === 0 ? (
        <p className="self-center text-sm text-slate-500">Sin datos disponibles</p>
      ) : (
        items.map((item) => (
          <div key={item.tipo_servicio} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full max-w-44 rounded-t-lg bg-blue-500"
              style={{ height: `${Math.max(18, (item.cantidad / max) * 180)}px` }}
            />
            <p className="text-center text-xs text-slate-500">{tipoServicioLabel(item.tipo_servicio)}</p>
          </div>
        ))
      )}
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold ${
        active ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-950'
      }`}
    >
      {label}
    </button>
  );
}
