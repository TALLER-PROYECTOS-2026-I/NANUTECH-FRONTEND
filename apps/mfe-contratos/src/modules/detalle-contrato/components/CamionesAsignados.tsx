import { Camion } from '../types';

const CamionesAsignados = (
  { camiones }: { camiones: Camion[] }
) => {
  return (
    <div className="camiones-section">
      <h3 className="camiones-title">Unidades Asignadas</h3>
      <div className="camiones-contador">
        Total de camiones asignados: <span className="camiones-contador-value">{camiones.length}</span>
      </div>
      {camiones.length === 0 ? (
        <div className="text-center" style={{ padding: '24px', color: '#999', fontSize: '13px' }}>
          No hay unidades asignadas a este contrato
        </div>
      ) : (
        <div className="camiones-lista">
          {camiones.map((camion) => (
            <div key={camion.id} className="camion-item">
              <div className="camion-info">
                <div className="camion-placa">{camion.placa}</div>
                <div className="camion-modelo">{camion.modelo}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CamionesAsignados;
