import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SegmentoGrafica } from '../types';

type ConductoresChartsProps = {
  contratoData: SegmentoGrafica[];
  operacionalData: SegmentoGrafica[];
  onContratoClick: (key: string) => void;
  onOperacionalClick: (key: string) => void;
};

const getSegmentKey = (entry: unknown) =>
  typeof entry === 'object' && entry !== null && 'key' in entry
    ? String((entry as { key: unknown }).key)
    : '';

const getActivePayloadKey = (state: unknown) => {
  const activePayload = (state as { activePayload?: Array<{ payload?: { key?: unknown } }> })
    ?.activePayload;
  return activePayload?.[0]?.payload?.key ? String(activePayload[0].payload.key) : '';
};

export function ConductoresCharts({
  contratoData,
  operacionalData,
  onContratoClick,
  onOperacionalClick,
}: ConductoresChartsProps) {
  const totalContrato = contratoData.reduce((sum, item) => sum + item.value, 0) || 1;
  const renderPieLabel = (props: unknown) => {
    const { name, value } = props as { name?: string; value?: number };
    return `${name ?? ''}: ${Math.round((Number(value ?? 0) / totalContrato) * 100)}%`;
  };

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">Estado de Conductores</h3>
        <p className="text-xs text-gray-500">Distribucion por estado de contrato</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={contratoData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={86}
                onClick={(entry) => onContratoClick(getSegmentKey(entry))}
                label={renderPieLabel}
              >
                {contratoData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} className="cursor-pointer outline-none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">Estado Operacional</h3>
        <p className="text-xs text-gray-500">Distribucion por estado operativo actual</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={operacionalData}
              margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              onClick={(state) => {
                const key = getActivePayloadKey(state);
                if (key) onOperacionalClick(key);
              }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={80}>
                {operacionalData.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} className="cursor-pointer" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
