import type { PanelCamionesHu11 } from "@nanutech/api-client";
import type { ReactNode } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PieLabelRenderProps } from "recharts";

type MovementChartProps = {
  filteredPanel: PanelCamionesHu11;
};

const chartColors = {
  movimiento: "#2563eb",
  detenido: "#f59e0b",
};

type MovementChartItem = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

const renderPieLabel = ({ name, payload }: PieLabelRenderProps): ReactNode => {
  const item = payload as MovementChartItem | undefined;
  return `${name}: ${item?.percentage ?? 0}%`;
};

// Grafico circular de movimiento frente a tiempo detenido para la flota filtrada.
export function MovementChart({ filteredPanel }: MovementChartProps) {
  const totalHours =
    filteredPanel.grafica_movimiento.horas_movimiento + filteredPanel.grafica_movimiento.horas_detenido;

  const chartData: MovementChartItem[] = [
    {
      name: "Movimiento",
      value: filteredPanel.grafica_movimiento.horas_movimiento,
      percentage: filteredPanel.grafica_movimiento.porcentaje_movimiento,
      color: chartColors.movimiento,
    },
    {
      name: "Detenido",
      value: filteredPanel.grafica_movimiento.horas_detenido,
      percentage: filteredPanel.grafica_movimiento.porcentaje_detenido,
      color: chartColors.detenido,
    },
  ];

  return (
    <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-bold text-gray-900">Comparativas de Horas: Movimiento vs Detenido</h2>
      <p className="mb-4 text-xs text-gray-500">Porcentaje de tiempo operativo frente a tiempo detenido</p>
      <div className="relative h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={3}
              label={renderPieLabel}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${Number(value ?? 0)} h`, String(name)]} />
            <Legend verticalAlign="bottom" iconType="square" />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] text-center">
          <p className="text-xs font-semibold uppercase text-gray-400">Total</p>
          <p className="text-lg font-bold text-gray-900">{totalHours.toFixed(1)} h</p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap justify-end gap-3 text-xs text-gray-500">
        {chartData.map((item) => (
          <span key={item.name} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            {item.name} {item.percentage}% ({item.value.toFixed(1)} h)
          </span>
        ))}
      </div>
    </section>
  );
}
