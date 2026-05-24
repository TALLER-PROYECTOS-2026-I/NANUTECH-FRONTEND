import type { EstadoOperacional } from '../../gestión-conductores/types';

const BADGE: Record<EstadoOperacional, { label: string; className: string }> = {
  EN_RUTA: { label: 'En Ruta', className: 'bg-green-500 text-white' },
  DISPONIBLE: { label: 'Disponible', className: 'bg-blue-500 text-white' },
  DESCANSANDO: { label: 'Descansando', className: 'bg-orange-400 text-white' },
  DE_PERMISO: { label: 'De Permiso', className: 'bg-slate-400 text-white' },
  SIN_ASIGNAR: { label: 'Sin Asignar', className: 'bg-gray-300 text-gray-700' },
};

type Props = {
  nombre: string;
  licencia: string;
  estadoOperacional: EstadoOperacional;
};

export function ConductorHeader({ nombre, licencia, estadoOperacional }: Props) {
  const badge = BADGE[estadoOperacional] ?? BADGE.SIN_ASIGNAR;
  const isWorking = estadoOperacional === 'EN_RUTA';

  return (
    <div className="mb-6 flex items-center justify-between rounded-sm bg-blue-600 px-5 py-4 text-white shadow">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-white/20">
          <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold leading-tight">{nombre}</h2>
          <p className="text-sm text-blue-100">Licencia: {licencia}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold shadow ${badge.className}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
          {badge.label}
        </span>
        <p className="mt-2 text-xs font-semibold text-blue-100">
          {isWorking ? 'Conductor actualmente en jornada' : 'Conductor sin jornada activa'}
        </p>
      </div>
    </div>
  );
}
