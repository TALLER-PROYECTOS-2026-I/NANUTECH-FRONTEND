import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppRoutes } from "./App";
import "@testing-library/jest-dom";

describe("Dashboard Microfrontend", () => {
  beforeEach(() => {
    // Mock de fetch para que las pantallas no llamen servicios reales durante la prueba.
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, nombre: "Camion 1", estado: "disponible" },
              { id: 2, nombre: "Camion 2", estado: "disponible" },
            ],
          }),
      }),
    ) as unknown as typeof fetch;
  });

  it("renderiza el titulo principal cuando se abre el MFE directo", async () => {
    render(
      <MemoryRouter>
        <AppRoutes />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Dashboard Ejecutivo")).toBeInTheDocument();
    });
  });

  it("renderiza el dashboard admin cuando el shell lo monta en /dashboard/admin/*", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/admin/dashboard"]}>
        <Routes>
          <Route path="/dashboard/admin/*" element={<AppRoutes />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Dashboard Ejecutivo")).toBeInTheDocument();
    });
  });
});
