import React from 'react';
import '../styles/EstadoVacio.css';

interface EstadoVacioProps {
  titulo: string;
  descripcion: string;
  accion?: {
    texto: string;
    onClick: () => void;
  };
}

/**
 * Componente para mostrar el estado cuando no hay jornadas asignadas
 */
export const EstadoVacio: React.FC<EstadoVacioProps> = ({
  titulo,
  descripcion,
  accion,
}) => {
  return (
    <div className="estado-vacio">
      <div className="estado-vacio__contenido">
        <div className="estado-vacio__icono">📅</div>
        <h2 className="estado-vacio__titulo">{titulo}</h2>
        <p className="estado-vacio__descripcion">{descripcion}</p>

        {accion && (
          <button
            className="estado-vacio__accion"
            onClick={accion.onClick}
          >
            {accion.texto}
          </button>
        )}
      </div>
    </div>
  );
};
