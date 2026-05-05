import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MonitoreoCamionesPage from "../../../src/modules/monitoreo-camiones";
import { crearCamionHu11, getPanelCamionesHu11 } from "@nanutech/api-client";
import type { CamionHu11, PanelCamionesHu11 } from "@nanutech/api-client";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
}));

vi.mock("@nanutech/api-client", () => ({
  getPanelCamionesHu11: vi.fn(),
  crearCamionHu11: vi.fn(),
  descargarCamionesHu11Csv: vi.fn(),
}));

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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/camiones"]}>
      <MonitoreoCamionesPage />
    </MemoryRouter>,
  );
}

describe("HU11 - Monitoreo de camiones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPanelCamionesHu11).mockResolvedValue(panelMock);
  });

  it("muestra los indicadores principales del panel", async () => {
    renderPage();

    expect(await screen.findByText("Total Camiones")).toBeInTheDocument();
    expect(screen.getAllByText("En Uso").length).toBeGreaterThan(0);
    expect(screen.getByText("Disponibles")).toBeInTheDocument();
    expect(screen.getAllByText("Mantenimiento").length).toBeGreaterThan(0);
    expect(screen.getByText("Comparativa de Horas: Movimiento vs Detenido")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("filtra el grid por placa y estado inmediatamente", async () => {
    renderPage();

    expect(await screen.findByText("ABC-123")).toBeInTheDocument();
    expect(screen.getByText("DEF-456")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Buscar por placa o marca..."), {
      target: { value: "ABC" },
    });

    expect(screen.getByText("ABC-123")).toBeInTheDocument();
    expect(screen.queryByText("DEF-456")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "DISPONIBLE" },
    });

    expect(screen.queryByText("ABC-123")).not.toBeInTheDocument();
  });

  it("registra un camion disponible y muestra confirmacion", async () => {
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

    vi.mocked(crearCamionHu11).mockResolvedValue({
      ...nuevoCamion,
      confirmacion: {
        message: "¡Camión registrado con éxito!",
        placa: "GHI-789",
        modelo: "Actros",
      },
    });

    renderPage();

    await screen.findByText("ABC-123");
    const openButton = screen.getByText("Registrar Camion").closest("button");
    expect(openButton).not.toBeNull();
    fireEvent.click(openButton as HTMLButtonElement);

    const modal = screen.getByRole("heading", { name: "Registrar Nuevo Camion" }).closest("form");
    expect(modal).not.toBeNull();

    const form = within(modal as HTMLFormElement);
    fireEvent.change(form.getByLabelText("Placa *"), { target: { value: "GHI-789" } });
    fireEvent.change(form.getByLabelText("Marca *"), { target: { value: "Mercedes-Benz" } });
    fireEvent.change(form.getByLabelText("Modelo *"), { target: { value: "Actros" } });
    fireEvent.change(form.getByLabelText("Capacidad (toneladas) *"), { target: { value: "26" } });
    fireEvent.change(form.getByLabelText("VIN *"), { target: { value: "VINGHI789" } });
    fireEvent.change(form.getByLabelText("Color *"), { target: { value: "Azul" } });
    fireEvent.click(form.getByRole("button", { name: "Registrar Camion" }));

    await waitFor(() => {
      expect(screen.getByText("¡Camión registrado con éxito!")).toBeInTheDocument();
    });

    expect(screen.getByText("GHI-789 · Actros fue agregado al sistema.")).toBeInTheDocument();
  });
});
