import { useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.css";
import { getJornadas } from "../../../../packages/api-client/src/services/jornadas";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: "📊" },
  { label: "Camiones", path: "/dashboard", icon: "🚛" },
  { label: "Contratos", path: "/dashboard", icon: "📄" },
  { label: "GPS", path: "/dashboard", icon: "📍" },
];

function RegistroNuevaJornada() {
  const navigate = useNavigate();

  const fechaActual = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [jornadas, setJornadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getJornadas();

        console.log("API RESPONSE:", res);

        // ✅ FIX IMPORTANTE: asegura array aunque API cambie estructura
        const data = Array.isArray(res)
          ? res
          : res?.data
          ? res.data
          : res?.items
          ? res.items
          : [];

        setJornadas(data);
      } catch (err) {
        console.error("Error cargando jornadas:", err);
        setJornadas([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [filtroObs, setFiltroObs] = useState("todas");

  const total = jornadas.length;
  const activas = jornadas.filter(j => j.estado === "Activa").length;
  const completadas = jornadas.filter(j => j.estado === "Completada").length;
  const conObs = jornadas.filter(j => j.observaciones).length;

  const jornadasFiltradas = jornadas.filter(j => {
    const estadoOk =
      filtroEstado === "todas" ||
      (j.estado || "").toLowerCase() === filtroEstado;

    const obsOk =
      filtroObs === "todas" ||
      (filtroObs === "con" && j.observaciones) ||
      (filtroObs === "sin" && !j.observaciones);

    return estadoOk && obsOk;
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
            <NavLink key={item.label} to={item.path} className="sidebar-link">
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <NavLink to="/RegistroNuevaJornada" className="sidebar-link active">
            🕒 Registro Jornadas
          </NavLink>
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        <div className="header-row">
          <div>
            <h1 className="dashboard-title">Registro de Jornadas</h1>
            <span className="subtitle">{fechaActual}</span>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate("/RegistroJornada")}
          >
            + Nueva Jornada
          </button>
        </div>

        <div className="kpi-row-4">
          <div className="kpi-card">
            <span className="kpi-label">Total Jornadas</span>
            <div className="kpi-value">{total}</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Jornadas Activas</span>
            <div className="kpi-value">{activas}</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Completadas</span>
            <div className="kpi-value">{completadas}</div>
          </div>

          <div className="kpi-card">
            <span className="kpi-label">Con Observaciones</span>
            <div className="kpi-value">{conObs}</div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-header">
            <input className="search-input" placeholder="Buscar..." />

            <div className="filters">
              <button
                className={filtroEstado === "todas" ? "active" : ""}
                onClick={() => setFiltroEstado("todas")}
              >
                Todas ({total})
              </button>

              <button
                className={filtroEstado === "activa" ? "active" : ""}
                onClick={() => setFiltroEstado("activa")}
              >
                Activas ({activas})
              </button>

              <button
                className={filtroEstado === "completada" ? "active" : ""}
                onClick={() => setFiltroEstado("completada")}
              >
                Completadas ({completadas})
              </button>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>ID Jornada</th>
                <th>Fecha</th>
                <th>Conductor</th>
                <th>Camión</th>
                <th>Contrato</th>
                <th>Horario</th>
                <th>Kilómetros</th>
                <th>Estado</th>
                <th>Observ.</th>
              </tr>
            </thead>

            <tbody>
              {jornadasFiltradas.map((j, i) => (
                <tr key={j.id || i}>
                  <td>{j.id}</td>
                  <td>{j.fecha}</td>
                  <td>{j.conductor}</td>
                  <td>{j.camion}</td>
                  <td>{j.contrato}</td>
                  <td>{j.horario}</td>
                  <td>{j.km} km</td>

                  <td>
                    <span
                      className={`badge ${
                        j.estado === "Activa" ? "active" : "done"
                      }`}
                    >
                      {j.estado}
                    </span>
                  </td>

                  <td>
                    <span className={j.observaciones ? "obs-si" : "obs-no"}>
                      {j.observaciones ? "Sí" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default RegistroNuevaJornada;