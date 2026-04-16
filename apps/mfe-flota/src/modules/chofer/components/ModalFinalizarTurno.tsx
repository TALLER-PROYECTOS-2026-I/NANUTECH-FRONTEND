import React, { useState } from 'react';
import '../styles/ModalFinalizarTurno.css';

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
      <div className="modal-overlay" onClick={alCancelar}></div>

      <div className="modal-finalizacion">
        <div className="modal-header">
          <h2 className="modal-titulo">Finalizar Turno</h2>
          <button
            className="modal-cerrar"
            onClick={alCancelar}
            disabled={cargando}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-contenido">
          <p className="modal-instruccion">
            Agrega observaciones sobre la jornada (opcional)
          </p>

          <textarea
            className="modal-textarea"
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

          <div className="modal-contador">
            <span className="contador-texto">
              {observaciones.length} / 500 caracteres
            </span>
            {error && <span className="contador-error">{error}</span>}
          </div>
        </div>

        <div className="modal-acciones">
          <button
            className="btn-cancelar"
            onClick={alCancelar}
            disabled={cargando}
          >
            Cancelar
          </button>

          <button
            className="btn-confirmar"
            onClick={manejarConfirmar}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner"></span>
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
