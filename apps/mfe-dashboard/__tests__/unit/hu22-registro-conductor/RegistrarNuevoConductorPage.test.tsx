import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registrarConductor } from "@nanutech/api-client";
import RegistrarNuevoConductorPage from "../../../src/modules/registro-conductor";

vi.mock("@nanutech/api-client", () => ({
  registrarConductor: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/dashboard/admin/conductores/dar-de-alta"]}>
      <RegistrarNuevoConductorPage />
    </MemoryRouter>,
  );
}

describe("HU22 - Registro de Nuevo Conductor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    vi.mocked(registrarConductor).mockResolvedValue({
      success: true,
      message: "Conductor registrado exitosamente",
      data: {
        id: "conductor-001",
        nombre: "Roberto Alonso Quispe Herrera",
      },
    });
  });

  it("muestra el titulo correcto del formulario", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Registrar Nuevo Conductor" }),
    ).toBeInTheDocument();
  });

  it("valida campos obligatorios antes de enviar", async () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Registrar Conductor" }));

    expect(await screen.findByText("El nombre completo es obligatorio.")).toBeInTheDocument();
    expect(registrarConductor).not.toHaveBeenCalled();
  });

  it("envia al backend el payload real para registrar conductor", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), {
      target: { value: "Roberto Alonso Quispe Herrera" },
    });
    fireEvent.change(screen.getByLabelText(/Email Corporativo/i), {
      target: { value: "ROBERTO.QUISPE@NANUTECH.COM" },
    });
    fireEvent.change(screen.getByLabelText(/DNI/i), {
      target: { value: "72345819" },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: "958712340" },
    });
    fireEvent.change(screen.getByLabelText(/Número de Licencia/i), {
      target: { value: "q07234512" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Categoría Vehicular/i }));
    fireEvent.mouseDown(screen.getByRole("button", { name: "A-II-b" }));
    fireEvent.change(screen.getByLabelText(/Fecha de Vencimiento/i), {
      target: { value: "2027-12-31" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Registrar Conductor" }));

    await waitFor(() => {
      expect(registrarConductor).toHaveBeenCalledWith({
        nombreCompleto: "Roberto Alonso Quispe Herrera",
        email: "roberto.quispe@nanutech.com",
        dni: "72345819",
        telefono: "958712340",
        numeroLicencia: "Q07234512",
        categoria: "A-II-b",
        fechaVencimiento: "2027-12-31",
      });
    });
  });
});
