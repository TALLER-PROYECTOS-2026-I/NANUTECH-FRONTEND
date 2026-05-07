import { mockContratos } from '../detalle-contrato/mockData';

const GestionContratos = () => {
  const totalContratos = mockContratos.length;
  const contratosActivos = mockContratos.filter(c => c.estado === 'Activo').length;
  const contratosVencidos = mockContratos.filter(c => c.diasVencimiento <= 7).length;
  const totalCamiones = 5;

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
          Gestión de Contratos
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Panel de control y administración de contratos</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '8px' }}>Total Contratos</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#1976d2' }}>{totalContratos}</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '8px' }}>Contratos Activos</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#2e7d32' }}>{contratosActivos}</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '8px' }}>Próximos a Vencer</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f57c00' }}>{contratosVencidos}</div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '8px' }}>Camiones en Uso</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#d32f2f' }}>{totalCamiones}</div>
        </div>
      </div>

      {/* Alerta */}
      {contratosVencidos > 0 && (
        <div style={{ backgroundColor: '#fff4e6', borderLeft: '4px solid #ff9800', borderRadius: '4px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <div style={{ fontSize: '20px', color: '#ff9800', flexShrink: 0 }}>⚠️</div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#e65100', fontSize: '14px', fontWeight: '600' }}>Contratos próximos a expirar</h4>
            <p style={{ margin: 0, color: '#d84315', fontSize: '13px' }}>Hay {contratosVencidos} contrato(s) que vencerá(n) en los próximos 7 días</p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Gráfico Estado */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>Contratos por Estado</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '60px', height: '120px', backgroundColor: '#2e7d32', borderRadius: '4px' }}></div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Activos</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>{contratosActivos}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '60px', height: '80px', backgroundColor: '#f57c00', borderRadius: '4px' }}></div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Vencidos</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>{contratosVencidos}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '60px', height: '40px', backgroundColor: '#1976d2', borderRadius: '4px' }}></div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>Inactivos</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>0</div>
            </div>
          </div>
        </div>

        {/* Gráfico Tipo de Servicio */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>Tipos de Servicio</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Por Viaje</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>1</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '50%', height: '100%', backgroundColor: '#1976d2' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Por Tonelada</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>1</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '50%', height: '100%', backgroundColor: '#2e7d32' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>Por Hora</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>0</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '0%', height: '100%', backgroundColor: '#f57c00' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '1px solid #eee' }}>Lista de Contratos</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#666', borderBottom: '2px solid #ddd', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Código</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#666', borderBottom: '2px solid #ddd', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliente</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#666', borderBottom: '2px solid #ddd', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Descripción</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#666', borderBottom: '2px solid #ddd', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tarifa</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#666', borderBottom: '2px solid #ddd', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</th>
                <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#666', borderBottom: '2px solid #ddd', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Días Restantes</th>
              </tr>
            </thead>
            <tbody>
              {mockContratos.map((contrato) => (
                <tr key={contrato.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 8px', color: '#1a1a1a', fontWeight: '600' }}>{contrato.codigo}</td>
                  <td style={{ padding: '12px 8px', color: '#1a1a1a' }}>{contrato.cliente}</td>
                  <td style={{ padding: '12px 8px', color: '#666', fontSize: '12px' }}>{contrato.descripcion}</td>
                  <td style={{ padding: '12px 8px', color: '#1a1a1a', fontWeight: '600' }}>{contrato.tarifa} {contrato.moneda}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      backgroundColor: contrato.estado === 'Activo' ? '#e8f5e9' : '#ffebee',
                      color: contrato.estado === 'Activo' ? '#2e7d32' : '#c62828',
                    }}>
                      {contrato.estado}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', color: contrato.diasRestantes <= 7 ? '#f57c00' : '#1a1a1a', fontWeight: '600' }}>{contrato.diasRestantes} días</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionContratos;
