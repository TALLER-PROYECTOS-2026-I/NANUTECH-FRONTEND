import { useState } from 'react';
import { Contrato, Camion, CambioHistorial, EstadisticasContrato, InformacionSistema } from '../types';
import DetalleHeader from './DetalleHeader';
import AlertaVencimiento from './AlertaVencimiento';
import InformacionGeneral from './InformacionGeneral';
import EstadisticasPanel from './EstadisticasPanel';
import InformacionSistemaComponent from './InformacionSistema';
import CamionesAsignados from './CamionesAsignados';
import HistorialCambios from './HistorialCambios';
import EditarContratoForm from './EditarContratoForm';
import '../styles.css';

type TabType = 'general' | 'camiones' | 'historial';

const DetalleContratoPage = ({
  contrato: contratoInicial,
  camionesAsignados: camionesAsignadosInicial = [],
  cambiosHistorial: cambiosHistorialInicial = [],
  onVolver,
}: {
  contrato: Contrato;
  camionesAsignados?: Camion[];
  cambiosHistorial?: CambioHistorial[];
  onVolver?: () => void;
}) => {
  const [contrato, setContrato] = useState<Contrato>(contratoInicial);
  const [camionesAsignados, setCamionesAsignados] = useState<Camion[]>(camionesAsignadosInicial);
  const [cambiosHistorial, setCambiosHistorial] = useState<CambioHistorial[]>(cambiosHistorialInicial);
  const [mostrandoEdicion, setMostrandoEdicion] = useState(false);
  const [tabActiva, setTabActiva] = useState<TabType>('general');
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  const estadisticas: EstadisticasContrato = {
    camiones: camionesAsignados.length,
    duracion: `${contrato.diasRestantes} días`,
    diasRestantes: contrato.diasRestantes,
    diasVencimiento: contrato.diasVencimiento,
  };

  const informacionSistema: InformacionSistema = {
    fechaCreacion: '1/3/2026, 8:00:00 a.m.',
    ultimaActualizacion: '1/3/2026, 8:00:00 a.m.',
  };

  const handleGuardarEdicion = (
    contratoActualizado: Contrato,
    cambios: CambioHistorial[],
    camionesAsignados: Camion[]
  ) => {
    setContrato(contratoActualizado);
    setCambiosHistorial([...cambios, ...cambiosHistorial]);
    setCamionesAsignados(camionesAsignados);
    setMostrandoEdicion(false);
    setMensajeGuardado(true);
    setTimeout(() => setMensajeGuardado(false), 3000);
  };

  if (mostrandoEdicion) {
    return (
      <div className="detalle-contrato-container">
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setMostrandoEdicion(false)}
            style={{
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← Volver
          </button>
        </div>
        <EditarContratoForm
          contrato={contrato}
          camionesAsignados={camionesAsignados}
          onGuardar={handleGuardarEdicion}
          onCancelar={() => setMostrandoEdicion(false)}
        />
      </div>
    );
  }

  return (
    <div className="detalle-contrato-container">
      <DetalleHeader contrato={contrato} onEditar={() => setMostrandoEdicion(true)} />

      {mensajeGuardado && (
        <div className="success-message">
          ✓ Contrato actualizado exitosamente
        </div>
      )}

      <AlertaVencimiento contrato={contrato} />

      <div className="tabs-container">
        <button
          className={`tab-button ${tabActiva === 'general' ? 'active' : ''}`}
          onClick={() => setTabActiva('general')}
        >
          Información General
        </button>
        <button
          className={`tab-button ${tabActiva === 'camiones' ? 'active' : ''}`}
          onClick={() => setTabActiva('camiones')}
        >
          Unidades Asignadas
        </button>
        <button
          className={`tab-button ${tabActiva === 'historial' ? 'active' : ''}`}
          onClick={() => setTabActiva('historial')}
        >
          Historial de Cambios
        </button>
      </div>

      {tabActiva === 'general' && (
        <div className="detalle-content-layout">
          <div>
            <InformacionGeneral contrato={contrato} />
          </div>
          <div>
            <EstadisticasPanel estadisticas={estadisticas} />
            <InformacionSistemaComponent informacion={informacionSistema} />
          </div>
        </div>
      )}

      {tabActiva === 'camiones' && (
        <div>
          <CamionesAsignados camiones={camionesAsignados} />
        </div>
      )}

      {tabActiva === 'historial' && (
        <div>
          <HistorialCambios cambios={cambiosHistorial} />
        </div>
      )}
    </div>
  );
};

export default DetalleContratoPage;
