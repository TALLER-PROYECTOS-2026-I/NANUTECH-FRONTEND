import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "../../../src/modules/dashboard-admin/pages/Dashboard";
import { getCamiones, getDashboard } from "@nanutech/api-client";

// Simula Recharts para validar la informacion visible sin depender del motor SVG en Vitest.
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, data }: { children: ReactNode; data: Array<{ name: string; value: number }> }) => (
    <div>
      {data.map((item) => (
        <span key={item.name}>{`${item.name}: ${item.value}%`}</span>
      ))}
      {children}
    </div>
  ),
  BarChart: ({ children, data }: { children: ReactNode; data: Array<{ name: string }> }) => (
    <div data-testid="bar-chart">
      {data.map((item) => (
        <span key={item.name}>{item.name}</span>
      ))}
      {children}
    </div>
  ),
  Bar: () => <div />,
  CartesianGrid: () => <div />,
  Cell: () => <div />,
  Legend: () => <div />,
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
}));

// Simula el paquete compartido para probar solo la integracion visual de HU12.
vi.mock("@nanutech/api-client", () => ({
  getCamiones: vi.fn(),
  getDashboard: vi.fn(),
}));

// Datos equivalentes al contrato del backend /dashboard para el dashboard ejecutivo.
const dashboardPayload = {
  kpis: {
    totalCamiones: 13,
    contratosActivos: 12,
    alertasActivas: 1,
    ingresos: 12500,
    jornadasCompletadas: 22,
    jornadasActivas: 6,
    horasTotales: 145.5,
    kilometrosTotales: 29159,
  },
  alertas: {
    alertasActivas: [
      {
        id: "gps-1",
        tipo: "EXCESO_VELOCIDAD",
        estado: "ACTIVA",
        severidad: "CRITICA",
        placa: "ABC-123",
        velocidad_kmh: 103,
      },
    ],
    contratosPorExpirar: [
      {
        id: "CONT-2024-001",
        cliente: "Distribuidora San Miguel SAC",
        tarifa: 25,
        fecha_fin: "2026-06-20",
      },
    ],
  },
  graficas: {
    gps: [
      { estado: "EN_RUTA", total: 7, porcentaje: 70 },
      { estado: "DETENIDO", total: 1, porcentaje: 10 },
      { estado: "EXCESO_VELOCIDAD", total: 1, porcentaje: 10 },
    ],
    camiones: [
      { estado: "EN_USO", total: 7, porcentaje: 54 },
      { estado: "DISPONIBLE", total: 4, porcentaje: 31 },
      { estado: "MANTENIMIENTO", total: 2, porcentaje: 15 },
      { estado: "INACTIVO", total: 0, porcentaje: 0 },
    ],
  },
  topCamiones: [
    { unidad: "cam-1", placa: "ABC-123", modelo: "Volvo FH16", kilometros: 25495, horas: 120 },
    { unidad: "cam-2", placa: "DEF-456", modelo: "Scania R450", kilometros: 18310, horas: 90 },
  ],
  detalleCamiones: [
    {
      unidad: "cam-1",
      placa: "ABC-123",
      modelo: "Volvo FH16",
      estado: "EN_USO",
      jornadas: 8,
      horas: 120,
      kilometros: 25495,
      eficiencia: 212.46,
    },
  ],
  contratos: [
    {
      id: "CONT-2024-001",
      cliente: "Distribuidora San Miguel SAC",
      tarifa: 25,
      fecha_fin: "2026-06-20",
      camionesAsignados: 2,
    },
  ],
};

// Unidades usadas como respaldo cuando el backend no envia detalleCamiones.
const camionesPayload = [
  {
    id: "cam-1",
    placa: "ABC-123",
    marca: "Volvo",
    modelo: "FH16",
    estado: "EN_USO",
  },
];

// Renderiza la HU12 dentro de Router para probar botones que navegan a otros modulos.
function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={["/dashboard/admin/dashboard"]}>
      <Routes>
        <Route path="/dashboard/admin/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/admin/gps" element={<div>Modulo Integracion GPS</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("HU12 - Dashboard Admin", () => {
  beforeEach(() => {
    // Reinicia los mocks para que cada caso valide una carga limpia.
    vi.clearAllMocks();
    vi.mocked(getCamiones).mockResolvedValue(camionesPayload);
    vi.mocked(getDashboard).mockResolvedValue(dashboardPayload);
    window.scrollTo = vi.fn();
    Object.defineProperty(window, "location", {
      value: { assign: vi.fn() },
      writable: true,
    });
  });

  it("muestra KPIs, resumen operativo, alertas y datos inferiores del dashboard", async () => {
    renderDashboard();

    // Valida que la pantalla principal carga los datos reales del payload simulado.
    expect(await screen.findByText("Dashboard Ejecutivo")).toBeInTheDocument();
    expect(screen.getByText("Total Camiones")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.getByText("Contratos Activos")).toBeInTheDocument();
    expect(screen.getByText("S/. 12,500")).toBeInTheDocument();
    expect(screen.getByText("Jornadas Completadas")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText("Horas Totales")).toBeInTheDocument();
    expect(screen.getByText("145.5h")).toBeInTheDocument();

    // Valida centro de alertas y graficas circular/barra con los segmentos esperados.
    expect(screen.getByText("Exceso de Velocidad")).toBeInTheDocument();
    expect(screen.getByText("Contratos por Expirar")).toBeInTheDocument();
    expect(screen.getByText("En Ruta: 70%")).toBeInTheDocument();
    expect(screen.getByText("Disponible: 31%")).toBeInTheDocument();
    expect(screen.getAllByText("ABC-123").length).toBeGreaterThan(0);

    // Valida tabla de camiones y resumen de contratos activos.
    expect(screen.getByText("Estadisticas Detalladas por Camion")).toBeInTheDocument();
    expect(screen.getByText("Volvo FH16")).toBeInTheDocument();
    expect(screen.getByText("Resumen de Contratos Activos")).toBeInTheDocument();
    expect(screen.getByText("Distribuidora San Miguel SAC")).toBeInTheDocument();
  });

  it("redirige desde los botones de alertas a los modulos correspondientes", async () => {
    const { unmount } = renderDashboard();

    // Espera la carga antes de disparar acciones de navegacion.
    expect(await screen.findByText("Dashboard Ejecutivo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver GPS" }));
    expect(await screen.findByText("Modulo Integracion GPS")).toBeInTheDocument();

    // Vuelve a montar el dashboard para probar el segundo boton sin conservar la ruta anterior.
    unmount();
    renderDashboard();
    expect(await screen.findByText("Dashboard Ejecutivo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ver Contratos" }));
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: expect.any(Number),
      behavior: "smooth",
    });
  });
});
