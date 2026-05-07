import { Contrato } from '../types';

const InformacionGeneral = (
  { contrato }: { contrato: Contrato }
) => {
  return (
    <div className="informacion-general">
      <h3 className="informacion-general-title">Información General</h3>
      <div className="informacion-grid">
        <div className="informacion-item">
          <span className="informacion-label">Código de Contrato</span>
          <span className="informacion-valor">{contrato.codigo}</span>
        </div>
        <div className="informacion-item">
          <span className="informacion-label">Cliente</span>
          <span className="informacion-valor">{contrato.cliente}</span>
        </div>
        <div className="informacion-item">
          <span className="informacion-label">Tipo de Servicio</span>
          <span className="informacion-valor">{contrato.tipoTarifa}</span>
        </div>
        <div className="informacion-item">
          <span className="informacion-label">Estado</span>
          <span className={`estado-badge ${contrato.estado.toLowerCase()}`}>
            {contrato.estado}
          </span>
        </div>
        <div className="informacion-item">
          <span className="informacion-label">Fecha de Inicio</span>
          <span className="informacion-valor">{contrato.fechaInicio}</span>
        </div>
        <div className="informacion-item">
          <span className="informacion-label">Fecha de Fin</span>
          <span className="informacion-valor">{contrato.fechaFin}</span>
        </div>
        <div className="informacion-item">
          <span className="informacion-label">Tarifa</span>
          <span className="informacion-valor emphasis">
            $ {contrato.tarifa} {contrato.moneda}
          </span>
        </div>
        <div className="informacion-item">
          <span className="informacion-label">Descripción</span>
          <span className="informacion-valor">{contrato.descripcion}</span>
        </div>
      </div>
    </div>
  );
};

export default InformacionGeneral;
