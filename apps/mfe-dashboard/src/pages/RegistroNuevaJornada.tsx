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
  const [, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const localData = localStorage.getItem("jornadas");

        if (localData) {
          setJornadas(JSON.parse(localData));
        } else {
          const res = await getJornadas();

          const data = Array.isArray(res)
            ? res
            : res?.data
            ? res.data
            : res?.items
            ? res.items
            : [];

          setJornadas(data);
        }
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
  const [filtroObs] = useState("todas");

  const total = jornadas.length;
  const activas = jornadas.filter(j => j.estado === "Activa").length;
  const completadas = jornadas.filter(j => j.estado === "Completada").length;
  const conObs = jornadas.filter(j => j.observaciones).length;

  const jornadasFiltradas = jornadas.filter((j) => {
    const estadoOk =
      filtroEstado === "todas" ||
      (j.estado || "").toLowerCase() === filtroEstado;

    const obsOk =
      filtroObs === "todas" ||
      (filtroObs === "con" && j.observaciones) ||
      (filtroObs === "sin" && !j.observaciones);

    const texto = busqueda.toLowerCase();

    const busquedaOk =
      texto === "" ||
      j.id?.toString().toLowerCase().includes(texto) ||
      j.fecha?.toLowerCase().includes(texto) ||
      j.conductor?.toLowerCase().includes(texto) ||
      j.camion?.toLowerCase().includes(texto) ||
      j.contrato?.toLowerCase().includes(texto) ||
      j.estado?.toLowerCase().includes(texto);

    return estadoOk && obsOk && busquedaOk;
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

        {/* HEADER */}
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
  <div className="kpi-card-pro">
    <div className="kpi-icon blue">📅</div>
    <div>
      <span>Total Jornadas</span>
      <h3>{total}</h3>
    </div>
  </div>

  <div className="kpi-card-pro">
    <div className="kpi-icon blue">🕒</div>
    <div>
      <span>Jornadas Activas</span>
      <h3>{activas}</h3>
    </div>
  </div>

  <div className="kpi-card-pro">
    <div className="kpi-icon green">✅</div>
    <div>
      <span>Completadas</span>
      <h3>{completadas}</h3>
    </div>
  </div>

  <div className="kpi-card-pro">
    <div className="kpi-icon purple">📍</div>
    <div>
      <span>Total KM</span>
      <h3>10,815</h3>
    </div>
  </div>
</div>
        {/* TABLE */}
        <div className="table-card modern-card">

          {/* HEADER FILTROS */}
          <div className="table-header modern-header">
            <input
              className="search-input modern-input"
              placeholder="🔍 Buscar por conductor, camión, contrato..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="filters modern-filters">
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

          {/* TABLA */}
          <table className="table modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Conductor</th>
                <th>Camión</th>
                <th>Contrato</th>
                <th>Horario</th>
                <th>KM</th>
                <th>Estado</th>
                <th>Obs</th>
              </tr>
            </thead>

            <tbody>
              {jornadasFiltradas.map((j, i) => (
                <tr key={j.id || i}>
                  <td><strong>{j.id}</strong></td>
                  <td>{j.fecha}</td>
                  <td>{j.conductor}</td>
                  <td>{j.camion}</td>
                  <td>{j.contrato}</td>
                  <td>{j.horario}</td>
                  <td>{j.km} km</td>

                  <td>
                    <span
                      className={`badge modern-badge ${
                        j.estado === "Activa" ? "blue" : "green"
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