import { Routes, Route, Navigate } from "react-router-dom";

// PAGES
import Dashboard from "./modules/dashboard-admin/pages/Dashboard";
import RegistroJornada from "./modules/registro-jornada/pages/RegistroJornada";
import RegistroNuevaJornada from "./modules/registro-jornada/pages/RegistroNuevaJornada";
import MonitoreoCamionesPage from "./modules/monitoreo-camiones/MonitoreoCamionesPage";

// GPS
import GpsIntegrationPage from "./modules/gps-integration/pages/GpsIntegrationPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* base */}
      <Route index element={<Navigate to="dashboard" replace />} />

      {/* dashboard */}
      <Route path="dashboard" element={<Dashboard />} />

      {/* GPS */}
      <Route path="gps" element={<GpsIntegrationPage />} />

      {/* jornadas */}
      <Route path="registro-jornada" element={<RegistroJornada />} />
      <Route path="registro-jornada/nueva" element={<RegistroNuevaJornada />} />

      {/* camiones */}
      <Route path="camiones" element={<MonitoreoCamionesPage />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
