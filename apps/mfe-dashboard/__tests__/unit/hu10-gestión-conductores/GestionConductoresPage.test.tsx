import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardConductores } from "@nanutech/api-client";
import GestionConductoresPage from "../../../src/modules/gestión-conductores";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, onClick }: { children: ReactNode; onClick?: (entry: unknown) => void }) => (
    <div>
      <button type="button" data-testid="pie-activos" onClick={() => onClick?.({ key: "ACTIVO" })}>
        segmento-activos
      </button>
      {children}
    </div>
  ),
  BarChart: ({ children, onClick }: { children: ReactNode; onClick?: (entry: unknown) => void }) => (
    <div data-testid="bar-chart">
      <button
        type="button"
        data-testid="bar-descansando"
        onClick={() =>
          onClick?.({ activePayload: [{ payload: { key: "DESCANSANDO" } }] })
        }
      >
        barra-descansando
      </button>
      {children}
    </div>
  ),
  Bar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
}));

vi.mock("@nanutech/api-client", () => ({
  getDashboardConductores: vi.fn(),
}));

const backendPayload = {
  conductores: [
    {
      id: "conductor-1",
      nombre: "Carlos Ramirez",
      email: "carlos@nanutech.com",
      dni: "12345678",
      licencia: "A-IIIB-12345678",
      contacto: "+51 900111222",
      estadoContrato: "ACTIVO",
      estadoOperacional: "DISPONIBLE",
      camionAsignado: null,
      activo: true,
    },
    {
      id: "conductor-2",
      nombre: "Lucia Torres",
      email: "lucia@nanutech.com",
      dni: "87654321",
      licencia: "A-IIIA-87654321",
      contacto: "+51 900333444",
      estadoContrato: "ACTIVO",
      estadoOperacional: "EN_RUTA",
      camionAsignado: "ABC-123",
      activo: true,
    },
    {
      id: "conductor-3",
      nombre: "Mario Salas",
      email: "mario@nanutech.com",
      dni: "45678901",
      licencia: "A-IIC-45678901",
      contacto: "+51 900555666",
      estadoContrato: "ACTIVO",
      estadoOperacional: "DESCANSANDO",
      camionAsignado: null,
      activo: true,
    },
    {
      id: "conductor-4",
      nombre: "Rosa Vega",
      email: "rosa@nanutech.com",
      dni: "56781234",
      licencia: "A-IIIB-56781234",
      contacto: "+51 900777888",
      estadoContrato: "INACTIVO",
      estadoOperacional: "SIN_ASIGNAR",
      camionAsignado: null,
      activo: false,
    },
  ],
};

function renderPage(initialEntry = "/dashboard/admin/conductores") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/dashboard/admin/conductores" element={<GestionConductoresPage />} />
        <Route
          path="/dashboard/admin/conductores/:id"
          element={<div data-testid="ficha-conductor">Ficha HU20</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("HU10 - Gestion de conductores", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboardConductores).mockResolvedValue(backendPayload);
  });

  it("muestra KPIs, graficas y listado de conductores al cargar", async () => {
    renderPage();

    expect(await screen.findByText("Gestion de Conductores")).toBeInTheDocument();
    expect(screen.getByText("Total Conductores")).toBeInTheDocument();
    expect(screen.getByText("Conductores Activos")).toBeInTheDocument();
    expect(screen.getAllByText("Disponibles").length).toBeGreaterThan(0);
    expect(screen.getAllByText("En Ruta").length).toBeGreaterThan(0);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByText("Carlos Ramirez")).toBeInTheDocument();
    expect(screen.getByText("ABC-123")).toBeInTheDocument();
  });

  it("filtra por busqueda, estado y disponibilidad", async () => {
    renderPage();

    expect(await screen.findByText("Carlos Ramirez")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre, DNI o licencia..."), {
      target: { value: "87654321" },
    });

    expect(screen.getByText("Lucia Torres")).toBeInTheDocument();
    expect(screen.queryByText("Carlos Ramirez")).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre, DNI o licencia..."), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Inactivos/i }));

    expect(screen.getByText("Rosa Vega")).toBeInTheDocument();
    expect(screen.queryByText("Lucia Torres")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Todos \(4\)/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /Descansando \(1\)/i }));

    expect(screen.getByText("Mario Salas")).toBeInTheDocument();
    expect(screen.queryByText("Rosa Vega")).not.toBeInTheDocument();
  });

  it("muestra mensaje sin resultados cuando ningun conductor coincide", async () => {
    renderPage();

    await screen.findByText("Carlos Ramirez");
    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre, DNI o licencia..."), {
      target: { value: "no existe" },
    });

    expect(screen.getByText("No se encontraron conductores")).toBeInTheDocument();
  });

  it("permite drill-down desde las graficas y actualiza la tabla", async () => {
    renderPage();

    await screen.findByText("Carlos Ramirez");
    fireEvent.click(screen.getByTestId("bar-descansando"));

    expect(screen.getByText("Mario Salas")).toBeInTheDocument();
    expect(screen.queryByText("Carlos Ramirez")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("pie-activos"));

    expect(screen.getByText("Carlos Ramirez")).toBeInTheDocument();
    expect(screen.getByText("Lucia Torres")).toBeInTheDocument();
    expect(screen.queryByText("Rosa Vega")).not.toBeInTheDocument();
  });

  it("redirige a la ficha individual HU20 al hacer clic en Ver", async () => {
    renderPage();

    const row = await screen.findByText("Lucia Torres");
    const filaConductor = row.closest("tr");
    expect(filaConductor).not.toBeNull();

    fireEvent.click(within(filaConductor as HTMLTableRowElement).getByRole("button", { name: /Ver/i }));

    await waitFor(() => {
      expect(screen.getByTestId("ficha-conductor")).toBeInTheDocument();
    });
  });
});
