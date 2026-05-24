import { ESTADO_OPERACIONAL_LABEL } from '../constants';
import type { ConductorDashboard, EstadoOperacional } from '../types';
import { CircleIcon, ClockIcon, EyeIcon, RouteIcon } from './ConductorIcons';

type ConductoresTableProps = {
  conductores: ConductorDashboard[];
  onView: (conductor: ConductorDashboard) => void;
};

const statusClass: Record<EstadoOperacional, string> = {
  DISPONIBLE: 'bg-green-100 text-green-700',
  EN_RUTA: 'bg-blue-100 text-blue-700',
  DESCANSANDO: 'bg-orange-100 text-orange-700',
  DE_PERMISO: 'bg-slate-100 text-slate-700',
  SIN_ASIGNAR: 'bg-gray-100 text-gray-600',
};

function OperationalIcon({ estado }: { estado: EstadoOperacional }) {
  if (estado === 'EN_RUTA') return <RouteIcon className="h-4 w-4 text-blue-500" />;
  if (estado === 'DESCANSANDO') return <ClockIcon className="h-4 w-4 text-orange-500" />;
  return <CircleIcon className="h-3.5 w-3.5 text-gray-400" />;
}

export function ConductoresTable({ conductores, onView }: ConductoresTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold text-gray-600">
            <th className="px-3 py-3">Conductor</th>
            <th className="px-3 py-3">DNI</th>
            <th className="px-3 py-3">Licencia</th>
            <th className="px-3 py-3">Contacto</th>
            <th className="px-3 py-3">Estado Operacional</th>
            <th className="px-3 py-3">Camion Asignado</th>
            <th className="px-3 py-3">Estado</th>
            <th className="px-3 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {conductores.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-10 text-center text-sm text-gray-500">
                No se encontraron conductores
              </td>
            </tr>
          ) : (
            conductores.map((conductor) => (
              <tr key={conductor.id} className="border-b border-gray-100 text-xs hover:bg-gray-50">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{conductor.nombre}</p>
                      {conductor.email && (
                        <p className="text-[11px] text-gray-500">{conductor.email}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-gray-700">{conductor.dni}</td>
                <td className="px-3 py-3">
                  <p className="font-medium text-gray-700">{conductor.licencia}</p>
                  <p className="text-[11px] text-gray-400">A-II-b</p>
                </td>
                <td className="px-3 py-3 text-gray-600">{conductor.contacto}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <OperationalIcon estado={conductor.estadoOperacional} />
                    <span className={`rounded px-2 py-1 text-[11px] font-bold ${statusClass[conductor.estadoOperacional]}`}>
                      {ESTADO_OPERACIONAL_LABEL[conductor.estadoOperacional]}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  {conductor.camionAsignado ? (
                    <span className="rounded bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700">
                      {conductor.camionAsignado}
                    </span>
                  ) : (
                    <span className="text-gray-400">Sin asignar</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className={`rounded px-2 py-1 text-[11px] font-bold ${
                    conductor.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {conductor.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onView(conductor)}
                    className="mx-auto flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <EyeIcon />
                    Ver
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
