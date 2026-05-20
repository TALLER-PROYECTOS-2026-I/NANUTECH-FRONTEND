import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  actualizarEstadoAuxilio,
  getAlertasActivas,
  getIndicadoresAlertas,
  resolverAlerta,
} from "@nanutech/api-client";
import AlertasEmergenciasPage from "../../../src/modules/alertas-emergencias";

// Mock del cliente API para probar HU19 sin depender del backend real.
vi.mock("@nanutech/api-client", () => ({
  getIndicadoresAlertas: vi.fn(),
  getAlertasActivas: vi.fn(),
  resolverAlerta: vi.fn(),
  actualizarEstadoAuxilio: vi.fn(),
}));

// Indicadores iniciales con un panico activo para validar banner rojo.
const indicadoresMock = {
  panico_activas: 1,
  auxilio_pendientes: 1,
  total_resueltas: 3,
  tiene_panico_activo: true,
};

// Alerta de panico activa usada para modal, banner y resolucion.
const panicoActivo = {
  id: "panico-1",
  codigo: "ALT-001",
  tipo: "PANICO",
  estado: "ACTIVA",
  severidad: "CRITICA",
  detalle: "Emergencia reportada",
  tipo_falla_mecanica: null,
  latitud: -12.0264,
  longitud: -76.9916,
  direccion: null,
  fecha_hora: "2026-04-07T16:53:30.000Z",
  bloqueo_sos_activo: true,
  conductor: {
    id: "DRV-004",
    nombre_completo: "Carlos Rodriguez",
    telefono: "999111222",
    dni: "70000001",
  },
  unidad: {
    id: "TRK-001",
    placa: "ABC-123",
    marca: "Volvo",
    modelo: "FH16",
  },
  jornada_id: "JRN-001",
} as const;

// Auxilio activo usado para validar cambio a EN_PROCESO.
const auxilioActivo = {
  id: "auxilio-1",
  codigo: "AUX-001",
  tipo: "AUXILIO_MECANICO",
  estado: "ACTIVA",
  severidad: "ALTA",
  detalle: "Unidad detenida",
  tipo_falla_mecanica: "Problema de motor",
  latitud: -12.056,
  longitud: -77.045,
  direccion: "Via principal",
  fecha_hora: "2026-04-07T19:48:30.000Z",
  bloqueo_sos_activo: false,
  conductor: {
    id: "DRV-005",
    nombre_completo: "Maria Garcia",
    telefono: "999222333",
    dni: "70000002",
  },
  unidad: {
    id: "TRK-005",
    placa: "MNO-345",
    marca: "Volvo",
    modelo: "VM",
  },
  jornada_id: "JRN-002",
} as const;

// Renderiza la pagina dentro de router porque el sidebar usa NavLink.
function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/dashboard/admin/alertas"]}>
      <AlertasEmergenciasPage />
    </MemoryRouter>,
  );
}

describe("HU19 - Alertas y Emergencias", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getIndicadoresAlertas).mockResolvedValue(indicadoresMock);
    vi.mocked(getAlertasActivas).mockResolvedValue([panicoActivo, auxilioActivo]);
  });

  it("muestra indicadores, banner critico y tablas al cargar", async () => {
    renderPage();

    expect(await screen.findByText("Panel de Alertas y Emergencias")).toBeInTheDocument();
    expect(screen.getByText("1 alerta(s) activa(s) requieren atencion inmediata.")).toBeInTheDocument();
    expect(screen.getByText("Alertas de Panico")).toBeInTheDocument();
    expect(screen.getByText("Auxilios Mecanicos")).toBeInTheDocument();
    expect(screen.getByText("Total Resueltas")).toBeInTheDocument();
    expect(screen.getByText("Carlos Rodriguez")).toBeInTheDocument();
    expect(screen.getByText("Problema de motor")).toBeInTheDocument();
  });

  it("abre modal de panico con coordenadas y enlace a Google Maps", async () => {
    renderPage();

    const conductor = await screen.findByText("Carlos Rodriguez");
    const row = conductor.closest("tr");
    expect(row).not.toBeNull();

    fireEvent.click(within(row as HTMLTableRowElement).getByRole("button", { name: "Ver Detalles" }));

    expect(screen.getByText("Detalle de Alerta de Panico")).toBeInTheDocument();
    expect(screen.getByText("EMERGENCIA ACTIVA - Requiere atencion inmediata")).toBeInTheDocument();
    expect(screen.getByText("-12.026400")).toBeInTheDocument();
    expect(screen.getByText("-76.991600")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver en Google Maps/i })).toHaveAttribute(
      "href",
      "https://www.google.com/maps?q=-12.0264,-76.9916",
    );
  });

  it("resuelve el ultimo panico activo, oculta banner y aumenta total resueltas", async () => {
    vi.mocked(resolverAlerta).mockResolvedValue({
      ...panicoActivo,
      estado: "RESUELTA",
      bloqueo_sos_activo: false,
      atendida: true,
    });

    renderPage();

    const conductor = await screen.findByText("Carlos Rodriguez");
    fireEvent.click(within(conductor.closest("tr") as HTMLTableRowElement).getByRole("button", { name: "Ver Detalles" }));
    fireEvent.click(screen.getByRole("button", { name: "Marcar como Resuelto" }));

    await waitFor(() => {
      expect(resolverAlerta).toHaveBeenCalledWith("panico-1", {
        detalle_resolucion: "Incidente resuelto desde el panel de alertas.",
      });
    });

    expect(screen.queryByText("1 alerta(s) activa(s) requieren atencion inmediata.")).not.toBeInTheDocument();
    expect(screen.getByText("Alerta de panico resuelta")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("permite marcar un auxilio mecanico como en proceso", async () => {
    vi.mocked(actualizarEstadoAuxilio).mockResolvedValue({
      ...auxilioActivo,
      estado: "EN_PROCESO",
    });

    renderPage();

    const falla = await screen.findByText("Problema de motor");
    fireEvent.click(within(falla.closest("tr") as HTMLTableRowElement).getByRole("button", { name: "Ver Detalles" }));
    fireEvent.click(screen.getByRole("button", { name: "Marcar como En Proceso" }));

    await waitFor(() => {
      expect(actualizarEstadoAuxilio).toHaveBeenCalledWith("auxilio-1", { estado: "EN_PROCESO" });
    });

    expect(screen.getByText("Auxilio en proceso")).toBeInTheDocument();
    expect(screen.getAllByText("En Proceso").length).toBeGreaterThan(0);
  });
});
