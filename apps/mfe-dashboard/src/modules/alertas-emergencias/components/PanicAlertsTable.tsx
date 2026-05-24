import type { Incidente } from '../types';
import { formatCoord, formatFechaHora } from '../utils/format';
import { AlertTriangleIcon, MapPinIcon, UserIcon } from './AlertIcons';
import { StatusBadge } from './StatusBadge';

type PanicAlertsTableProps = {
  alertas: Incidente[];
  onView: (incidente: Incidente) => void;
};

// Tabla de alertas de panico con prioridad visual para incidentes activos.
export function PanicAlertsTable({ alertas, onView }: PanicAlertsTableProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-bold text-gray-900">Alertas de Panico SOS</h3>
        </div>
        <p className="text-xs text-gray-500">Alertas de emergencia activadas por conductores ({alertas.length} registros)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-700">
              <th className="px-3 py-3">Fecha y Hora</th>
              <th className="px-3 py-3">Conductor</th>
              <th className="px-3 py-3">Ubicacion GPS</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alertas.map((alerta) => (
              <tr
                key={alerta.id}
                className={`border-b border-gray-100 text-xs ${alerta.estado === 'ACTIVA' ? 'bg-red-50' : 'hover:bg-gray-50'}`}
              >
                <td className="px-3 py-3 font-semibold text-gray-900">{formatFechaHora(alerta.fechaHora)}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                    {alerta.conductor.nombre}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <MapPinIcon className="h-3.5 w-3.5 text-red-500" />
                    {formatCoord(alerta.latitud)}, {formatCoord(alerta.longitud)}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge estado={alerta.estado} />
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onView(alerta)}
                    className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
