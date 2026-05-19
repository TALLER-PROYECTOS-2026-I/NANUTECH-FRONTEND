import type { JornadaHistorial } from '../types';

const formatFecha = (fechaIso: string): string => {
  if (!fechaIso) return '—';
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

  const badgeClass = esCompletada
    ? 'bg-green-100 text-green-700'
    : esActiva
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-600';

  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeClass}`}>
            {jornada.estado}
          </span>
          <span className="text-sm font-medium capitalize text-gray-600">
            {formatFecha(jornada.fecha)}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 5v4h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span className="font-semibold text-gray-800">{jornada.camion || '—'}</span>
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="font-semibold text-gray-800">{jornada.contrato || '—'}</span>
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-semibold text-gray-800">
              {jornada.duracion > 0 ? `${jornada.duracion} horas` : '—'}
            </span>
          </span>
        </div>

        {jornada.observaciones && (
          <p className="mt-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-600">Observaciones: </span>
            {jornada.observaciones}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label="Ver detalle de jornada"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-blue-300 hover:text-blue-500"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
