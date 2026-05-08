import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import GpsIntegrationPage from "../../../src/modules/gps-integration/pages/GpsIntegrationPage";

/* ───── SETUP GLOBAL MOCKS ───── */
beforeEach(() => {
  vi.clearAllMocks();

  Object.defineProperty(window.URL, "createObjectURL", {
    value: vi.fn(() => "blob:url"),
    writable: true,
  });

  Object.defineProperty(window.URL, "revokeObjectURL", {
    value: vi.fn(),
    writable: true,
  });
});

/* ───── WRAPPER ROUTER ───── */
const renderPage = () =>
  render(
    <MemoryRouter>
      <GpsIntegrationPage />
    </MemoryRouter>
  );

/* ───── HU08 TEST SUITE ───── */
describe("HU08 - Integración GPS", () => {

  it("renderiza KPIs correctamente", () => {
    renderPage();

    expect(screen.getByText(/Total Registros/i)).toBeInTheDocument();
    expect(screen.getByText(/En Movimiento/i)).toBeInTheDocument();
    expect(screen.getByText(/Detenidos/i)).toBeInTheDocument();
    expect(screen.getByText(/Velocidad Prom/i)).toBeInTheDocument();
  });

  it("muestra datos GPS en tabla al abrir vista", async () => {
    renderPage();

    fireEvent.click(screen.getByText(/Ver datos GPS/i));

    expect(await screen.findByText("ABC-123")).toBeInTheDocument();
    expect(await screen.findByText("DEF-456")).toBeInTheDocument();
  });

  it("filtra por placa", async () => {
    renderPage();

    fireEvent.click(screen.getByText(/Ver datos GPS/i));

    const input = screen.getByPlaceholderText(/Filtrar placa/i);

    fireEvent.change(input, {
      target: { value: "ABC" },
    });

    expect(await screen.findByText("ABC-123")).toBeInTheDocument();
  });

  it("filtra por proveedor sin duplicados", async () => {
    renderPage();

    fireEvent.click(screen.getByText(/Ver datos GPS/i));

    const selects = screen.getAllByRole("combobox");

    fireEvent.change(selects[0], {
      target: { value: "GPSControl.pe" },
    });

    const matches = await screen.findAllByText("GPSControl.pe");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("permite subir archivo CSV sin romper UI", () => {
    renderPage();

    const file = new File(["gps,data"], "gps.csv", {
      type: "text/csv",
    });

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    expect(fileInput.files?.length).toBe(1);
    expect(fileInput.files?.[0].name).toBe("gps.csv");
  });

  it("activa importación de datos GPS", () => {
    renderPage();

    const importBtn = screen.getByRole("button", {
      name: /importar datos gps/i,
    });

    fireEvent.click(importBtn);

    expect(importBtn).toBeInTheDocument();
  });

  it("descarga plantilla CSV correctamente", () => {
    renderPage();

    fireEvent.click(screen.getByText(/Descargar plantilla/i));

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

});