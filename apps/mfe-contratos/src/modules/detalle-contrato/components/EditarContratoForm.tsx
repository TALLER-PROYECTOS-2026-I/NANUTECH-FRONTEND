import { useState } from 'react';
import { Contrato, Camion, CambioHistorial } from '../types';
import AsignarUnidades from './AsignarUnidades';
import { getCamisonesDisponibles } from '../mockData';

const EditarContratoForm = ({
  contrato,
  camionesAsignados,
  onGuardar,
  onCancelar,
}: {
  contrato: Contrato;
  camionesAsignados: Camion[];
  onGuardar: (
    contratoActualizado: Contrato,
    cambios: CambioHistorial[],
    camionesAsignados: Camion[]
  ) => void;
  onCancelar: () => void;
}) => {
  const [formData, setFormData] = useState<Contrato>(contrato);
  const [errorValidacion, setErrorValidacion] = useState<string>('');
  const [mostrarAsignarUnidades, setMostrarAsignarUnidades] = useState(false);
  const [camionesSeleccionados, setCamionesSeleccionados] = useState<Camion[]>(camionesAsignados);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'tarifa' ? parseFloat(value) || 0 : value,
    }));
    setErrorValidacion('');
  };

  const validarFormulario = (): boolean => {
    const fechaInicio = new Date(formData.fechaInicio.split('/').reverse().join('-'));
    const fechaFin = new Date(formData.fechaFin.split('/').reverse().join('-'));

    if (fechaFin < fechaInicio) {
      setErrorValidacion('La fecha de fin no puede ser menor a la fecha de inicio');
      return false;
    }

    if (!formData.codigo.trim()) {
      setErrorValidacion('El código de contrato es requerido');
      return false;
    }

    if (!formData.cliente.trim()) {
      setErrorValidacion('El cliente es requerido');
      return false;
    }

    return true;
  };

  const generarCambios = (): CambioHistorial[] => {
    const cambios: CambioHistorial[] = [];
    const ahora = new Date();
    const fecha = `${ahora.getDate()}/${ahora.getMonth() + 1}/${ahora.getFullYear()}`;
    const hora = `${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, '0')}`;

    // Comparar cada campo
    if (formData.codigo !== contrato.codigo) {
      cambios.push({
        id: Date.now().toString() + '1',
        fecha,
        hora,
        campo: 'Código',
        valorAnterior: contrato.codigo,
        valorNuevo: formData.codigo,
        usuario: 'Usuario Actual',
      });
    }

    if (formData.cliente !== contrato.cliente) {
      cambios.push({
        id: Date.now().toString() + '2',
        fecha,
        hora,
        campo: 'Cliente',
        valorAnterior: contrato.cliente,
        valorNuevo: formData.cliente,
        usuario: 'Usuario Actual',
      });
    }

    if (formData.tarifa !== contrato.tarifa) {
      cambios.push({
        id: Date.now().toString() + '3',
        fecha,
        hora,
        campo: 'Tarifa',
        valorAnterior: `${contrato.moneda} ${contrato.tarifa}`,
        valorNuevo: `${formData.moneda} ${formData.tarifa}`,
        usuario: 'Usuario Actual',
      });
    }

    if (formData.tipoTarifa !== contrato.tipoTarifa) {
      cambios.push({
        id: Date.now().toString() + '4',
        fecha,
        hora,
        campo: 'Tipo de Tarifa',
        valorAnterior: contrato.tipoTarifa,
        valorNuevo: formData.tipoTarifa,
        usuario: 'Usuario Actual',
      });
    }

    if (formData.fechaInicio !== contrato.fechaInicio) {
      cambios.push({
        id: Date.now().toString() + '5',
        fecha,
        hora,
        campo: 'Fecha de Inicio',
        valorAnterior: contrato.fechaInicio,
        valorNuevo: formData.fechaInicio,
        usuario: 'Usuario Actual',
      });
    }

    if (formData.fechaFin !== contrato.fechaFin) {
      cambios.push({
        id: Date.now().toString() + '6',
        fecha,
        hora,
        campo: 'Fecha de Fin',
        valorAnterior: contrato.fechaFin,
        valorNuevo: formData.fechaFin,
        usuario: 'Usuario Actual',
      });
    }

    if (formData.estado !== contrato.estado) {
      cambios.push({
        id: Date.now().toString() + '7',
        fecha,
        hora,
        campo: 'Estado',
        valorAnterior: contrato.estado,
        valorNuevo: formData.estado,
        usuario: 'Usuario Actual',
      });
    }

    if (formData.descripcion !== contrato.descripcion) {
      cambios.push({
        id: Date.now().toString() + '8',
        fecha,
        hora,
        campo: 'Descripción',
        valorAnterior: contrato.descripcion,
        valorNuevo: formData.descripcion,
        usuario: 'Usuario Actual',
      });
    }

    return cambios;
  };

  const handleGuardar = () => {
    if (!validarFormulario()) {
      return;
    }

    const cambios = generarCambios();
    onGuardar(formData, cambios, camionesSeleccionados);
  };

  const handleAsignarUnidades = (camiones: Camion[]) => {
    setCamionesSeleccionados(camiones);
    setMostrarAsignarUnidades(false);
  };

  if (mostrarAsignarUnidades) {
    return (
      <AsignarUnidades
        camionesDisponibles={getCamisonesDisponibles()}
        camionesSeleccionados={camionesSeleccionados}
        onAsignar={handleAsignarUnidades}
        onCancelar={() => setMostrarAsignarUnidades(false)}
      />
    );
  }

  return (
    <div className="editar-contrato-form">
      <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 24px 0' }}>
        Editar Contrato
      </h2>

      {errorValidacion && <div className="error-message">{errorValidacion}</div>}

      <div className="form-section">
        <h3 className="form-section-title">Información del Contrato</h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Código de Contrato</label>
            <input
              type="text"
              className="form-input"
              name="codigo"
              value={formData.codigo}
              onChange={handleInputChange}
              placeholder="CTR-2026-001"
            />
          </div>
          <div className="form-group">
            <label className="form-label required">Cliente</label>
            <input
              type="text"
              className="form-input"
              name="cliente"
              value={formData.cliente}
              onChange={handleInputChange}
              placeholder="Nombre del cliente"
            />
          </div>
        </div>

        <div className="form-row full">
          <div className="form-group">
            <label className="form-label required">Descripción</label>
            <textarea
              className="form-textarea"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción del contrato"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Fecha de Inicio</label>
            <input
              type="text"
              className="form-input"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleInputChange}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div className="form-group">
            <label className="form-label required">Fecha de Fin</label>
            <input
              type="text"
              className="form-input"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleInputChange}
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Configuración de Tarifa</h3>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Tipo de Tarifa</label>
            <select
              className="form-select"
              name="tipoTarifa"
              value={formData.tipoTarifa}
              onChange={handleInputChange}
            >
              <option>Por Viaje</option>
              <option>Por Hora</option>
              <option>Por Tonelada</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label required">Monto</label>
            <input
              type="number"
              className="form-input"
              name="tarifa"
              value={formData.tarifa}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label required">Moneda</label>
            <select
              className="form-select"
              name="moneda"
              value={formData.moneda}
              onChange={handleInputChange}
            >
              <option>PEN</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label required">Estado</label>
            <select
              className="form-select"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
            >
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Completado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Unidades Asignadas</h3>
        <div className="camiones-contador">
          Total de camiones asignados: <span className="camiones-contador-value">{camionesSeleccionados.length}</span>
        </div>
        {camionesSeleccionados.length > 0 && (
          <div className="camiones-lista" style={{ marginBottom: '16px' }}>
            {camionesSeleccionados.map((camion) => (
              <div key={camion.id} className="camion-item">
                <div className="camion-info">
                  <div className="camion-placa">{camion.placa}</div>
                  <div className="camion-modelo">{camion.modelo}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          className="button button-secondary"
          onClick={() => setMostrarAsignarUnidades(true)}
          style={{ width: '100%', marginBottom: '16px' }}
        >
          {camionesSeleccionados.length > 0 ? 'Cambiar Unidades' : 'Asignar Unidades'}
        </button>
      </div>

      <div className="button-group">
        <button className="button button-primary" onClick={handleGuardar}>
          Guardar Cambios
        </button>
        <button className="button button-secondary" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default EditarContratoForm;
