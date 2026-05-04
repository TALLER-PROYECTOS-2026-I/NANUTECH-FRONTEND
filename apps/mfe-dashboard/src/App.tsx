import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// PAGES
import Dashboard from "./modules/dashboard-admin/pages/Dashboard";
import GpsIntegrationPage from "./modules/gps-integration/pages/GpsIntegrationPage";
import RegistroNuevaJornada from "./modules/registro-jornada/pages/RegistroNuevaJornada";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 🔥 AQUÍ ESTÁ LA CLAVE */}
        <Route path="/dashboard/gps" element={<GpsIntegrationPage />} />

        {/* Otros */}
        <Route path="/RegistroNuevaJornada" element={<RegistroNuevaJornada />} />

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;