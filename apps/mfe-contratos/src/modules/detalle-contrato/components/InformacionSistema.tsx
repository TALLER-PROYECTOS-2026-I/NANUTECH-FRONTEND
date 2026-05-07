import { InformacionSistema } from '../types';

const InformacionSistemaComponent = (
  { informacion }: { informacion: InformacionSistema }
) => {
  return (
    <div className="informacion-sistema">
      <h4 className="sistema-title">Información del Sistema</h4>
      <div className="sistema-info">
        <div className="sistema-item">
          <span className="sistema-item-label">Fecha de Creación</span>
          <span className="sistema-item-value">{informacion.fechaCreacion}</span>
        </div>
        <div className="sistema-item">
          <span className="sistema-item-label">Última Actualización</span>
          <span className="sistema-item-value">{informacion.ultimaActualizacion}</span>
        </div>
      </div>
    </div>
  );
};

export default InformacionSistemaComponent;
