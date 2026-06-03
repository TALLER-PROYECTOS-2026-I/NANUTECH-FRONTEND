import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardConductores } from "@nanutech/api-client";
import GestionConductoresPage from "../../../src/modules/gestión-conductores";

// ── Mock de recharts: la nueva GestionConductoresPage no renderiza gráficas,
//    pero el import transitivo de ConductoresCharts se elimina en el rediseño.
//    Si el mock no se usa se ignora silenciosamente.
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children, onClick }: { children: ReactNode; onClick?: (entry: unknown) => void }) => (
    <div>
      <button type="button" data-testid="pie-activos" onClick={() => onClick?.({ key: "ACTIVO" })}>
        segmento-activos
      </button>
      <button
        type="button"
        data-testid="pie-activos-payload"
        onClick={() => onClick?.({ payload: { key: "ACTIVOS" } })}
      >
        segmento-activos-payload
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

// ── Datos de prueba ────────────────────────────────────────────────────────────
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
  conductores: [...conductoresBackend],
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
        <Route
          path="/dashboard/admin/conductores/dar-de-alta"
          element={<div data-testid="dar-de-alta">Dar de Alta</div>}
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
          (c) =>
            c.nombre.toLowerCase().includes(search) ||
            c.licencia.toLowerCase().includes(search),
        );
      }

      if (filters.disponibilidad && filters.disponibilidad !== "TODOS") {
        conductores = conductores.filter(
          (c) => c.estadoOperacional === filters.disponibilidad,
        );
      }

      return { ...backendPayload, conductores };
    });
  });

  it("muestra KPIs y listado de conductores al cargar", async () => {
    renderPage();

    // HU10 rediseñado: título principal del panel
    expect(await screen.findByText("Panel de Gestión de Conductores")).toBeInTheDocument();
    expect(screen.getByText("Total Conductores")).toBeInTheDocument();
    expect(screen.getByText("Conductores Activos")).toBeInTheDocument();
    expect(screen.getAllByText("Disponibles").length).toBeGreaterThan(0);
    expect(screen.getAllByText("En Ruta").length).toBeGreaterThan(0);
    // Conductores en la tabla
    expect(screen.getByText("Carlos Ramirez")).toBeInTheDocument();
    expect(screen.getByText("ABC-123")).toBeInTheDocument();
  });

  it("filtra por busqueda en el campo de texto", async () => {
    renderPage();

    expect(await screen.findByText("Carlos Ramirez")).toBeInTheDocument();

    // El placeholder del buscador en el nuevo diseño
    fireEvent.change(screen.getByPlaceholderText("Buscar conductor nuevo..."), {
      target: { value: "Lucia" },
    });

    expect(await screen.findByText("Lucia Torres")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Carlos Ramirez")).not.toBeInTheDocument();
    });
  });

  it("limpia la busqueda y muestra todos los conductores de nuevo", async () => {
    renderPage();

    expect(await screen.findByText("Carlos Ramirez")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Buscar conductor nuevo..."), {
      target: { value: "Lucia" },
    });
    expect(await screen.findByText("Lucia Torres")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Buscar conductor nuevo..."), {
      target: { value: "" },
    });
    expect(await screen.findByText("Carlos Ramirez")).toBeInTheDocument();
  });

  it("muestra mensaje sin resultados cuando ningun conductor coincide", async () => {
    renderPage();

    await screen.findByText("Carlos Ramirez");
    fireEvent.change(screen.getByPlaceholderText("Buscar conductor nuevo..."), {
      target: { value: "no existe" },
    });

    expect(await screen.findByText("No se encontraron conductores")).toBeInTheDocument();
  });

  it("muestra un error visible cuando la API no responde", async () => {
    vi.mocked(getDashboardConductores).mockRejectedValueOnce(new Error("Network Error"));

    renderPage();

    expect(await screen.findByText("No se pudo conectar con el backend")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument();
  });

  it("filtra por disponibilidad al hacer clic en los tabs", async () => {
    renderPage();

    await screen.findByText("Carlos Ramirez");

    // Tab "En Ruta" — nuevo diseño usa tabs simples
    fireEvent.click(screen.getByRole("button", { name: /En Ruta/i }));

    expect(await screen.findByText("Lucia Torres")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Mario Salas")).not.toBeInTheDocument();
    });
  });

  it("navega a Dar de Alta al hacer clic en el botón Nuevo Conductor", async () => {
    renderPage();

    await screen.findByText("Panel de Gestión de Conductores");

    fireEvent.click(screen.getByRole("button", { name: /Nuevo Conductor/i }));

    await waitFor(() => {
      expect(screen.getByTestId("dar-de-alta")).toBeInTheDocument();
    });
  });

  it("navega a la ficha individual HU20 al hacer clic en una fila", async () => {
    renderPage();

    // En el nuevo diseño la fila completa es clickeable (no hay botón "Ver")
    const row = await screen.findByText("Lucia Torres");
    const filaConductor = row.closest("tr");
    expect(filaConductor).not.toBeNull();

    fireEvent.click(filaConductor as HTMLTableRowElement);

    await waitFor(() => {
      expect(screen.getByTestId("ficha-conductor")).toBeInTheDocument();
    });
  });
});
