import type { CamionHu11 } from "@nanutech/api-client";
import { Icon } from "./Icon";
import { TruckCard } from "./TruckCard";

type FleetGridProps = {
  camiones: CamionHu11[];
  totalCamiones: number;
  onDetail: (camionId: string) => void;
};

// Listado visual de camiones filtrados.
export function FleetGrid({ camiones, totalCamiones, onDetail }: FleetGridProps) {
  return (
    <section className="mt-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">
              <Icon name="truck" />
            </span>
            <h2 className="text-sm font-bold text-gray-900">Flota de Camiones</h2>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Mostrando {camiones.length} de {totalCamiones} camiones
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {camiones.map((camion) => (
          <TruckCard key={camion.id} camion={camion} onDetail={() => onDetail(camion.id)} />
        ))}
      </div>
    </section>
  );
}

