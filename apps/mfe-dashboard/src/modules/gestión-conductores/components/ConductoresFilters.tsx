import { DISPONIBILIDAD_TABS, ESTADO_TABS } from '../constants';
import type { ConductorDashboard, DisponibilidadFiltro, EstadoFiltro } from '../types';

type ConductoresFiltersProps = {
  conductores: ConductorDashboard[];
  search: string;
  estado: EstadoFiltro;
  disponibilidad: DisponibilidadFiltro;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: EstadoFiltro) => void;
  onDisponibilidadChange: (value: DisponibilidadFiltro) => void;
};

const countEstado = (conductores: ConductorDashboard[], key: EstadoFiltro) => {
  if (key === 'ACTIVOS') return conductores.filter((conductor) => conductor.activo).length;
  if (key === 'INACTIVOS') return conductores.filter((conductor) => !conductor.activo).length;
  return conductores.length;
};

const countDisponibilidad = (
  conductores: ConductorDashboard[],
  key: DisponibilidadFiltro,
) => {
  if (key === 'TODOS') return conductores.length;
  return conductores.filter((conductor) => conductor.estadoOperacional === key).length;
};

export function ConductoresFilters({
  conductores,
  search,
  estado,
  disponibilidad,
  onSearchChange,
  onEstadoChange,
  onDisponibilidadChange,
}: ConductoresFiltersProps) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="sr-only">Buscar conductor</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-xs text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white"
          placeholder="Buscar por nombre, DNI o licencia..."
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {ESTADO_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onEstadoChange(tab.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              estado === tab.key
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label} ({countEstado(conductores, tab.key)})
          </button>
        ))}

        {DISPONIBILIDAD_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onDisponibilidadChange(tab.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              disponibilidad === tab.key
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label} ({countDisponibilidad(conductores, tab.key)})
          </button>
        ))}
      </div>
    </div>
  );
}
