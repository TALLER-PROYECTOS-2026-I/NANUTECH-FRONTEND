import { estadoOptions } from "../constants";

type FleetFiltersProps = {
  search: string;
  estado: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onOpenRegister: () => void;
  onDownloadCsv: () => void;
};

// Panel de filtros y acciones principales del módulo.
export function FleetFilters({
  search,
  estado,
  onSearchChange,
  onEstadoChange,
  onOpenRegister,
  onDownloadCsv,
}: FleetFiltersProps) {
  return (
    <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Filtros</h2>
          <p className="text-xs text-gray-500">Buscar y filtrar camiones</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenRegister}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <span className="text-base leading-none">+</span>
            Registrar Camión
          </button>
          <button
            type="button"
            onClick={onDownloadCsv}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <span aria-hidden="true">↓</span>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_0.9fr]">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por placa o marca..."
          className="h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
        />
        <select
          value={estado}
          onChange={(event) => onEstadoChange(event.target.value)}
          className="h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
          aria-label="Estado"
        >
          {estadoOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

