import { useNavigate } from 'react-router-dom';

type Props = {
  placa: string | null;
};

export function CamionAsignadoCard({ placa }: Props) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 5v4h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900">Camión Asignado Actualmente</p>
            <p className="text-xs text-gray-400">Unidad operativa del conductor</p>
          </div>
        </div>
        {placa && (
          <button
            type="button"
            onClick={() => navigate('/dashboard/admin/camiones')}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Ver Detalle
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {placa ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <CamionField label="Placa" value={placa} />
          <CamionField label="Marca/Modelo" value="—" />
          <CamionField label="Año" value="—" />
          <CamionField label="Capacidad" value="—" />
        </div>
      ) : (
        <p className="text-sm text-gray-400">Este conductor no tiene un camión asignado actualmente.</p>
      )}
    </div>
  );
}

function CamionField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}
