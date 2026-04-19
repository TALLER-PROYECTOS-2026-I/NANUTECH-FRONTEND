import React, { useState } from 'react';

interface ModalFinalizarTurnoProps {
  abierto: boolean;
  cargando?: boolean;
  alCancelar: () => void;
  alConfirmar: (observaciones: string) => Promise<void>;
}

/**
 * Modal para capturar observaciones al finalizar el turno
 * Valida que no se envíe un modal vacío y muestra estado de carga
 */
export const ModalFinalizarTurno: React.FC<ModalFinalizarTurnoProps> = ({
  abierto,
  cargando = false,
  alCancelar,
  alConfirmar,
}) => {
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');

  const manejarConfirmar = async () => {
    setError('');

    if (observaciones.trim().length > 500) {
      setError('Las observaciones no pueden exceder 500 caracteres');
      return;
    }

    try {
      await alConfirmar(observaciones);
      setObservaciones('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al finalizar turno');
    }
  };

  if (!abierto) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-[1px]" onClick={alCancelar}></div>

      <div className="fixed left-1/2 top-1/2 z-50 w-[94%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">Finalizar Turno</h2>
          <button
            className="rounded-md border border-gray-200 px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            onClick={alCancelar}
            disabled={cargando}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-sm text-gray-600">
            Agrega observaciones sobre la jornada (opcional)
          </p>

          <textarea
            className="min-h-28 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition-colors focus:border-blue-500"
            placeholder="Ej: Viaje sin novedades, tráfico normal, cliente conforme..."
            value={observaciones}
            onChange={(e) => {
              setObservaciones(e.target.value);
              setError('');
            }}
            disabled={cargando}
            maxLength={500}
            rows={6}
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {observaciones.length} / 500 caracteres
            </span>
            {error && <span className="font-medium text-rose-600">{error}</span>}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">
          <button
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            onClick={alCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={manejarConfirmar}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                Finalizando...
              </>
            ) : (
              <>
                <span className="icono">✓</span>
                Confirmar y Finalizar
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
