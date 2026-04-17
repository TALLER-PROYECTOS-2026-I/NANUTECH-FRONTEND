import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// PAGES
import Dashboard from "./pages/Dashboard";
import RegistroJornada from "./pages/RegistroJornada";
import RegistroNuevaJornada from "./pages/RegistroNuevaJornada";

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