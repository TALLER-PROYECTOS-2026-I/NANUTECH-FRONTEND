import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Layout } from "./components/Layout";
import { TurnoChoferPage } from "./modules/chofer/pages/TurnoChoferPage";
import SeguimientoJornadas from "./modules/seguimiento-jornadas/SeguimientoJornadas";

/**
 * 🏠 Dashboard ahora = Turno Chofer
 */
function Dashboard() {
  return <TurnoChoferPage />;
}

/**
 * 🚛 Turno Chofer vacío (por ahora)
 */
function TurnoChoferEmpty() {
  return (
    <div style={{ padding: 20 }}>
      <h2>🚛 Turno Chofer</h2>
      <p>Pantalla en construcción...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>

        <Routes>

          {/* 🏠 MI DASHBOARD = TURNOS CHOFER */}
          <Route path="/" element={<Dashboard />} />

          {/* 🚛 TURNOS (VACÍO) */}
          <Route path="/turno-chofer" element={<TurnoChoferEmpty />} />

          {/* 📊 SEGUIMIENTO JORNADAS */}
          <Route
            path="/seguimiento-jornadas"
            element={<SeguimientoJornadas />}
          />

        </Routes>

      </Layout>
    </BrowserRouter>
  );
}

export default App;