import { DatosGrafica } from '../types';

interface GraficaContratosProps {
  datosEstado: DatosGrafica[];
  datosTipoServicio: DatosGrafica[];
}

const COLORES_ESTADO = ['#10b981', '#ef4444', '#f59e0b'];
const COLORES_TIPO = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

// Componente de Pie Chart en SVG puro
const PieChart: React.FC<{ datos: DatosGrafica[] }> = ({ datos }) => {
  const total = datos.reduce((sum, d) => sum + d.value, 0);
  let startAngle = 0;

  const slices = datos.map((d, idx) => {
    const sliceAngle = (d.value / total) * 360;
    const endAngle = startAngle + sliceAngle;
    const largeArc = sliceAngle > 180 ? 1 : 0;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    const result = {
      path,
      color: COLORES_ESTADO[idx % COLORES_ESTADO.length],
      percentage: ((d.value / total) * 100).toFixed(0),
      startAngle,
      endAngle,
    };
    startAngle = endAngle;
    return result;
  });

  return (
    <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
      {slices.map((slice, idx) => (
        <path key={idx} d={slice.path} fill={slice.color} stroke="white" strokeWidth="2" />
      ))}
    </svg>
  );
};

// Componente de Bar Chart en SVG puro
const BarChart: React.FC<{ datos: DatosGrafica[] }> = ({ datos }) => {
  const maxValue = Math.max(...datos.map((d) => d.value));
  const barWidth = 40;
  const spacing = 20;
  const chartHeight = 250;
  const chartWidth = datos.length * (barWidth + spacing) + 60;

  return (
    <svg width="100%" height="300" viewBox={`0 0 ${chartWidth} 300`} className="mx-auto">
      {/* Eje Y */}
      <line x1="40" y1="10" x2="40" y2="260" stroke="#d1d5db" strokeWidth="2" />
      {/* Eje X */}
      <line x1="40" y1="260" x2={chartWidth - 10} y2="260" stroke="#d1d5db" strokeWidth="2" />

      {/* Escala Y */}
      {[0, maxValue / 2, maxValue].map((val, idx) => (
        <g key={`y-${idx}`}>
          <line x1="35" y1={260 - (val / maxValue) * 240} x2="40" y2={260 - (val / maxValue) * 240} stroke="#d1d5db" strokeWidth="1" />
          <text x="15" y={260 - (val / maxValue) * 240 + 4} fontSize="12" fill="#6b7280" textAnchor="end">
            {Math.round(val)}
          </text>
        </g>
      ))}

      {/* Barras */}
      {datos.map((d, idx) => {
        const barHeight = (d.value / maxValue) * 240;
        const x = 50 + idx * (barWidth + spacing);
        const y = 260 - barHeight;

        return (
          <g key={idx}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={COLORES_TIPO[idx % COLORES_TIPO.length]}
              rx="4"
              className="hover:opacity-80 transition-opacity"
            />
            <text
              x={x + barWidth / 2}
              y={280}
              fontSize="12"
              fill="#6b7280"
              textAnchor="middle"
              className="pointer-events-none"
            >
              {d.name}
            </text>
            <text x={x + barWidth / 2} y={y - 5} fontSize="12" fill="#374151" textAnchor="middle" fontWeight="bold">
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const GraficaContratos: React.FC<GraficaContratosProps> = ({
  datosEstado,
  datosTipoServicio,
}) => {
  const totalEstado = datosEstado.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Gráfica de Distribución por Estado (Pie) */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribución por Estado</h3>
        <div className="flex flex-col items-center">
          <PieChart datos={datosEstado} />
          <div className="mt-6 grid grid-cols-3 gap-4 w-full">
            {datosEstado.map((item, idx) => {
              const percentage = ((item.value / totalEstado) * 100).toFixed(0);
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-4 h-4 rounded-full mb-2"
                    style={{ backgroundColor: COLORES_ESTADO[idx % COLORES_ESTADO.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-500">
                    {item.value} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gráfica de Tipo de Servicio (Barras) */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Tipo de Servicio</h3>
        <BarChart datos={datosTipoServicio} />
      </div>
    </div>
  );
};
