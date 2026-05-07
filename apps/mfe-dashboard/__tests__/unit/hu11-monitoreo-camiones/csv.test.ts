import { afterEach, describe, expect, it, vi } from "vitest";
import type { CamionHu11 } from "@nanutech/api-client";
import { buildCsv, downloadCsv } from "../../../src/modules/monitoreo-camiones/utils/csv";

// Camión mínimo para validar cómo se transforma la data a CSV.
const camionMock: CamionHu11 = {
  id: "unidad-001",
  placa: "ABC-123",
  marca: 'Volvo "Especial"',
  modelo: "FH16",
  anio: 2022,
  capacidad_ton: 28,
  estado: "DISPONIBLE",
  gps_habilitado: true,
  vin: "VINABC123",
  color: "Azul",
  tipo_combustible: "DIESEL",
  kilometraje_actual: 1200,
  fecha_registro: "2026-04-07",
  ultima_fecha_mantenimiento: null,
  proxima_fecha_mantenimiento: "2026-06-12",
  horas_movimiento: 0,
  horas_detenido: 0,
  horas_totales: 0,
  kilometros_totales: 1500,
  ultimo_gps_at: null,
  activo: true,
};

describe("utils/csv", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Valida que buildCsv genere encabezados, datos y escapado correcto de comillas.
  it("genera un CSV con encabezados y valores escapados", () => {
    const csv = buildCsv([camionMock]);

    expect(csv).toContain('"ID","Placa","Marca","Modelo","Año"');
    expect(csv).toContain('"unidad-001","ABC-123","Volvo ""Especial"""');
    expect(csv).toContain('"SI"');
    expect(csv).toContain('"","2026-06-12"');
  });

  // Valida el camino de descarga sin crear un archivo real en el navegador de prueba.
  it("crea un enlace temporal para descargar el CSV", () => {
    const createObjectUrl = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:camiones");
    const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    downloadCsv("contenido,csv");

    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:camiones");
  });
});
