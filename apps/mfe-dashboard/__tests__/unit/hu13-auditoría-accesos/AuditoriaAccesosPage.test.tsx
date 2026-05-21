import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuditoriaAccesos } from "@nanutech/api-client";
import AuditoriaAccesosPage from "../../../src/modules/auditoría-accesos";
import { exportarAuditoriaCsv } from "../../../src/modules/auditoría-accesos/utils/csv";
import { auditoriaMock } from "../../../src/modules/auditoría-accesos/mocks/auditoriaMock";

// Mock the API client
vi.mock("@nanutech/api-client", () => ({
  getAuditoriaAccesos: vi.fn(),
}));

// Mock the CSV utility
vi.mock("../../../src/modules/auditoría-accesos/utils/csv", () => ({
  exportarAuditoriaCsv: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/dashboard/admin/auditoria"]}>
      <AuditoriaAccesosPage />
    </MemoryRouter>,
  );
}

describe("HU13 - Auditoría de Accesos Panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default success mock returning the 7 items
    vi.mocked(getAuditoriaAccesos).mockResolvedValue(auditoriaMock);
  });

  it("renders correctly with cards, banners and role progress bars", async () => {
    renderPage();

    // Wait for data to load and table to render
    await screen.findByText("AUDIT-177542");

    // Check title & banner
    expect(screen.getByText("Auditoría de Accesos")).toBeInTheDocument();
    expect(screen.getByText(/Registros Inmutables - Solo Lectura/i)).toBeInTheDocument();

    // Check summary card values
    // Using getAllByText since values like '7' can appear in different cards/places
    const totalCardVal = screen.getByText("Total Accesos").closest(".rounded-xl")?.querySelector(".text-3xl");
    const hoyCardVal = screen.getByText("Accesos Hoy").closest(".rounded-xl")?.querySelector(".text-3xl");
    const semanaCardVal = screen.getByText("Accesos Esta Semana").closest(".rounded-xl")?.querySelector(".text-3xl");
    const usersCardVal = screen.getByText("Usuarios Únicos").closest(".rounded-xl")?.querySelector(".text-3xl");
    const ipsCardVal = screen.getByText("IPs Únicas").closest(".rounded-xl")?.querySelector(".text-3xl");

    expect(totalCardVal?.textContent).toBe("7");
    expect(hoyCardVal?.textContent).toBe("7");
    expect(semanaCardVal?.textContent).toBe("7");
    expect(usersCardVal?.textContent).toBe("5");
    expect(ipsCardVal?.textContent).toBe("1");

    // Check role indicators
    expect(screen.getByText("2 de 7")).toBeInTheDocument(); // Admin count
    expect(screen.getByText("1 de 7")).toBeInTheDocument(); // Gerente count
    expect(screen.getByText("4 de 7")).toBeInTheDocument(); // Conductor count

    // Check table headers
    expect(screen.getByText("ID Registro")).toBeInTheDocument();
    expect(screen.getByText("Dirección IP")).toBeInTheDocument();
    expect(screen.getByText("Navegador / SO")).toBeInTheDocument();

    // Check rows count
    const rows = screen.getAllByText(/AUDIT-\d+/);
    expect(rows.length).toBe(7);
  });

  it("searches and filters data in the access log table", async () => {
    renderPage();

    // Wait for data to load
    await screen.findByText("AUDIT-177542");

    // Get search input
    const searchInput = screen.getByPlaceholderText(/Buscar por usuario, email o ID.../i);

    // Search for "Carlos"
    fireEvent.change(searchInput, { target: { value: "Carlos" } });

    // Should only show rows containing Carlos
    expect(screen.getAllByText("Carlos Administrador").length).toBe(2);
    expect(screen.queryByText("Pedro Gerente")).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.getByText("Pedro Gerente")).toBeInTheDocument();

    // Search for ID "177536"
    fireEvent.change(searchInput, { target: { value: "177536" } });
    expect(screen.getAllByText(/AUDIT-/).length).toBe(1);
    expect(screen.getByText("AUDIT-177536")).toBeInTheDocument();
  });

  it("filters access logs by role using dropdown", async () => {
    renderPage();

    await screen.findByText("Pedro Gerente");

    const select = screen.getByRole("combobox");

    // Filter for "Gerente"
    fireEvent.change(select, { target: { value: "Gerente" } });

    // Only Pedro Gerente should show up
    expect(screen.getByText("Pedro Gerente")).toBeInTheDocument();
    expect(screen.queryByText("Carlos Administrador")).not.toBeInTheDocument();
    expect(screen.queryByText("Juan Chofer")).not.toBeInTheDocument();

    // Filter for "Administrador"
    fireEvent.change(select, { target: { value: "Administrador" } });
    expect(screen.getAllByText("Carlos Administrador").length).toBe(2);
    expect(screen.queryByText("Pedro Gerente")).not.toBeInTheDocument();

    // Filter for "Todos"
    fireEvent.change(select, { target: { value: "Todos" } });
    expect(screen.getByText("Pedro Gerente")).toBeInTheDocument();
  });

  it("falls back to local mock data if the API fails", async () => {
    vi.mocked(getAuditoriaAccesos).mockRejectedValue(new Error("API Error"));

    renderPage();

    // Wait for fallback data to load
    await screen.findByText("AUDIT-177542");

    // Even if it fails, it should show 7 rows because of fallback to auditoriaMock
    expect(screen.getByText("Auditoría de Accesos")).toBeInTheDocument();
    const rows = screen.getAllByText(/AUDIT-\d+/);
    expect(rows.length).toBe(7);
  });

  it("updates data correctly when custom API response is returned", async () => {
    const customResponse = [
      {
        id: "AUDIT-999999",
        usuario: "Ana Gerente",
        email: "ana.gerente@nanutech.com",
        rol: "Gerente" as const,
        fecha: "05/04/2026",
        hora: "10:00:00",
        ip: "192.168.1.1",
        navegador: "Chrome - Linux"
      }
    ];
    vi.mocked(getAuditoriaAccesos).mockResolvedValue(customResponse);

    renderPage();

    expect(await screen.findByText("Ana Gerente")).toBeInTheDocument();
    
    const totalCardVal = screen.getByText("Total Accesos").closest(".rounded-xl")?.querySelector(".text-3xl");
    expect(totalCardVal?.textContent).toBe("1");
    expect(screen.queryByText("Carlos Administrador")).not.toBeInTheDocument();
  });

  it("calls exportarAuditoriaCsv when clicking export button", async () => {
    renderPage();

    await screen.findByText("Pedro Gerente");

    const exportBtn = screen.getByRole("button", { name: /Exportar CSV/i });
    fireEvent.click(exportBtn);

    expect(exportarAuditoriaCsv).toHaveBeenCalledTimes(1);
    // Should be called with the logs (which are the default 7 logs)
    expect(exportarAuditoriaCsv).toHaveBeenCalledWith(expect.any(Array));
  });
});
