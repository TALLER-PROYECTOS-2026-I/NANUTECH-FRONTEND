import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  crearCamionHu11,
  descargarCamionesHu11Csv,
  getPanelCamionesHu11,
  type CamionHu11,
  type CrearCamionHu11Payload,
  type PanelCamionesHu11,
} from "@nanutech/api-client";
import { FleetFilters } from "./components/FleetFilters";
import { FleetGrid } from "./components/FleetGrid";
import { KpiCard } from "./components/KpiCard";
import { MonitoreoSidebar } from "./components/MonitoreoSidebar";
import { MovementChart } from "./components/MovementChart";
import { RegistrationModal } from "./components/RegistrationModal";
import { RegistrationToast } from "./components/RegistrationToast";
import { initialForm, initialPanel } from "./mocks/initialState";
import type { FormState } from "./types";
import { buildCsv, downloadCsv } from "./utils/csv";
import { crearPanelDesdeCamiones } from "./utils/panel";

function MonitoreoCamionesPage() {
  // Permite navegar programáticamente a otras rutas del dashboard.
  const navigate = useNavigate();
  // Guarda el panel completo: resumen, gráfica y lista de camiones.
  const [panel, setPanel] = useState<PanelCamionesHu11>(initialPanel);
  // Controla si todavía se está cargando información desde la API.
  const [loading, setLoading] = useState(true);
  // Texto escrito en el buscador por placa o marca.
  const [search, setSearch] = useState("");
  // Estado seleccionado en el filtro de camiones.
  const [estado, setEstado] = useState("TODOS");
  // Hora visible en el encabezado.
  const [horaActual, setHoraActual] = useState("");
  // Fecha visible en el encabezado.
  const [fechaActual, setFechaActual] = useState("");
  // Abre o cierra el modal de registro.
  const [modalOpen, setModalOpen] = useState(false);
  // Guarda los valores actuales del formulario.
  const [form, setForm] = useState<FormState>(initialForm);
  // Mensaje de error del formulario.
  const [formError, setFormError] = useState("");
  // Datos del mensaje de éxito temporal.
  const [toast, setToast] = useState<{ placa: string; modelo: string } | null>(null);

  // Mantiene actualizadas la fecha y la hora que se muestran en pantalla.
  useEffect(() => {
    const actualizar = () => {
      const ahora = new Date();
      setHoraActual(
        ahora.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
      setFechaActual(
        ahora.toLocaleDateString("es-PE", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    };

    actualizar();
    const interval = window.setInterval(actualizar, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Carga el panel real desde el backend; si falla, deja los datos mock.
  useEffect(() => {
    let mounted = true;

    getPanelCamionesHu11()
      .then((data) => {
        if (mounted) setPanel(data);
      })
      .catch(() => {
        if (mounted) setPanel(initialPanel);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Filtra camiones cuando cambia el buscador, el estado o la lista original.
  const filteredCamiones = useMemo(() => {
    const normalizedSearch = search.trim().toUpperCase();

    return panel.camiones.filter((camion) => {
      const matchesSearch =
        !normalizedSearch ||
        camion.placa.toUpperCase().includes(normalizedSearch) ||
        camion.marca.toUpperCase().includes(normalizedSearch);
      const matchesEstado = estado === "TODOS" || camion.estado === estado;

      return matchesSearch && matchesEstado;
    });
  }, [estado, panel.camiones, search]);

  // Recalcula KPIs y porcentajes usando solo los camiones filtrados.
  const filteredPanel = useMemo(() => crearPanelDesdeCamiones(filteredCamiones), [filteredCamiones]);

  // Adapta la lista filtrada al formato esperado por Recharts.
  const chartData = filteredCamiones.map((camion) => ({
    placa: camion.placa,
    movimiento: camion.horas_movimiento,
    detenido: camion.horas_detenido,
  }));

  // Actualiza un campo específico del formulario sin perder los demás.
  const handleFormChange = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  // Registra un camión al enviar el formulario.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const payload: CrearCamionHu11Payload = {
      id: form.id.trim() || undefined,
      placa: form.placa.trim().toUpperCase(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      anio: Number(form.anio),
      capacidad_ton: Number(form.capacidad_ton),
      vin: form.vin.trim().toUpperCase(),
      color: form.color.trim(),
      combustible: form.combustible,
      gps: form.gps,
      fecha_registro: form.fecha_registro,
      kilometraje_actual: Number(form.kilometraje_actual || 0),
      notas: form.notas.trim() || undefined,
    };

    if (!payload.placa || !payload.marca || !payload.modelo || !payload.vin || !payload.color) {
      setFormError("Completa los campos obligatorios antes de registrar.");
      return;
    }

    if (!payload.anio || !payload.capacidad_ton || payload.capacidad_ton <= 0) {
      setFormError("Ingresa un año y una capacidad válidos.");
      return;
    }

    if (panel.camiones.some((camion) => camion.placa.toUpperCase() === payload.placa)) {
      setFormError("Ya existe un camión con esta placa.");
      return;
    }

    try {
      const creado = await crearCamionHu11(payload);
      setPanel((current) => crearPanelDesdeCamiones([...current.camiones, creado]));
    } catch {
      const nuevoCamion: CamionHu11 = {
        id: payload.id || `unidad-local-${Date.now()}`,
        placa: payload.placa,
        marca: payload.marca,
        modelo: payload.modelo,
        anio: payload.anio,
        capacidad_ton: payload.capacidad_ton,
        estado: "DISPONIBLE",
        gps_habilitado: payload.gps,
        vin: payload.vin,
        color: payload.color,
        tipo_combustible: payload.combustible,
        kilometraje_actual: payload.kilometraje_actual || 0,
        fecha_registro: payload.fecha_registro || new Date().toISOString().slice(0, 10),
        ultima_fecha_mantenimiento: null,
        proxima_fecha_mantenimiento: null,
        horas_movimiento: 0,
        horas_detenido: 0,
        horas_totales: 0,
        kilometros_totales: payload.kilometraje_actual || 0,
        ultimo_gps_at: null,
        activo: true,
      };

      setPanel((current) => crearPanelDesdeCamiones([...current.camiones, nuevoCamion]));
    }

    setToast({ placa: payload.placa, modelo: payload.modelo });
    setModalOpen(false);
    setForm(initialForm);
    window.setTimeout(() => setToast(null), 4200);
  };

  // Descarga el CSV desde backend o lo genera localmente si la API falla.
  const handleDownloadCsv = async () => {
    try {
      const csv = await descargarCamionesHu11Csv({
        placa: search || undefined,
        estado: estado === "TODOS" ? undefined : estado,
      });
      downloadCsv(csv);
    } catch {
      downloadCsv(buildCsv(filteredCamiones));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <MonitoreoSidebar />

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Camiones</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Última actualización</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          {loading ? (
            <div className="rounded-lg bg-white p-6 text-sm text-slate-500">Cargando panel de camiones...</div>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard label="Total Camiones" value={panel.resumen.total_camiones} tone="blue" icon="truck" />
                <KpiCard label="En Uso" value={panel.resumen.en_uso} tone="green" icon="route" />
                <KpiCard label="Disponibles" value={panel.resumen.disponibles} tone="blue" icon="pin" />
                <KpiCard label="Mantenimiento" value={panel.resumen.mantenimiento} tone="orange" icon="alert" />
              </section>

              <FleetFilters
                search={search}
                estado={estado}
                onSearchChange={setSearch}
                onEstadoChange={setEstado}
                onOpenRegister={() => setModalOpen(true)}
                onDownloadCsv={handleDownloadCsv}
              />
              <MovementChart chartData={chartData} filteredPanel={filteredPanel} />
              <FleetGrid
                camiones={filteredCamiones}
                totalCamiones={panel.camiones.length}
                onDetail={(camionId) => navigate(`/camiones/${camionId}/configuracion`)}
              />
            </>
          )}
        </main>

        <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
          © 2026 NANU TECH · Sistema de Gestión de Flota de Camiones
        </footer>
      </div>

      {modalOpen && (
        <RegistrationModal
          form={form}
          error={formError}
          onChange={handleFormChange}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {toast && <RegistrationToast placa={toast.placa} modelo={toast.modelo} />}
    </div>
  );
}

export default MonitoreoCamionesPage;
