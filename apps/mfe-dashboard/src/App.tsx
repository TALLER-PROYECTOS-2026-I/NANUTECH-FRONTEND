import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./modules/dashboard-admin/pages/Dashboard";
import RegistroJornada from "./modules/registro-jornada/pages/RegistroJornada";
import RegistroNuevaJornada from "./modules/registro-jornada/pages/RegistroNuevaJornada";
import MonitoreoCamionesPage from "./modules/monitoreo-camiones";
import GpsIntegrationPage from "./modules/gps-integration/pages/GpsIntegrationPage";
import AlertasEmergenciasPage from "./modules/alertas-emergencias";
import GestionConductoresPage from "./modules/gestión-conductores";

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas relativas usadas cuando el shell monta este MFE en /dashboard/admin/*. */}
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="gps" element={<GpsIntegrationPage />} />
      <Route path="registro-jornada" element={<RegistroJornada />} />
      <Route path="registro-jornada/nueva" element={<RegistroNuevaJornada />} />
      <Route path="camiones" element={<MonitoreoCamionesPage />} />
      <Route path="conductores" element={<GestionConductoresPage />} />
      <Route path="conductores/:id" element={<GestionConductoresPage />} />
      <Route path="alertas" element={<AlertasEmergenciasPage />} />

      {/* Compatibilidad cuando el MFE se abre directo en localhost:3001. */}
      <Route path="/" element={<Navigate to="/dashboard/admin/dashboard" replace />} />
      <Route path="/dashboard/admin" element={<Navigate to="/dashboard/admin/dashboard" replace />} />
      <Route path="/dashboard/admin/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/admin/gps" element={<GpsIntegrationPage />} />
      <Route path="/dashboard/admin/registro-jornada" element={<RegistroJornada />} />
      <Route path="/dashboard/admin/registro-jornada/nueva" element={<RegistroNuevaJornada />} />
      <Route path="/dashboard/admin/camiones" element={<MonitoreoCamionesPage />} />
      <Route path="/dashboard/admin/conductores" element={<GestionConductoresPage />} />
      <Route path="/dashboard/admin/conductores/:id" element={<GestionConductoresPage />} />
      <Route path="/dashboard/admin/alertas" element={<AlertasEmergenciasPage />} />
      <Route path="/gps" element={<Navigate to="/dashboard/admin/gps" replace />} />
      <Route path="/RegistroJornada" element={<Navigate to="/dashboard/admin/registro-jornada" replace />} />
      <Route path="/RegistroNuevaJornada" element={<Navigate to="/dashboard/admin/registro-jornada/nueva" replace />} />
      <Route path="/camiones" element={<Navigate to="/dashboard/admin/camiones" replace />} />
      <Route path="/conductores" element={<Navigate to="/dashboard/admin/conductores" replace />} />
      <Route path="/alertas" element={<Navigate to="/dashboard/admin/alertas" replace />} />

      {/* Cualquier ruta invalida vuelve al panel principal sin salir del contexto actual. */}
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
