import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// PAGES
import Dashboard from "./modules/dashboard-admin/pages/Dashboard";
import RegistroJornada from "./modules/registro-jornada/pages/RegistroJornada";
import RegistroNuevaJornada from "./modules/registro-jornada/pages/RegistroNuevaJornada";
import DashboardGerencial from "./modules/dashboard-gerencial/pages/DashboardGerencial";

function AppRoutes() {
  return (
    <Routes>

      {/* 🔥 ENTRADA DIRECTA AL DASHBOARD */}
      <Route path="/" element={<Navigate to="/dashboard/admin" replace />} />

      {/* DASHBOARD ADMIN */}
      <Route path="/dashboard/admin" element={<Dashboard />} />

      {/* DASHBOARD GERENCIAL */}
      <Route path="/dashboard/gerencial" element={<DashboardGerencial />} />

      {/* JORNADAS */}
      <Route path="/RegistroJornada" element={<RegistroJornada />} />
      <Route path="/RegistroNuevaJornada" element={<RegistroNuevaJornada />} />

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