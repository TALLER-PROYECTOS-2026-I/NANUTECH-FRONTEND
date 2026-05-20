import { ESTADO_BADGE_CLASS, ESTADO_LABEL } from '../constants';
import type { EstadoIncidente } from '../types';

// Renderiza el estado como badge coloreado para lectura rapida.
export function StatusBadge({ estado }: { estado: EstadoIncidente }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold ${ESTADO_BADGE_CLASS[estado]}`}>
      {ESTADO_LABEL[estado]}
    </span>
  );
}
