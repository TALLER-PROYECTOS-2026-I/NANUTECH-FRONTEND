import { describe, expect, it } from "vitest";
import type { Incidente } from "../../../src/modules/alertas-emergencias/types";
import {
  buildIndicadoresFromIncidentes,
  replaceIncidente,
  sortIncidentes,
} from "../../../src/modules/alertas-emergencias/utils/panel";

const baseIncidente: Incidente = {
  id: "incidente-base",
  codigo: "ALT-BASE",
  tipo: "PANICO",
  estado: "ACTIVA",
  severidad: "CRITICA",
  detalle: "Detalle",
  tipoFallaMecanica: null,
  latitud: -12,
  longitud: -77,
  direccion: null,
  fechaHora: "2026-04-07T16:00:00.000Z",
  bloqueoSosActivo: true,
  conductor: {
    id: "DRV-1",
    nombre: "Carlos Rodriguez",
    telefono: "999111222",
    dni: "70000001",
  },
  unidad: null,
  jornadaId: "JRN-1",
};

describe("HU19 - utils de alertas", () => {
  it("calcula indicadores desde incidentes locales", () => {
    const indicadores = buildIndicadoresFromIncidentes([
      baseIncidente,
      {
        ...baseIncidente,
        id: "auxilio-1",
        tipo: "AUXILIO_MECANICO",
        estado: "EN_PROCESO",
        tipoFallaMecanica: "Fallo en frenos",
      },
      {
        ...baseIncidente,
        id: "resuelto-1",
        estado: "RESUELTA",
        bloqueoSosActivo: false,
      },
    ]);

    expect(indicadores).toEqual({
      panicoActivas: 1,
      auxilioPendientes: 1,
      totalResueltas: 1,
      tienePanicoActivo: true,
    });
  });

  it("ordena activos primero y reemplaza incidentes actualizados", () => {
    const resuelto: Incidente = {
      ...baseIncidente,
      id: "resuelto",
      estado: "RESUELTA",
      fechaHora: "2026-04-08T16:00:00.000Z",
      bloqueoSosActivo: false,
    };

    const sorted = sortIncidentes([resuelto, baseIncidente]);
    expect(sorted[0].id).toBe("incidente-base");

    const replaced = replaceIncidente([baseIncidente], {
      ...baseIncidente,
      estado: "RESUELTA",
      bloqueoSosActivo: false,
    });

    expect(replaced[0].estado).toBe("RESUELTA");
  });
});
