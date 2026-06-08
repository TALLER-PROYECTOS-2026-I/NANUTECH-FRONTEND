import { useNavigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  createJornada,
  getConductores,
  getCamiones,
  getContratosVigentes,
  getJornadas,
  type Conductor,
  type Camion,
  type Contrato,
} from "@nanutech/api-client";
import {
  ADMIN_DASHBOARD_HOME,
  adminNavItems,
  adminNavLinkClassName,
} from "../../../navigation/adminNav";

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
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);  
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
        const [conductoresRes, camionesRes, contratosRes, jornadasRes] = await Promise.all([
          getConductores(), getCamiones(), getContratosVigentes(), getJornadas(),
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
        
        const estadosBloqueantes = ["REGISTRADA", "EN_PROCESO"];
        
        const unidadesBloqueadas = new Set(
          (jornadasRes || [])
            .filter((j) => estadosBloqueantes.includes((j.estado || "").toUpperCase()))
            .map((j) => j.camion)
        );
        
        const camionesDisponiblesReales = (camionesRes || []).filter((c) => {
          const descripcion = `${c.placa || ""} - ${c.marca || ""} ${c.modelo || ""}`.trim();
          return !unidadesBloqueadas.has(descripcion);
        });
        
        setConductores(conductoresActivos);
        setCamiones(camionesDisponiblesReales);
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

  const   handleSubmit = async () => {
    setError("");
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
      const successMessage = "Jornada registrada correctamente";
      setForm({ conductor: "", camion: "", contrato: "", fecha: "", horaInicio: "", horaFin: "", km: "", origen: "", destino: "", observaciones: "" });
      navigate("../registro-jornada/nueva", { state: { successMessage } });
    } catch (err: unknown) {
      console.error("ERROR COMPLETO:", err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Error al registrar jornada");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
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

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === ADMIN_DASHBOARD_HOME}
              className={({ isActive }) =>
                adminNavLinkClassName(isActive, item.accentWhenActive)
              }
            >
              <span className="shrink-0 text-current">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        {/* Sesión + usuario */}
        <div className="px-4 py-3 border-t border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="text-slate-400">Sesión activa</span>
          </div>
          <p className="text-white text-xs font-semibold mb-3">1h 58m</p>
 
          {/* User + dropdown */}
          <div className="relative">
            {/* Dropdown popup — aparece encima del botón */}
            {menuUsuarioAbierto && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-0.5">Sesión iniciada como</p>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {(() => {
                      try {
                        const userStr = localStorage.getItem("nanutech_user");
                        return userStr ? JSON.parse(userStr).email : "admin1@nanutech.com";
                      } catch {
                        return "admin1@nanutech.com";
                      }
                    })()}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            )}
 
            {/* Botón usuario */}
            {(() => {
              let displayName = "Carlos Administr...";
              let displayRole = "Administrador Gene...";
              try {
                const userStr = localStorage.getItem("nanutech_user");
                const role = localStorage.getItem("nanutech_role");
                if (userStr) {
                  const user = JSON.parse(userStr);
                  const name = user.nombres || user.nombre || "";
                  const lastname = user.apellidos || "";
                  displayName = `${name} ${lastname}`.trim() || "Usuario";
                }
                if (role) {
                  const upperRole = role.toUpperCase();
                  if (upperRole === "ADMIN") displayRole = "Administrador General";
                  else if (upperRole === "GERENTE" || upperRole === "GERENCIAL") displayRole = "Gerente";
                  else if (upperRole === "CHOFER") displayRole = "Conductor";
                  else displayRole = role;
                }
              } catch {}
              const initialLetter = displayName.charAt(0).toUpperCase() || "U";

              return (
                <button
                  className="w-full flex items-center gap-2 rounded-lg hover:bg-slate-800 transition-colors p-1 -mx-1"
                  onClick={() => setMenuUsuarioAbierto((prev) => !prev)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initialLetter}
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-white text-xs font-semibold truncate">{displayName}</p>
                    <p className="text-slate-400 text-xs truncate">{displayRole}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 ml-auto text-slate-400 shrink-0 transition-transform ${menuUsuarioAbierto ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
              );
            })()}
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
              onClick={() => navigate("../registro-jornada/nueva")}
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
                  {camiones.length === 0 && (
                    <option value="" disabled>No hay unidades disponibles</option>
                  )}
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
                  onClick={() => navigate("../registro-jornada/nueva")}
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
