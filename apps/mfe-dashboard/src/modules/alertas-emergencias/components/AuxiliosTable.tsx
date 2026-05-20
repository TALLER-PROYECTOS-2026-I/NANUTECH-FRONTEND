import type { Incidente } from '../types';
import { formatFechaHora } from '../utils/format';
import { UserIcon, WrenchIcon } from './AlertIcons';
import { StatusBadge } from './StatusBadge';

type AuxiliosTableProps = {
  auxilios: Incidente[];
  onView: (incidente: Incidente) => void;
};

// Tabla de solicitudes de auxilio mecanico con resaltado crema para pendientes.
export function AuxiliosTable({ auxilios, onView }: AuxiliosTableProps) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <WrenchIcon className="h-4 w-4 text-orange-600" />
          <h3 className="text-sm font-bold text-gray-900">Solicitudes de Auxilio Mecanico</h3>
        </div>
        <p className="text-xs text-gray-500">Reportes de fallas mecanicas de las unidades ({auxilios.length} registros)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-semibold text-gray-700">
              <th className="px-3 py-3">Fecha y Hora</th>
              <th className="px-3 py-3">Conductor</th>
              <th className="px-3 py-3">Unidad</th>
              <th className="px-3 py-3">Tipo de Falla</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {auxilios.map((auxilio) => (
              <tr
                key={auxilio.id}
                className={`border-b border-gray-100 text-xs ${auxilio.estado === 'ACTIVA' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <td className="px-3 py-3 font-semibold text-gray-900">{formatFechaHora(auxilio.fechaHora)}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-2 text-gray-700">
                    <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                    {auxilio.conductor.nombre}
                  </span>
                </td>
                <td className="px-3 py-3 text-gray-700">{auxilio.unidad?.placa ?? 'Sin asignar'}</td>
                <td className="px-3 py-3 font-semibold text-orange-700">{auxilio.tipoFallaMecanica ?? auxilio.detalle}</td>
                <td className="px-3 py-3">
                  <StatusBadge estado={auxilio.estado} />
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onView(auxilio)}
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
