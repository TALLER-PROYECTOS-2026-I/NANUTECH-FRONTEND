import React from 'react';
import '../styles/HistorialJornadas.css';

/**
 * Componente HistorialJornadas
 * Muestra tarjeta con opción de ver historial completo
 */
export const HistorialJornadas: React.FC = () => {
  return (
    <div className="historial-jornadas">
      <div className="historial__header">
        <span className="historial__icon">📋</span>
        <div>
          <h3 className="historial__titulo">Historial de Jornadas</h3>
          <p className="historial__subtitulo">Consulta todas tus jornadas completadas</p>
        </div>
      </div>

      <div className="historial__contenido">
        <div className="historial__icono-grande">📅</div>
        <p className="historial__mensaje">
          Revisa el historial completo de tus jornadas, filtra por fecha y consulta estadísticas detalladas.
        </p>
        <button className="btn btn--historial">
          <span>👁</span>
          Ver Historial Completo
        </button>
      </div>
    </div>
  );
};
