import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// PAGES
import Dashboard from "./modules/dashboard-admin/pages/Dashboard";
import RegistroJornada from "./modules/registro-jornada/pages/RegistroJornada";
import RegistroNuevaJornada from "./modules/registro-jornada/pages/RegistroNuevaJornada";
import MonitoreoCamionesPage from "./modules/monitoreo-camiones";

function AppRoutes() {
  return (
    <Routes>

      {/* 🔥 ENTRADA DIRECTA AL DASHBOARD */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* DASHBOARD */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* JORNADAS */}
      <Route path="/RegistroJornada" element={<RegistroJornada />} />
      <Route path="/RegistroNuevaJornada" element={<RegistroNuevaJornada />} />


      {/* MONITOREO DE CAMIONES */}
      <Route path="/camiones" element={<MonitoreoCamionesPage />} />

      {/* 🔥 CUALQUIER RUTA INVALIDA TAMBIÉN VA AL DASHBOARD */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

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