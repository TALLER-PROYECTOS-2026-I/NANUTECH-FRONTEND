import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  exportAuditoriaAccesosCsv,
  getAuditoriaAccesos,
  getAuditoriaResumen,
} from "@nanutech/api-client";
import AuditoriaAccesosPage from "../../../src/modules/auditoría-accesos";

vi.mock("@nanutech/api-client", () => ({
  exportAuditoriaAccesosCsv: vi.fn(),
  getAuditoriaAccesos: vi.fn(),
  getAuditoriaResumen: vi.fn(),
}));

const resumenResponse = {
  metricas: {
    total_accesos: 7,
    accesos_hoy: 7,
    accesos_semana: 7,
    usuarios_unicos: 5,
    ips_unicas: 1,
  },
  progreso_roles: {
    ADMINISTRADOR: 2,
    GERENTE: 1,
    CHOFER: 4,
  },
};

const registrosResponse = [
  {
    id: "AUDIT-177542",
    usuario: "Carlos Administrador",
    email: "admin@nanutech.com",
    rol: "Administrador" as const,
    fecha: "05/04/2026",
    hora: "17:01:00",
    ip: "190.237.123.52",
    navegador: "Chrome - Windows",
  },
  {
    id: "AUDIT-177541",
    usuario: "Maria Gerente",
    email: "gerente@nanutech.com",
    rol: "Gerente" as const,
    fecha: "05/04/2026",
    hora: "14:32:15",
    ip: "190.237.123.52",
    navegador: "Chrome - Windows",
  },
  {
    id: "AUDIT-177536",
    usuario: "Juan Perez",
    email: "juan@nanutech.com",
    rol: "Conductor" as const,
    fecha: "05/04/2026",
    hora: "13:39:23",
    ip: "190.237.123.52",
    navegador: "Chrome - Windows",
  },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/dashboard/admin/auditoria"]}>
      <AuditoriaAccesosPage />
    </MemoryRouter>,
  );
}

describe("HU13 - Auditoria de Accesos Panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuditoriaResumen).mockResolvedValue(resumenResponse);
    vi.mocked(getAuditoriaAccesos).mockResolvedValue(registrosResponse);
    vi.mocked(exportAuditoriaAccesosCsv).mockResolvedValue(new Blob(["csv"], { type: "text/csv" }));
    URL.createObjectURL = vi.fn(() => "blob:auditoria");
    URL.revokeObjectURL = vi.fn();
  });

  it("muestra metricas, barras por rol y tabla cronologica desde el backend", async () => {
    renderPage();

    expect(await screen.findByText("AUDIT-177542")).toBeInTheDocument();
    expect(screen.getByText("Auditoria de Accesos")).toBeInTheDocument();
    expect(screen.getByText(/Registros Inmutables - Solo Lectura/i)).toBeInTheDocument();

    expect(screen.getByText("Total Accesos").closest(".rounded-xl")?.querySelector(".text-3xl")?.textContent).toBe("7");
    expect(screen.getByText("Accesos Hoy").closest(".rounded-xl")?.querySelector(".text-3xl")?.textContent).toBe("7");
    expect(screen.getByText("Accesos Esta Semana").closest(".rounded-xl")?.querySelector(".text-3xl")?.textContent).toBe("7");
    expect(screen.getByText("Usuarios Unicos").closest(".rounded-xl")?.querySelector(".text-3xl")?.textContent).toBe("5");
    expect(screen.getByText("IPs Unicas").closest(".rounded-xl")?.querySelector(".text-3xl")?.textContent).toBe("1");

    expect(screen.getByText("2 de 7")).toBeInTheDocument();
    expect(screen.getByText("1 de 7")).toBeInTheDocument();
    expect(screen.getByText("4 de 7")).toBeInTheDocument();
    expect(screen.getByText("Direccion IP")).toBeInTheDocument();
    expect(screen.getByText("Navegador / SO")).toBeInTheDocument();
  });

  it("envia busqueda y rol al backend cuando el usuario usa filtros", async () => {
    renderPage();
    await screen.findByText("Carlos Administrador");

    fireEvent.change(screen.getByPlaceholderText(/Buscar por usuario, email o ID/i), {
      target: { value: "Juan" },
    });

    await waitFor(() => {
      expect(getAuditoriaAccesos).toHaveBeenLastCalledWith({ search: "Juan", rol: "Todos" });
    });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Conductor" } });

    await waitFor(() => {
      expect(getAuditoriaAccesos).toHaveBeenLastCalledWith({ search: "Juan", rol: "Conductor" });
    });
  });

  it("muestra estado vacio si el backend no retorna registros o falla la conexion", async () => {
    vi.mocked(getAuditoriaAccesos).mockRejectedValue(new Error("API Error"));

    renderPage();

    expect(await screen.findByText(/No se pudo cargar la auditoria/i)).toBeInTheDocument();
    expect(screen.getByText(/No se encontraron registros de auditoria/i)).toBeInTheDocument();
    expect(screen.queryByText("AUDIT-177542")).not.toBeInTheDocument();
  });

  it("descarga el CSV oficial desde el endpoint del backend con filtros activos", async () => {
    renderPage();
    await screen.findByText("Maria Gerente");

    fireEvent.change(screen.getByPlaceholderText(/Buscar por usuario, email o ID/i), {
      target: { value: "Maria" },
    });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Gerente" } });

    await waitFor(() => {
      expect(getAuditoriaAccesos).toHaveBeenLastCalledWith({ search: "Maria", rol: "Gerente" });
    });

    fireEvent.click(screen.getByRole("button", { name: /Exportar CSV/i }));

    await waitFor(() => {
      expect(exportAuditoriaAccesosCsv).toHaveBeenCalledWith({ search: "Maria", rol: "Gerente" });
    });
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
