import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: "📊" },
  { label: "Alertas", path: "/alertas", icon: "⚠️" },
  { label: "Camiones", path: "/camiones", icon: "🚛" },
  { label: "Conductores", path: "/conductores", icon: "👤" },
  { label: "GPS", path: "/gps", icon: "📡" },
  { label: "Tracking", path: "/tracking", icon: "📍" },
];

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">NANU TECH</h2>
          <p className="sidebar-subtitle">Gestión de Flota</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout">Cerrar sesión</button>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        {children}
      </main>

    </div>
  );
}

export default DashboardLayout;