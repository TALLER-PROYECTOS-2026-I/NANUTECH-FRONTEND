import type { CamionHu11 } from "@nanutech/api-client";
import { estadoBadgeClass, estadoLabel } from "../constants";
import { formatNumber } from "../utils/format";
import { Icon } from "./Icon";
import { Metric } from "./Metric";

type TruckCardProps = {
  camion: CamionHu11;
  onDetail: () => void;
};

// Tarjeta principal de cada camión dentro del listado de flota.
export function TruckCard({ camion, onDetail }: TruckCardProps) {
  // Calcula porcentaje de eficiencia como horas en movimiento sobre horas totales.
  const eficiencia = camion.horas_totales > 0 ? Math.round((camion.horas_movimiento / camion.horas_totales) * 100) : 0;
  // Considera GPS activo solo si está habilitado y existe última lectura GPS.
  const hasGps = camion.gps_habilitado && Boolean(camion.ultimo_gps_at);

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="bg-blue-600 p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <Icon name="truck" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{camion.placa}</h3>
              <p className="mt-2 text-sm">{camion.marca} {camion.modelo}</p>
              <p className="text-xs text-blue-100">Año: {camion.anio}</p>
            </div>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-bold ${estadoBadgeClass[camion.estado] || estadoBadgeClass.INACTIVA}`}>
            {estadoLabel[camion.estado] || "Inactivo"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <Metric label="Capacidad de Carga" value={`${formatNumber(camion.capacidad_ton, 1)} TM`} tone="purple" />
        <Metric label="Horas Totales" value={`${formatNumber(camion.horas_totales, 1)} h`} tone="blue" />
        <Metric label="Movimiento" value={`${formatNumber(camion.horas_movimiento, 1)} h`} tone="green" />
        <Metric label="Detenido" value={`${formatNumber(camion.horas_detenido, 1)} h`} tone="orange" />
        <Metric label="Kilómetros Totales" value={`${new Intl.NumberFormat("es-PE").format(camion.kilometros_totales || 0)} km`} tone="sky" wide />
      </div>

      <div className="px-5 pb-5">
        <div className="mb-2 flex justify-between text-xs text-gray-500">
          <span>Eficiencia Operativa</span>
          <span className="font-semibold text-green-600">{eficiencia}%</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-green-500" style={{ width: `${eficiencia}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
          <span>GPS {hasGps ? "Activo" : "N/A"}</span>
          <span>{hasGps ? "95 km/h" : "0 km/h"}</span>
        </div>
        <button
          type="button"
          onClick={onDetail}
          className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Ver detalle
        </button>
      </div>
    </article>
  );
}

