import { useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  createJornada,
  getConductores,
  getCamiones,
  getContratosVigentes,
  type Conductor,
  type Camion,
  type Contrato,
} from "@nanutech/api-client";

const menuItems = [
  { label: "Dashboard", path: "/dashboard", icon: "📊" },
  { label: "Camiones", path: "/dashboard", icon: "🚛" },
  { label: "Contratos", path: "/dashboard", icon: "📄" },
  { label: "GPS", path: "/dashboard", icon: "📍" },
];

function RegistroJornada() {
  const navigate = useNavigate();

  const fechaActual = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [horaActual, setHoraActual] = useState("");

  const [form, setForm] = useState({
    conductor: "",
    camion: "",
    contrato: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    km: "",
    origen: "",
    destino: "",
    observaciones: "",
  });

  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      const hora = ahora.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setHoraActual(hora);
    };

    actualizarHora();
    const intervalo = setInterval(actualizarHora, 1000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [conductoresRes, camionesRes, contratosRes] = await Promise.all([
          getConductores(),
          getCamiones(),
          getContratosVigentes(),
        ]);

        const conductoresActivos = (conductoresRes || []).filter(
          (c) => (c.estado || "").toUpperCase() === "ACTIVO" || c.activo === true
        );

        const contratosVigentes = (contratosRes || []).filter(
          (c) =>
            (c.estado || "").toUpperCase() === "VIGENTE" ||
            (c.estado || "").toUpperCase() === "ACTIVO" ||
            c.activo === true
        );

        setConductores(conductoresActivos);
        setCamiones(camionesRes || []);
        setContratos(contratosVigentes);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
        setConductores([]);
        setCamiones([]);
        setContratos([]);
      } finally {
        setLoadingCatalogos(false);
      }
    };

    cargarCatalogos();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validar = () => {
    if (
      !form.conductor ||
      !form.camion ||
      !form.contrato ||
      !form.fecha ||
      !form.horaInicio ||
      !form.horaFin ||
      !form.km
    ) {
      setError("Complete todos los campos obligatorios (*) para continuar");
      return false;
    }

    if (isNaN(Number(form.km))) {
      setError("Complete todos los campos obligatorios (*) para continuar");
      return false;
    }

    if (form.horaFin <= form.horaInicio) {
      setError("La hora de fin debe ser mayor a la hora de inicio");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!validar()) return;

    const usuarioGuardado = localStorage.getItem("nanutech_user");
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

    if (!usuario?.id) {
      setError("No se pudo identificar el usuario que registra la jornada");
      return;
    }

    try {
      const payload = {
        conductor_id: form.conductor,
        unidad_id: form.camion,
        contrato_id: form.contrato,
        creado_por: usuario.id,
        fecha: form.fecha,
        hora_inicio: form.horaInicio,
        hora_fin: form.horaFin,
        km_recorridos: Number(form.km),
        origen: form.origen,
        destino: form.destino,
        observaciones: form.observaciones || "",
      };

      console.log("PAYLOAD ENVIADO:", payload);

      await createJornada(payload);

      setSuccess("Jornada registrada correctamente 🚀");

      setForm({
        conductor: "",
        camion: "",
        contrato: "",
        fecha: "",
        horaInicio: "",
        horaFin: "",
        km: "",
        origen: "",
        destino: "",
        observaciones: "",
      });

      setTimeout(() => {
        navigate("/RegistroNuevaJornada");
      }, 800);
    } catch (err: any) {
      console.error("ERROR COMPLETO:", err);
      console.error("RESPONSE DATA:", err?.response?.data);
      setError(err?.response?.data?.message || "Error al registrar jornada");
    }
  };

  return (
    <div className="dashboard-layout registro-jornada">
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

          <NavLink to="/RegistroJornada" className="sidebar-link active">
            🕒 Registro Jornadas
          </NavLink>
        </nav>

        <button className="sidebar-logout" onClick={() => navigate("/")}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="header-row">
          <div>
            <h2 style={{ margin: 0 }}>Registro Jornadas</h2>
            <span className="subtitle">{fechaActual}</span>
          </div>

          <div className="last-update">
            Última actualización
            <br />
            <strong>{horaActual}</strong>
          </div>
        </div>

        <div className="volver" onClick={() => navigate(-1)}>
          ← Volver
        </div>

        <h1 className="dashboard-title">Registrar Nueva Jornada Laboral</h1>

        <p className="form-subtitle">
          Complete todos los campos requeridos para registrar la jornada
        </p>

        <div className="alert-box">
          <strong>Los campos marcados con *</strong>
          <br />
          son obligatorios. Asegúrese de completar toda la información antes de guardar la jornada.
        </div>

        <div className="chart-card">
          {error && <div className="error-text">{error}</div>}
          {success && <div style={{ color: "green", marginBottom: "12px" }}>{success}</div>}

          <h3 className="chart-title">Información de la Jornada</h3>

          <div className="form-vertical">
            <div className="form-group">
              <label>Conductor *</label>
              <select
                name="conductor"
                value={form.conductor}
                onChange={handleChange}
                disabled={loadingCatalogos}
              >
                <option value="">Seleccione un conductor activo</option>
                {conductores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {`${c.nombres || ""} ${c.apellidos || ""}`.trim() || c.correo || c.id}
                  </option>
                ))}
              </select>
              <small>Seleccione el conductor responsable de realizar la jornada laboral</small>
            </div>

            <div className="form-group">
              <label>Unidad de Transporte (Placa/Modelo) *</label>
              <select
                name="camion"
                value={form.camion}
                onChange={handleChange}
                disabled={loadingCatalogos}
              >
                <option value="">Seleccione un camión disponible</option>
                {camiones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.placa ? `${c.placa} - ${c.marca || ""} ${c.modelo || ""}`.trim() : c.id}
                  </option>
                ))}
              </select>
              <small>Solo se muestran camiones disponibles</small>
            </div>

            <div className="form-group">
              <label>Contrato Comercial Vigente *</label>
              <select
                name="contrato"
                value={form.contrato}
                onChange={handleChange}
                disabled={loadingCatalogos}
              >
                <option value="">Seleccione un contrato activo</option>
                {contratos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo || c.id}
                  </option>
                ))}
              </select>
              <small>Seleccione el contrato comercial bajo el cual se realizará la jornada</small>
            </div>
          </div>

          <h3 className="form-group mt-20">Detalles de la Jornada</h3>

          <div className="form-vertical">
            <div className="form-group">
              <label>Fecha *</label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Hora de Inicio *</label>
                <input
                  type="time"
                  name="horaInicio"
                  value={form.horaInicio}
                  onChange={handleChange}
                />
                <small>Hora en la que inicia la jornada</small>
              </div>

              <div className="form-group">
                <label>Hora de Fin *</label>
                <input
                  type="time"
                  name="horaFin"
                  value={form.horaFin}
                  onChange={handleChange}
                />
                <small>Hora en la que finaliza la jornada</small>
              </div>
            </div>

            <div className="form-group">
              <label>Kilómetros Recorridos *</label>
              <input
                name="km"
                value={form.km}
                onChange={handleChange}
                placeholder="Ejemplo: 450.5"
              />
              <small>Total de km recorridos</small>
            </div>

            <div className="form-group">
              <label>Origen</label>
              <input
                name="origen"
                value={form.origen}
                onChange={handleChange}
                placeholder="Ejemplo: Lima"
              />
            </div>

            <div className="form-group">
              <label>Destino</label>
              <input
                name="destino"
                value={form.destino}
                onChange={handleChange}
                placeholder="Ejemplo: Arequipa"
              />
            </div>

            <div className="form-group">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                placeholder="Ingrese cualquier observación relevante..."
              />
              <small>Incidentes, notas especiales, etc.</small>
            </div>
          </div>

          <div className="form-footer">
            <span className="error-text">
              {error || "Complete todos los campos obligatorios (*) para continuar"}
            </span>

            <div className="form-actions" style={{ marginRight: "20px" }}>
              <button className="btn-secondary" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                Registrar Jornada
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegistroJornada;