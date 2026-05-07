import { CambioHistorial } from '../types';

const HistorialCambios = (
  { cambios }: { cambios: CambioHistorial[] }
) => {
  return (
    <div className="historial-cambios">
      <h3 className="historial-title">Historial de Cambios</h3>
      {cambios.length === 0 ? (
        <div className="historial-empty">
          <p>No hay registros de cambios para este contrato</p>
        </div>
      ) : (
        <table className="historial-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Campo</th>
              <th>Valor Anterior</th>
              <th>Valor Nuevo</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {cambios.map((cambio) => (
              <tr key={cambio.id}>
                <td>{cambio.fecha}</td>
                <td>{cambio.hora}</td>
                <td>{cambio.campo}</td>
                <td>{cambio.valorAnterior}</td>
                <td>{cambio.valorNuevo}</td>
                <td>{cambio.usuario || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistorialCambios;
