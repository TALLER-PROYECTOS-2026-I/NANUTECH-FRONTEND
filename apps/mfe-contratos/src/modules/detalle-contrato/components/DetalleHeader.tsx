import { Contrato } from '../types';

const DetalleHeader = (
  { contrato, onEditar }: { contrato: Contrato; onEditar: () => void }
) => {
  return (
    <div className="detalle-header">
      <div className="detalle-header-left">
        <h1 className="detalle-header-title">Detalle de Contrato</h1>
        <p className="detalle-header-subtitle">{contrato.codigo}</p>
      </div>
      <button className="detalle-header-button" onClick={onEditar}>
        Editar
      </button>
    </div>
  );
};

export default DetalleHeader;
