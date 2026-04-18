import { useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
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
  { label: "Dashboard Admin", path: "/dashboard", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  )},
  { label: "Alertas y Emergencias", path: "/alertas", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  )},
  { label: "Camiones", path: "/camiones", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  )},
  { label: "Conductores", path: "/conductores", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
  { label: "GPS", path: "/gps", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
  )},
  { label: "Tracking GPS", path: "/tracking", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
  )},
  { label: "Registro Jornadas", path: "/RegistroNuevaJornada", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )},
  { label: "Auditoría", path: "/auditoria", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  )},
];

// Shared label/input styles
const labelCls = "block text-sm font-semibold text-gray-700 mb-1";
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none";
const selectCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none";
const smallCls = "text-xs text-gray-400 mt-1";

function RegistroJornada() {
  const navigate = useNavigate();

  const fechaActual = new Date().toLocaleDateString("es-PE", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const [horaActual, setHoraActual] = useState("");

  const [form, setForm] = useState({
    conductor: "", camion: "", contrato: "", fecha: "",
    horaInicio: "", horaFin: "", km: "", origen: "", destino: "", observaciones: "",
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
      setHoraActual(ahora.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true }));
    };
    actualizarHora();
    const intervalo = setInterval(actualizarHora, 1000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [conductoresRes, camionesRes, contratosRes] = await Promise.all([
          getConductores(), getCamiones(), getContratosVigentes(),
        ]);
        const conductoresActivos = (conductoresRes || []).filter(
          (c) => (c.estado || "").toUpperCase() === "ACTIVO" || c.activo === true
        );
        const contratosVigentes = (contratosRes || []).filter(
          (c) => (c.estado || "").toUpperCase() === "VIGENTE" || (c.estado || "").toUpperCase() === "ACTIVO" || c.activo === true
        );
        setConductores(conductoresActivos);
        setCamiones(camionesRes || []);
        setContratos(contratosVigentes);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
        setConductores([]); setCamiones([]); setContratos([]);
      } finally {
        setLoadingCatalogos(false);
      }
    };
    cargarCatalogos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validar = () => {
    if (!form.conductor || !form.camion || !form.contrato || !form.fecha || !form.horaInicio || !form.horaFin || !form.km) {
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
    setError(""); setSuccess("");
    if (!validar()) return;

    const usuarioGuardado = localStorage.getItem("nanutech_user");
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    if (!usuario?.id) { setError("No se pudo identificar el usuario que registra la jornada"); return; }

    try {
      const payload = {
        conductor_id: form.conductor, unidad_id: form.camion, contrato_id: form.contrato,
        creado_por: usuario.id, fecha: form.fecha, hora_inicio: form.horaInicio,
        hora_fin: form.horaFin, km_recorridos: Number(form.km), origen: form.origen,
        destino: form.destino, observaciones: form.observaciones || "",
      };
      console.log("PAYLOAD ENVIADO:", payload);
      await createJornada(payload);
      setSuccess("Jornada registrada correctamente 🚀");
      setForm({ conductor: "", camion: "", contrato: "", fecha: "", horaInicio: "", horaFin: "", km: "", origen: "", destino: "", observaciones: "" });
      setTimeout(() => navigate("/RegistroNuevaJornada"), 800);
    } catch (err: any) {
      console.error("ERROR COMPLETO:", err);
      setError(err?.response?.data?.message || "Error al registrar jornada");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* ── SIDEBAR ── */}
      <aside className="w-52 shrink-0 bg-slate-900 flex flex-col min-h-screen fixed top-0 left-0 h-full z-20">
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">NANU TECH</p>
            <p className="text-slate-400 text-xs">Gestión de Flota</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-blue-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Sesión activa</span>
          </div>
          <p className="text-white text-xs font-semibold mb-3">1h 57m</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Carlos Administr...</p>
              <p className="text-slate-400 text-xs truncate">Administrador Gene...</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="ml-52 flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-start justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Registro Jornadas</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Última actualización</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">

          {/* Page header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Registro de Jornadas Laborales</h2>
              <p className="text-sm text-gray-500 mt-0.5">Gestión y seguimiento de jornadas de trabajo</p>
            </div>
          </div>

          

          {/* Formulario card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">

            {/* Volver */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Volver
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Registrar Nueva Jornada Laboral</h2>
            <p className="text-sm text-gray-500 mb-4">Complete todos los campos requeridos para registrar la jornada</p>

            {/* Alerta info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 flex gap-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p className="text-sm text-blue-700">
                <strong>Los campos marcados con *</strong> son obligatorios. Asegúrese de completar toda la información antes de guardar la jornada.
              </p>
            </div>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
            {success && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</div>}

            {/* Sección 1 */}
            <h3 className="text-base font-bold text-gray-800 mb-4">Información de la Jornada</h3>
            <div className="flex flex-col gap-4 mb-6">

              <div>
                <label className={labelCls}>Conductor *</label>
                <select name="conductor" value={form.conductor} onChange={handleChange} disabled={loadingCatalogos} className={selectCls}>
                  <option value="">Seleccione un conductor activo</option>
                  {conductores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {`${c.nombres || ""} ${c.apellidos || ""}`.trim() || c.correo || c.id}
                    </option>
                  ))}
                </select>
                <p className={smallCls}>Seleccione el conductor responsable de realizar la jornada laboral</p>
              </div>

              <div>
                <label className={labelCls}>Unidad de Transporte (Placa/Modelo) *</label>
                <select name="camion" value={form.camion} onChange={handleChange} disabled={loadingCatalogos} className={selectCls}>
                  <option value="">Seleccione un camión disponible</option>
                  {camiones.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.placa ? `${c.placa} - ${c.marca || ""} ${c.modelo || ""}`.trim() : c.id}
                    </option>
                  ))}
                </select>
                <p className={smallCls}>Solo se muestran camiones disponibles</p>
              </div>

              <div>
                <label className={labelCls}>Contrato Comercial Vigente *</label>
                <select name="contrato" value={form.contrato} onChange={handleChange} disabled={loadingCatalogos} className={selectCls}>
                  <option value="">Seleccione un contrato activo</option>
                  {contratos.map((c) => (
                    <option key={c.id} value={c.id}>{c.codigo || c.id}</option>
                  ))}
                </select>
                <p className={smallCls}>Seleccione el contrato comercial bajo el cual se realizará la jornada</p>
              </div>
            </div>

            {/* Sección 2 */}
            <h3 className="text-base font-bold text-gray-800 mb-4">Detalles de la Jornada</h3>
            <div className="flex flex-col gap-4">

              <div>
                <label className={labelCls}>Fecha *</label>
                <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Hora de Inicio *</label>
                  <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} className={inputCls} />
                  <p className={smallCls}>Hora en la que inicia la jornada</p>
                </div>
                <div>
                  <label className={labelCls}>Hora de Fin *</label>
                  <input type="time" name="horaFin" value={form.horaFin} onChange={handleChange} className={inputCls} />
                  <p className={smallCls}>Hora en la que finaliza la jornada</p>
                </div>
              </div>

              <div>
                <label className={labelCls}>Kilómetros Recorridos *</label>
                <input name="km" value={form.km} onChange={handleChange} placeholder="Ejemplo: 450.5" className={inputCls} />
                <p className={smallCls}>Total de km recorridos</p>
              </div>

              <div>
                <label className={labelCls}>Origen</label>
                <input name="origen" value={form.origen} onChange={handleChange} placeholder="Ejemplo: Lima" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Destino</label>
                <input name="destino" value={form.destino} onChange={handleChange} placeholder="Ejemplo: Arequipa" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Observaciones</label>
                <textarea
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ingrese cualquier observación relevante..."
                  className={`${inputCls} resize-none`}
                />
                <p className={smallCls}>Incidentes, notas especiales, etc.</p>
              </div>
            </div>

            {/* Footer form */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
              <p className="text-sm text-red-500">{error || "Complete todos los campos obligatorios (*) para continuar"}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Registrar Jornada
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
          © 2026 NANU TECH · Sistema de Gestión de Flota de Camiones
        </footer>
      </div>
    </div>
  );
}

export default RegistroJornada;