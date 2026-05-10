import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./modules/dashboard-admin/pages/Dashboard";
import RegistroJornada from "./modules/registro-jornada/pages/RegistroJornada";
import RegistroNuevaJornada from "./modules/registro-jornada/pages/RegistroNuevaJornada";
import DashboardGerencial from "./modules/dashboard-gerencial/pages/DashboardGerencial";
import MonitoreoCamionesPage from "./modules/monitoreo-camiones";

// GPS
import GpsIntegrationPage from "./modules/gps-integration/pages/GpsIntegrationPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* 🔥 ENTRADA DIRECTA AL DASHBOARD */}
      <Route path="/" element={<Navigate to="/dashboard/admin" replace />} />

      {/* DASHBOARD ADMIN */}
      <Route path="/dashboard/admin" element={<Dashboard />} />

      {/* DASHBOARD GERENCIAL */}
      <Route path="/dashboard/gerencial" element={<DashboardGerencial />} />

      {/* GPS */}
      <Route path="/gps" element={<GpsIntegrationPage />} />

      {/* JORNADAS */}
      <Route path="/RegistroJornada" element={<RegistroJornada />} />
      <Route path="/RegistroNuevaJornada" element={<RegistroNuevaJornada />} />

      {/* MONITOREO DE CAMIONES */}
      <Route path="/camiones" element={<MonitoreoCamionesPage />} />

      {/* 🔥 CUALQUIER RUTA INVALIDA TAMBIÉN VA AL DASHBOARD */}
      <Route path="*" element={<Navigate to="/dashboard/admin" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
