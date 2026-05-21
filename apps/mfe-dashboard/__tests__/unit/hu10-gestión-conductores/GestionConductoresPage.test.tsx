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

const conductoresBackend = [
  {
    id: "conductor-1",
    nombre: "Carlos Ramirez",
    licencia: "A-IIIB-12345678",
    estadoOperacional: "DISPONIBLE",
    camionAsignado: "Sin asignar",
    estado: "ACTIVO",
  },
  {
    id: "conductor-2",
    nombre: "Lucia Torres",
    licencia: "A-IIIA-87654321",
    estadoOperacional: "EN_RUTA",
    camionAsignado: "ABC-123",
    estado: "ACTIVO",
  },
  {
    id: "conductor-3",
    nombre: "Mario Salas",
    licencia: "A-IIC-45678901",
    estadoOperacional: "DESCANSANDO",
    camionAsignado: "Sin asignar",
    estado: "ACTIVO",
  },
  {
    id: "conductor-4",
    nombre: "Rosa Vega",
    licencia: "A-IIIB-56781234",
    estadoOperacional: "SIN_ASIGNAR",
    camionAsignado: "Sin asignar",
    estado: "INACTIVO",
  },
];

const backendPayload = {
  indicadores: {
    total_conductores: 4,
    conductores_activos: 3,
    disponibles: 1,
    en_ruta: 1,
  },
  graficos: {
    distribucionContrato: [
      { estado: "ACTIVOS", cantidad: 3 },
      { estado: "INACTIVOS", cantidad: 1 },
    ],
    estadoOperacional: [
      { estado: "DISPONIBLE", cantidad: 1 },
      { estado: "EN_RUTA", cantidad: 1 },
      { estado: "DESCANSANDO", cantidad: 1 },
      { estado: "DE_PERMISO", cantidad: 0 },
    ],
  },
  conductores: [
    ...conductoresBackend,
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
    vi.mocked(getDashboardConductores).mockImplementation(async (filters = {}) => {
      let conductores = [...conductoresBackend];

      if (filters.busqueda) {
        const search = filters.busqueda.toLowerCase();
        conductores = conductores.filter(
          (conductor) =>
            conductor.nombre.toLowerCase().includes(search) ||
            conductor.licencia.toLowerCase().includes(search),
        );
      }

      if (filters.estado && filters.estado !== "TODOS") {
        conductores = conductores.filter((conductor) =>
          filters.estado === "ACTIVOS"
            ? conductor.estado === "ACTIVO"
            : conductor.estado === "INACTIVO",
        );
      }

      if (filters.disponibilidad && filters.disponibilidad !== "TODOS") {
        conductores = conductores.filter(
          (conductor) => conductor.estadoOperacional === filters.disponibilidad,
        );
      }

      return {
        ...backendPayload,
        conductores,
      };
    });
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
      target: { value: "Lucia" },
    });

    expect(await screen.findByText("Lucia Torres")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Carlos Ramirez")).not.toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre, DNI o licencia..."), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Inactivos/i }));

    expect(await screen.findByText("Rosa Vega")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Lucia Torres")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button", { name: /Todos/i })[0]);
    fireEvent.click(await screen.findByRole("button", { name: /Descansando \(1\)/i }));

    expect(await screen.findByText("Mario Salas")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Rosa Vega")).not.toBeInTheDocument();
    });
  });

  it("muestra mensaje sin resultados cuando ningun conductor coincide", async () => {
    renderPage();

    await screen.findByText("Carlos Ramirez");
    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre, DNI o licencia..."), {
      target: { value: "no existe" },
    });

    expect(await screen.findByText("No se encontraron conductores")).toBeInTheDocument();
  });

  it("permite drill-down desde las graficas y actualiza la tabla", async () => {
    renderPage();

    await screen.findByText("Carlos Ramirez");
    fireEvent.click(screen.getByTestId("bar-descansando"));

    expect(await screen.findByText("Mario Salas")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Carlos Ramirez")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("pie-activos"));

    expect(await screen.findByText("Carlos Ramirez")).toBeInTheDocument();
    expect(screen.getByText("Lucia Torres")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Rosa Vega")).not.toBeInTheDocument();
    });
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
