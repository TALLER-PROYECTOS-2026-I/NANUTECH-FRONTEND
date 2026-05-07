import { useState } from 'react';
import { Camion } from '../types';

const AsignarUnidades = ({
  camionesDisponibles,
  camionesSeleccionados,
  onAsignar,
  onCancelar,
}: {
  camionesDisponibles: Camion[];
  camionesSeleccionados: Camion[];
  onAsignar: (camiones: Camion[]) => void;
  onCancelar: () => void;
}) => {
  const [seleccionados, setSeleccionados] = useState<string[]>(
    camionesSeleccionados.map((c) => c.id)
  );

  const handleToggle = (camionId: string) => {
    setSeleccionados((prev) =>
      prev.includes(camionId)
        ? prev.filter((id) => id !== camionId)
        : [...prev, camionId]
    );
  };

  const handleAsignar = () => {
    const camionesAsignados = camionesDisponibles.filter((c) =>
      seleccionados.includes(c.id)
    );
    onAsignar(camionesAsignados);
  };

  return (
    <div className="asignar-unidades">
      <h3 className="asignar-unidades-title">Seleccionar Unidades</h3>
      <div className="asignar-unidades-lista">
        {camionesDisponibles.map((camion) => (
          <label key={camion.id} className="asignar-unidad-item">
            <input
              type="checkbox"
              className="asignar-unidad-checkbox"
              checked={seleccionados.includes(camion.id)}
              onChange={() => handleToggle(camion.id)}
            />
            <div className="asignar-unidad-info">
              <div className="asignar-unidad-placa">{camion.placa}</div>
              <div className="asignar-unidad-modelo">{camion.modelo}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="button-group" style={{ marginTop: '24px' }}>
        <button className="button button-primary" onClick={handleAsignar}>
          Asignar {seleccionados.length > 0 && `(${seleccionados.length})`}
        </button>
        <button className="button button-secondary" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default AsignarUnidades;
