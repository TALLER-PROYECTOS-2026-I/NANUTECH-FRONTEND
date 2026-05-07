import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { crearCamionHu11, getPanelCamionesHu11 } from "@nanutech/api-client";
import type { CamionHu11, PanelCamionesHu11 } from "@nanutech/api-client";
import MonitoreoCamionesPage from "../../../src/modules/monitoreo-camiones";

// Recharts depende de medidas reales del DOM; jsdom no calcula layout como un navegador.
// Por eso reemplazamos sus componentes por versiones simples y estables para pruebas unitarias.
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
}));

// Mock del cliente API: permite controlar respuestas sin depender del backend real.
vi.mock("@nanutech/api-client", () => ({
  getPanelCamionesHu11: vi.fn(),
  crearCamionHu11: vi.fn(),
  descargarCamionesHu11Csv: vi.fn(),
}));

// Camión base reutilizable para construir datos de prueba sin repetir toda la estructura.
const baseCamion: CamionHu11 = {
  id: "unidad-001",
  placa: "ABC-123",
  marca: "Volvo",
  modelo: "FH16",
  anio: 2022,
  capacidad_ton: 28,
  estado: "EN_JORNADA",
  gps_habilitado: true,
  vin: "VINABC123",
  color: "Azul",
  tipo_combustible: "DIESEL",
  kilometraje_actual: 25495,
  fecha_registro: "2026-04-07",
  ultima_fecha_mantenimiento: "2026-03-12",
  proxima_fecha_mantenimiento: "2026-06-12",
  horas_movimiento: 47.3,
  horas_detenido: 47.3,
  horas_totales: 94.6,
  kilometros_totales: 25495,
  ultimo_gps_at: "2026-05-05T05:13:00Z",
  activo: true,
};

// Respuesta simulada del endpoint que carga el panel de monitoreo.
const panelMock: PanelCamionesHu11 = {
  resumen: {
    total_camiones: 2,
    en_uso: 1,
    disponibles: 1,
    mantenimiento: 0,
  },
  grafica_movimiento: {
    horas_movimiento: 47.3,
    horas_detenido: 47.3,
    porcentaje_movimiento: 50,
    porcentaje_detenido: 50,
  },
  camiones: [
    baseCamion,
    {
      ...baseCamion,
      id: "unidad-002",
      placa: "DEF-456",
      marca: "Scania",
      modelo: "R450",
      estado: "DISPONIBLE",
      horas_movimiento: 0,
      horas_detenido: 0,
      horas_totales: 0,
      kilometros_totales: 0,
    },
  ],
};

// Renderiza la página con MemoryRouter porque el componente usa NavLink y useNavigate.
function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/camiones"]}>
      <MonitoreoCamionesPage />
    </MemoryRouter>,
  );
}

// Suite de pruebas de la historia HU11: monitoreo y registro de camiones.
describe("HU11 - Monitoreo de camiones", () => {
  // Antes de cada test se limpian llamadas previas y se prepara la respuesta base del panel.
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPanelCamionesHu11).mockResolvedValue(panelMock);
  });

  // Comprueba que la pantalla pinte KPIs, gráfico y secciones principales.
  it("muestra los indicadores principales del panel", async () => {
    // Monta la página en el DOM de prueba.
    renderPage();

    // findByText espera la carga async del panel antes de hacer el primer assert.
    expect(await screen.findByText("Total Camiones")).toBeInTheDocument();
    // getAllByText se usa porque "En Uso" puede aparecer en menú, KPI o tarjeta.
    expect(screen.getAllByText("En Uso").length).toBeGreaterThan(0);
    expect(screen.getByText("Disponibles")).toBeInTheDocument();
    expect(screen.getAllByText("Mantenimiento").length).toBeGreaterThan(0);
    expect(screen.getByText("Comparativa de Horas: Movimiento vs Detenido")).toBeInTheDocument();
    // Valida que el gráfico mockeado se haya renderizado.
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  // Comprueba que búsqueda y filtro de estado modifiquen la grilla visible.
  it("filtra el grid por placa y estado inmediatamente", async () => {
    // Monta la página.
    renderPage();

    // Espera ambos camiones iniciales del mock.
    expect(await screen.findByText("ABC-123")).toBeInTheDocument();
    expect(screen.getByText("DEF-456")).toBeInTheDocument();

    // Escribe una placa parcial para filtrar por búsqueda.
    fireEvent.change(screen.getByPlaceholderText("Buscar por placa o marca..."), {
      target: { value: "ABC" },
    });

    // ABC debe seguir visible y DEF debe desaparecer.
    expect(screen.getByText("ABC-123")).toBeInTheDocument();
    expect(screen.queryByText("DEF-456")).not.toBeInTheDocument();

    // Cambia el filtro a DISPONIBLE; ABC está EN_JORNADA, así que deja de mostrarse.
    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "DISPONIBLE" },
    });

    expect(screen.queryByText("ABC-123")).not.toBeInTheDocument();
  });

  // Comprueba el flujo del modal: abrir, llenar, enviar y mostrar confirmación.
  it("registra un camión disponible y muestra confirmación", async () => {
    // Camión que será devuelto por el mock de creación.
    const nuevoCamion: CamionHu11 = {
      ...baseCamion,
      id: "unidad-003",
      placa: "GHI-789",
      marca: "Mercedes-Benz",
      modelo: "Actros",
      estado: "DISPONIBLE",
      horas_movimiento: 0,
      horas_detenido: 0,
      horas_totales: 0,
      kilometros_totales: 0,
      kilometraje_actual: 0,
    };

    // Simula que la API crea el camión correctamente.
    vi.mocked(crearCamionHu11).mockResolvedValue({
      ...nuevoCamion,
      confirmacion: {
        message: "¡Camión registrado con éxito!",
        placa: "GHI-789",
        modelo: "Actros",
      },
    });

    // Monta la página y espera que cargue la flota inicial.
    renderPage();
    await screen.findByText("ABC-123");

    // Abre el modal de registro desde el botón de la pantalla.
    const openButton = screen.getByText("Registrar Camión").closest("button");
    expect(openButton).not.toBeNull();
    fireEvent.click(openButton as HTMLButtonElement);

    // Ubica el formulario por su título para trabajar dentro de ese contexto.
    const modal = screen.getByRole("heading", { name: "Registrar Nuevo Camión" }).closest("form");
    expect(modal).not.toBeNull();

    // within evita que las búsquedas tomen elementos fuera del modal.
    const form = within(modal as HTMLFormElement);
    // Completa campos requeridos por las validaciones del componente.
    fireEvent.change(form.getByLabelText("Placa *"), { target: { value: "GHI-789" } });
    fireEvent.change(form.getByLabelText("Marca *"), { target: { value: "Mercedes-Benz" } });
    fireEvent.change(form.getByLabelText("Modelo *"), { target: { value: "Actros" } });
    fireEvent.change(form.getByLabelText("Capacidad (toneladas) *"), { target: { value: "26" } });
    fireEvent.change(form.getByLabelText("VIN *"), { target: { value: "VINGHI789" } });
    fireEvent.change(form.getByLabelText("Color *"), { target: { value: "Azul" } });
    // Envía el formulario desde el botón submit.
    fireEvent.click(form.getByRole("button", { name: "Registrar Camión" }));

    // Espera el toast porque aparece después de una operación async.
    await waitFor(() => {
      expect(screen.getByText("¡Camión registrado con éxito!")).toBeInTheDocument();
    });

    // Verifica que el toast muestre los datos del nuevo camión.
    expect(screen.getByText("GHI-789 · Actros fue agregado al sistema.")).toBeInTheDocument();
  });
});
