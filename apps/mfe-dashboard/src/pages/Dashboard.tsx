import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { getCamiones } from "../../../../packages/api-client/src/services/camiones";
import "./Dashboard.css";

/* MOCK DATA (igual lo dejamos) */
const kmData = [
  { name: "Camión 1", km: 210 },
  { name: "Camión 2", km: 195 },
  { name: "Camión 3", km: 240 },
  { name: "Camión 4", km: 185 },
  { name: "Camión 5", km: 200 },
];

const productividadData = [
  { name: "Conductor A", horas: 8 },
  { name: "Conductor B", horas: 7.5 },
  { name: "Conductor C", horas: 7 },
  { name: "Conductor D", horas: 7 },
  { name: "Conductor E", horas: 8.5 },
];

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: "📊" },
  { label: "Camiones", path: "/dashboard", icon: "🚛" },
  { label: "Contratos", path: "/dashboard", icon: "📄" },
  { label: "GPS", path: "/dashboard", icon: "📍" },
  { label: "Registro Jornadas", path: "/RegistroNuevaJornada", icon: "🕒" },
];

function Dashboard() {
  const navigate = useNavigate();

  const [camiones, setCamiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCamiones();

        console.log("API RESPONSE:", res);

        // 🔥 compatibilidad total con cualquier formato de API
        const data = res?.data || res?.unidades || res || [];

        setCamiones(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando unidades:", err);
        setCamiones([]); // evita pantalla en blanco
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* 🔥 IMPORTANTE: adaptado a nueva API */
  const camionesActivos = camiones.filter((c) => {
    const estado = (c?.estado || c?.status || "").toLowerCase();
    return estado === "activo" || estado === "disponible";
  });

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">NANU TECH</h2>
          <span className="sidebar-subtitle">Gestión de Flota</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className="sidebar-link"
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">Dashboard Ejecutivo</h1>

        {/* LOADING SAFE */}
        {loading ? (
          <p style={{ color: "#64748b" }}>Cargando unidades...</p>
        ) : (
          <>
            {/* KPI */}
            <div className="kpi-row">
              <div className="kpi-card">
                <div className="kpi-icon kpi-icon--blue">🚛</div>
                <div className="kpi-info">
                  <span className="kpi-label">Unidades Activas</span>
                  <span className="kpi-value">
                    {camionesActivos.length}
                  </span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon kpi-icon--green">📦</div>
                <div className="kpi-info">
                  <span className="kpi-label">Total Unidades</span>
                  <span className="kpi-value">{camiones.length}</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon kpi-icon--yellow">⏱️</div>
                <div className="kpi-info">
                  <span className="kpi-label">Horas Operación</span>
                  <span className="kpi-value">94h</span>
                </div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="charts-row">
              <div className="chart-card">
                <h3 className="chart-title">Km por Camión</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={kmData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="km" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">Productividad Conductores</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={productividadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="horas" fill="#34d399" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;