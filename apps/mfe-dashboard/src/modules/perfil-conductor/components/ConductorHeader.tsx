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

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl bg-blue-600 px-8 py-5 text-white shadow">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
          <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold leading-tight">{nombre}</h2>
          <p className="text-sm text-blue-100">Licencia: {licencia}</p>
        </div>
      </div>
      <span className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold shadow ${badge.className}`}>
        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
        {badge.label}
      </span>
    </div>
  );
}
