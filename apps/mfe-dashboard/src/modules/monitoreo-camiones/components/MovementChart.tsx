import type { PanelCamionesHu11 } from "@nanutech/api-client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MovementChartProps = {
  chartData: Array<{
    placa: string;
    movimiento: number;
    detenido: number;
  }>;
  filteredPanel: PanelCamionesHu11;
};

// Gráfico de movimiento frente a tiempo detenido por camión.
export function MovementChart({ chartData, filteredPanel }: MovementChartProps) {
  return (
    <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-bold text-gray-900">Comparativa de Horas: Movimiento vs Detenido</h2>
      <p className="mb-4 text-xs text-gray-500">Análisis de tiempo de operación por camión</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="placa" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="movimiento" fill="#10b981" radius={[4, 4, 0, 0]} name="Movimiento" />
            <Bar dataKey="detenido" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Detenido" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-right text-xs text-gray-500">
        Movimiento {filteredPanel.grafica_movimiento.porcentaje_movimiento}% · Detenido{" "}
        {filteredPanel.grafica_movimiento.porcentaje_detenido}%
      </p>
    </section>
  );
}

