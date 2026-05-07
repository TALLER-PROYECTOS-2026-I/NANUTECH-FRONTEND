import { EstadisticasContrato } from '../types';

const EstadisticasPanel = (
  { estadisticas }: { estadisticas: EstadisticasContrato }
) => {
  return (
    <div className="estadisticas-panel">
      <h3 className="estadisticas-title">Estadísticas</h3>
      <div className="estadistica-item">
        <span className="estadistica-label">Camiones</span>
        <span className="estadistica-value">{estadisticas.camiones}</span>
      </div>
      <div className="estadistica-item">
        <span className="estadistica-label">Duración</span>
        <span className="estadistica-value">{estadisticas.duracion}</span>
      </div>
      <div className="estadistica-item">
        <span className="estadistica-label">Días Restantes</span>
        <span className={`estadistica-value ${estadisticas.diasRestantes <= 7 ? 'warning' : 'highlight'}`}>
          {estadisticas.diasRestantes} días
        </span>
      </div>
    </div>
  );
};

export default EstadisticasPanel;
