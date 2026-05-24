import type { FiltroJornada, JornadaHistorial } from '../types';
import { JornadaCard } from './JornadaCard';

type Props = {
  jornadas: JornadaHistorial[];
  jornadasFiltradas: JornadaHistorial[];
  filtro: FiltroJornada;
  setFiltro: (f: FiltroJornada) => void;
  busqueda: string;
  setBusqueda: (v: string) => void;
  totales: { todas: number; completadas: number; activas: number };
};

const TABS: { key: FiltroJornada; label: string; countKey: keyof Props['totales'] }[] = [
  { key: 'TODAS', label: 'Todas', countKey: 'todas' },
  { key: 'COMPLETADAS', label: 'Completadas', countKey: 'completadas' },
  { key: 'ACTIVAS', label: 'Activas', countKey: 'activas' },
];

export function HistorialJornadas({
  jornadas,
  jornadasFiltradas,
  filtro,
  setFiltro,
  busqueda,
  setBusqueda,
  totales,
}: Props) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-100">
          <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-gray-900">Historial Completo de Jornadas</p>
          <p className="text-xs text-gray-400">
            Mostrando {jornadasFiltradas.length} de {jornadas.length} jornadas registradas
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por contrato, placa o observaciones..."
          className="min-w-0 flex-1 rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        <div className="flex shrink-0 flex-wrap gap-2">
          {TABS.map(({ key, label, countKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFiltro(key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${
                filtro === key
                  ? 'bg-slate-900 text-white shadow'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {key === 'COMPLETADAS' ? (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : key === 'ACTIVAS' ? (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              )}
              {label} ({totales[countKey]})
            </button>
          ))}
        </div>
      </div>

      {jornadasFiltradas.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No se encontraron jornadas.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {jornadasFiltradas.map((j) => (
            <JornadaCard key={j.id} jornada={j} />
          ))}
        </div>
      )}
    </section>
  );
}
