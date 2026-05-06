import { Contrato, PaginacionDatos } from '../types';
import { obtenerColorbadgeEstado, obtenerTextoEstado } from '../services';

interface TablaContratosProps {
  datos: PaginacionDatos;
  pagina: number;
  busqueda: string;
  onPaginaChange: (pagina: number) => void;
  onBusquedaChange: (busqueda: string) => void;
  onVer: (contrato: Contrato) => void;
}

export const TablaContratos: React.FC<TablaContratosProps> = ({
  datos,
  pagina,
  busqueda,
  onPaginaChange,
  onBusquedaChange,
  onVer,
}) => {
  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBusquedaChange(e.target.value);
    onPaginaChange(1); // Resetear a la primera página
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Buscador */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Listado de Contratos</h3>
        <p className="text-gray-600 text-sm mb-4">Todos los contratos registrados en el sistema</p>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por cliente o código..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-3 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipo Servicio</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tarifa</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha Inicio</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fecha Fin</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datos.items.length > 0 ? (
              datos.items.map((contrato) => (
                <tr key={contrato.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                    <svg className="inline mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                    </svg>
                    {contrato.codigo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{contrato.cliente}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{contrato.tipoServicio}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{contrato.tarifa}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{contrato.fechaInicio}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{contrato.fechaFin}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${obtenerColorbadgeEstado(contrato.estado)}`}>
                      {obtenerTextoEstado(contrato.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => onVer(contrato)}
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                  </svg>
                  No hay contratos que coincidan con tu búsqueda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {datos.totalPaginas > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{(pagina - 1) * datos.porPagina + 1}</span> a{' '}
            <span className="font-semibold">{Math.min(pagina * datos.porPagina, datos.total)}</span> de{' '}
            <span className="font-semibold">{datos.total}</span> contratos
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPaginaChange(pagina - 1)}
              disabled={pagina === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            {/* Números de página */}
            {Array.from({ length: Math.min(5, datos.totalPaginas) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPaginaChange(pageNum)}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                    pagina === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPaginaChange(pagina + 1)}
              disabled={pagina === datos.totalPaginas}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
