import { useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.css";
import { getJornadas } from "@nanutech/api-client";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: "📊" },
  { label: "Camiones", path: "/dashboard", icon: "🚛" },
  { label: "Contratos", path: "/dashboard", icon: "📄" },
  { label: "GPS", path: "/dashboard", icon: "📍" },
];

type Jornada = {
  id: string;
  fecha: string;
  conductor: string;
  camion: string;
  contrato: string;
  horario: string;
  km: number;
  estado: string;
  observaciones?: string;
};

function RegistroNuevaJornada() {
  const navigate = useNavigate();

  const fechaActual = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [filtroObs, setFiltroObs] = useState("todas");

  useEffect(() => {
    const load = async () => {
      try {
        const localData = localStorage.getItem("jornadas");

        if (localData) {
          setJornadas(JSON.parse(localData));
        } else {
          const res = await getJornadas();
          setJornadas(res as Jornada[]);
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

  const total = jornadas.length;
  const activas = jornadas.filter(
    (j) => (j.estado || "").toLowerCase() === "activa"
  ).length;
  const completadas = jornadas.filter(
    (j) => (j.estado || "").toLowerCase() === "completada"
  ).length;

  const totalKm = jornadas.reduce((acc, j) => acc + Number(j.km || 0), 0);

  const jornadasFiltradas = jornadas.filter((j) => {
    const estadoOk =
      filtroEstado === "todas" ||
      (j.estado || "").toLowerCase() === filtroEstado;

    const obsOk =
      filtroObs === "todas" ||
      (filtroObs === "con" && !!j.observaciones?.trim()) ||
      (filtroObs === "sin" && !j.observaciones?.trim());

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
              <h3>{totalKm}</h3>
            </div>
          </div>
        </div>

        <div className="table-card modern-card">
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

          <div className="filters modern-filters" style={{ marginBottom: "16px" }}>
            <button
              className={filtroObs === "todas" ? "active" : ""}
              onClick={() => setFiltroObs("todas")}
            >
              Todas las observaciones
            </button>

            <button
              className={filtroObs === "con" ? "active" : ""}
              onClick={() => setFiltroObs("con")}
            >
              Con Observaciones
            </button>

            <button
              className={filtroObs === "sin" ? "active" : ""}
              onClick={() => setFiltroObs("sin")}
            >
              Sin Observaciones
            </button>
          </div>

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
                        (j.estado || "").toLowerCase() === "activa" ? "blue" : "green"
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

              {jornadasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "16px" }}>
                    No se encontraron jornadas con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default RegistroNuevaJornada;