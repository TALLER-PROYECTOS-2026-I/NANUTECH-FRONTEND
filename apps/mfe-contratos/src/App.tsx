import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { DetalleContratoPage } from './modules/detalle-contrato/components';
import { mockContratos, mockCamionesAsignados, mockHistorialCambios } from './modules/detalle-contrato/mockData';
import GestionContratos from './modules/gestion-contratos/GestionContratos';
import './App.css'

const NavBar = () => (
  <div style={{
    backgroundColor: 'white',
    borderBottom: '1px solid #eee',
    padding: '16px 24px',
    display: 'flex',
    gap: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  }}>
    <Link to="/" style={{ textDecoration: 'none', fontSize: '14px', fontWeight: '500', color: '#333' }}>
      HU06 - Gestión
    </Link>
    <Link to="/detalle" style={{ textDecoration: 'none', fontSize: '14px', fontWeight: '500', color: '#333' }}>
      HU07 - Detalle
    </Link>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<GestionContratos />} />
      <Route path="/detalle" element={
        <DetalleContratoPage 
          contrato={mockContratos[0]}
          camionesAsignados={mockCamionesAsignados}
          cambiosHistorial={mockHistorialCambios}
        />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <NavBar />
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
