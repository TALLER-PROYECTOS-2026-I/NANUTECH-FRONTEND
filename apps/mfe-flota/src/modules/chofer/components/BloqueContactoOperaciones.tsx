import React from 'react';
import { CONTACTO_OPERACIONES } from '../constants';

interface BloqueContactoOperacionesProps {
  /** Dentro de EstadoVacio: sin sombra propia para integrarse en la tarjeta padre. */
  anidado?: boolean;
}

/**
 * Bloque de contacto (solo presentación) según diseño corporativo:
 * fondo azul muy claro, borde suave, teléfono y texto de soporte.
 */
export const BloqueContactoOperaciones: React.FC<
  BloqueContactoOperacionesProps
> = ({ anidado = false }) => {
  return (
    <div
      className={`mx-auto mt-6 w-full max-w-xl rounded-xl border border-blue-200 bg-blue-50 px-6 py-6 text-center ${
        anidado ? '' : 'shadow-sm'
      }`}
    >
      <div className="mb-1 flex items-center justify-center gap-2">
        <svg
          className="h-5 w-5 shrink-0 text-rose-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
        <a
          href={`tel:${CONTACTO_OPERACIONES.TELEFONO_TEL}`}
          className="text-base font-bold text-blue-900 underline-offset-2 hover:underline"
        >
          Contacto: {CONTACTO_OPERACIONES.TELEFONO_ETIQUETA}
        </a>
      </div>
      <p className="text-sm text-blue-600">{CONTACTO_OPERACIONES.SUBTITULO}</p>
    </div>
  );
};
