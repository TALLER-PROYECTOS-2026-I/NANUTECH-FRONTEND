import { useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.css";
import { createJornada } from "../../../../packages/api-client/src/services/registrojornada/jornadas";

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

  // 🔥 HORA DINÁMICA
  const [horaActual, setHoraActual] = useState("");

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

  // 🔥 STATE MOCK
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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

 const handleChange = (e: any) => {
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
      setError("Complete todos los campos obligatorios");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
  if (!validar()) return;

  try {
    const payload = {
      conductor: form.conductor,
      camion: form.camion,
      contrato: form.contrato,
      fecha: form.fecha,
      horaInicio: form.horaInicio,
      horaFin: form.horaFin,
      km: Number(form.km),
      origen: form.origen,
      destino: form.destino,
      observaciones: form.observaciones || "",
      estado: "Activa",
      observacionesFlag: form.observaciones ? true : false,
       horario: `${form.horaInicio} - ${form.horaFin}`,
    };

    await createJornada(payload);

    setSuccess("Jornada registrada correctamente 🚀");

    console.log("GUARDADO EN API:", payload);

    // limpiar form (NO cambia diseño)
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

    // ir al listado
    navigate("/RegistroNuevaJornada");

  } catch (error) {
    console.error(error);
    setError("Error al registrar jornada");
  }
};

  return (
    <div className="dashboard-layout registro-jornada">
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

          <NavLink to="/RegistroJornada" className="sidebar-link active">
            🕒 Registro Jornadas
          </NavLink>
        </nav>

        <button className="sidebar-logout" onClick={() => navigate("/")}>
          🚪 Cerrar Sesión
        </button>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        {/* HEADER */}
        <div className="header-row">
          <div>
            <h2 style={{ margin: 0 }}>Registro Jornadas</h2>
            <span className="subtitle">{fechaActual}</span>
          </div>

          <div className="last-update">
            Última actualización<br />
            <strong>{horaActual}</strong>
          </div>
        </div>

        {/* VOLVER */}
        <div className="volver" onClick={() => navigate(-1)}>
          ← Volver
        </div>

        {/* TITLE */}
        <h1 className="dashboard-title">
          Registrar Nueva Jornada Laboral
        </h1>

        <p className="form-subtitle">
          Complete todos los campos requeridos para registrar la jornada
        </p>

        {/* ALERT */}
        <div className="alert-box">
          <strong>Los campos marcados con *</strong><br />
          son obligatorios. Asegúrese de completar toda la información antes de guardar la jornada.
        </div>

        <div className="chart-card">

          {/* MENSAJES */}
          {error && <div className="error-text">{error}</div>}
          {success && <div style={{ color: "green" }}>{success}</div>}

          {/* INFO */}
          <h3 className="chart-title">Información de la Jornada</h3>

          <div className="form-vertical">
            <div className="form-group">
              <label>Conductor *</label>
              <input
                name="conductor"
                value={form.conductor}
                onChange={handleChange}
                placeholder="Seleccione un conductor activo"
              />
              <small>Seleccione el conductor responsable de realizar la jornada laboral</small>
            </div>

            <div className="form-group">
              <label>Unidad de Transporte (Placa/Modelo) *</label>
              <input
                name="camion"
                value={form.camion}
                onChange={handleChange}
                placeholder="Seleccione un camión disponible"
              />
              <small>Solo se muestran camiones que NO están asignados a jornadas activas</small>
            </div>

            <div className="form-group">
              <label>Contrato Comercial Vigente *</label>
              <input
                name="contrato"
                value={form.contrato}
                onChange={handleChange}
                placeholder="Seleccione un contrato activo"
              />
              <small>Seleccione el contrato comercial bajo el cual se realizará la jornada</small>
            </div>
          </div>

          {/* DETALLES */}
          <h3 className="form-group mt-20">Detalles de la Jornada</h3>

          <div className="form-vertical">

            <div className="form-group">
              <label>Fecha</label>
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

          {/* FOOTER */}
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