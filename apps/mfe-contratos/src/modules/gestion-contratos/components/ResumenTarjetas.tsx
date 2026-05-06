import { ResumenDatos } from '../types';

interface ResumenTarjetasProps {
  datos: ResumenDatos;
}

export const ResumenTarjetas: React.FC<ResumenTarjetasProps> = ({ datos }) => {
  const tarjetas = [
    {
      titulo: 'Total Contratos',
      valor: datos.totalContratos,
      icono: '📋',
      color: 'bg-gradient-to-br from-gray-100 to-gray-50',
      colorNumero: 'text-gray-700',
      subtitulo: 'Registrados en el sistema',
    },
    {
      titulo: 'Contratos Activos',
      valor: datos.contratosActivos,
      icono: '✓',
      color: 'bg-gradient-to-br from-green-100 to-green-50',
      colorNumero: 'text-green-600',
      subtitulo: 'Vigentes y operativos',
    },
    {
      titulo: 'Contratos Vencidos',
      valor: datos.contratosVencidos,
      icono: '⚠',
      color: 'bg-gradient-to-br from-red-100 to-red-50',
      colorNumero: 'text-red-600',
      subtitulo: 'Requieren revisión',
    },
    {
      titulo: 'Camiones Asignados',
      valor: datos.camionesAsignados,
      icono: '🚛',
      color: 'bg-gradient-to-br from-blue-100 to-blue-50',
      colorNumero: 'text-blue-600',
      subtitulo: 'Total de unidades',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {tarjetas.map((tarjeta, idx) => (
        <div
          key={idx}
          className={`${tarjeta.color} rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-2">{tarjeta.titulo}</p>
              <p className={`text-3xl font-bold ${tarjeta.colorNumero} mb-1`}>
                {tarjeta.valor}
              </p>
              <p className="text-gray-500 text-xs">{tarjeta.subtitulo}</p>
            </div>
            <div className="text-2xl ml-2">{tarjeta.icono}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
