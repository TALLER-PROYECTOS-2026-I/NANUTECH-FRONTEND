import React from 'react';
import { ReglaGeneralNanuTech } from '../types/turnoChofer.types';
import '../styles/RegeneralNanuTech.css';

interface RegeneralNanuTechProps {
  reglas: ReglaGeneralNanuTech[];
}

/**
 * Componente que muestra las reglas generales de NANU TECH
 * Incluye: Seguridad, Puntualidad, Inspección, Uso de Botones, etc.
 */
export const RegeneralNanuTech: React.FC<RegeneralNanuTechProps> = ({ reglas }) => {
  return (
    <div className="regeneral-nanu-tech">
      <div className="regeneral-header">
        <h3 className="regeneral-titulo">
          <span className="regeneral-icono">📋</span>
          Reglas Generales de NANU TECH
        </h3>
        <p className="regeneral-subtitulo">Normas de seguridad y conducta</p>
      </div>

      <div className="regeneral-grid">
        {reglas.map((regla) => (
          <div
            key={regla.id}
            className={`regeneral-card regeneral-card--${regla.color}`}
          >
            <div className="card-icono">{regla.icono}</div>
            <div className="card-contenido">
              <h4 className="card-titulo">{regla.titulo}</h4>
              <p className="card-descripcion">{regla.descripcion}</p>
            </div>
            <div className={`card-barra card-barra--${regla.color}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};
