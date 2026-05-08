import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';

// 🎨 estilos globales (según tu estructura)
import './styles/Layout.css';
import './styles/Sidebar.css';

// 🧩 Layout principal (Sidebar + estructura base)
import { Layout } from './components/Layout';

// 📌 módulo principal
import SeguimientoJornadas from './modules/seguimiento-jornadas/SeguimientoJornadas';

// 🎨 estilos del módulo (IMPORT CORRECTO según tu estructura)
import './modules/seguimiento-jornadas/seguimiento.css';

function App() {
  return (
    <BrowserRouter>

      {/* Layout envuelve toda la app (Sidebar + contenido) */}
      <Layout>

        <Routes>

          {/* ✅ Pantalla principal */}
          <Route
            path="/"
            element={<SeguimientoJornadas />}
          />

          {/* opcional: acceso directo */}
          <Route
            path="/seguimiento-jornadas"
            element={<SeguimientoJornadas />}
          />

          {/* fallback */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </Layout>

    </BrowserRouter>
  );
}

export default App;