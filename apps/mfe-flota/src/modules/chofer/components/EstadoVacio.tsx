import React from 'react';

interface EstadoVacioProps {
  titulo: string;
  descripcion: string;
  accion?: {
    texto: string;
    onClick: () => void;
  };
  /** Contenido adicional al pie (p. ej. bloque de contacto), dentro de la misma tarjeta. */
  pie?: React.ReactNode;
}

/**
 * Componente para mostrar el estado cuando no hay jornadas asignadas
 */
export const EstadoVacio: React.FC<EstadoVacioProps> = ({
  titulo,
  descripcion,
  accion,
  pie,
}) => {
  return (
    <div className="mb-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
        ◌
      </div>
      <h2 className="mb-2 text-lg font-bold text-gray-900">{titulo}</h2>
      <p className="mx-auto max-w-xl text-sm text-gray-600">{descripcion}</p>

      {accion && (
        <button
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          onClick={accion.onClick}
        >
          {accion.texto}
        </button>
      )}

      {pie}
    </div>
  );
};
