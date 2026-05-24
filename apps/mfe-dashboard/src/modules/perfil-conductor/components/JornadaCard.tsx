import type { JornadaHistorial } from '../types';

const formatFecha = (fechaIso: string): string => {
  if (!fechaIso) return '-';
  try {
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(fechaIso));
  } catch {
    return fechaIso;
  }
};

type Props = {
  jornada: JornadaHistorial;
};

export function JornadaCard({ jornada }: Props) {
  const esCompletada = jornada.estado === 'Completada';
  const esActiva = jornada.estado === 'Activa';
  const duracionTexto = jornada.duracionLabel ?? (jornada.duracion > 0 ? `${jornada.duracion} h` : '-');

  const badgeClass = esCompletada
    ? 'bg-green-100 text-green-700'
    : esActiva
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-600';

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200 hover:shadow">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${badgeClass}`}>
            {jornada.estado}
          </span>
          <span className="truncate text-sm font-semibold capitalize text-gray-700">
            {formatFecha(jornada.fecha)}
          </span>
        </div>

        <button
          type="button"
          aria-label="Ver detalle de jornada"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-50 hover:text-blue-500"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid gap-3 border-b border-gray-100 pb-3 md:grid-cols-3">
        <JornadaField tone="blue" label="Camión" value={jornada.camion || '-'} icon="truck" />
        <JornadaField tone="purple" label="Contrato" value={jornada.contrato || '-'} icon="file" />
        <JornadaField tone="green" label="Duración" value={duracionTexto} icon="clock" />
      </div>

      {jornada.observaciones && (
        <p className="mt-3 text-xs text-gray-500">
          <span className="block font-semibold text-gray-500">Observaciones:</span>
          {jornada.observaciones}
        </p>
      )}
    </div>
  );
}

function JornadaField({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: 'blue' | 'purple' | 'green';
  icon: 'truck' | 'file' | 'clock';
}) {
  const toneClass = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  }[tone];

  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${toneClass}`}>
        {icon === 'truck' && (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        )}
        {icon === 'file' && (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        )}
        {icon === 'clock' && (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-medium text-gray-400">{label}</span>
        <span className="block truncate text-xs font-bold text-gray-800">{value}</span>
      </span>
    </div>
  );
}
