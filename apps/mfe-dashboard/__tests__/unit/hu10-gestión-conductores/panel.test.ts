import { describe, expect, it } from "vitest";
import type { ConductorDashboard } from "../../../src/modules/gestión-conductores/types";
import { buildPanelConductores } from "../../../src/modules/gestión-conductores/utils/panel";
import { normalizePanelConductores } from "../../../src/modules/gestión-conductores/utils/normalize";

const conductoresMock: ConductorDashboard[] = [
  {
    id: "conductor-1",
    nombre: "Carlos Ramirez",
    email: "carlos@nanutech.com",
    dni: "12345678",
    licencia: "A-IIIB-12345678",
    contacto: "+51 900111222",
    estadoContrato: "ACTIVO",
    estadoOperacional: "DISPONIBLE",
    camionAsignado: null,
    activo: true,
  },
  {
    id: "conductor-2",
    nombre: "Lucia Torres",
    email: "lucia@nanutech.com",
    dni: "87654321",
    licencia: "A-IIIA-87654321",
    contacto: "+51 900333444",
    estadoContrato: "ACTIVO",
    estadoOperacional: "EN_RUTA",
    camionAsignado: "ABC-123",
    activo: true,
  },
  {
    id: "conductor-3",
    nombre: "Mario Salas",
    email: "mario@nanutech.com",
    dni: "45678901",
    licencia: "A-IIC-45678901",
    contacto: "+51 900555666",
    estadoContrato: "INACTIVO",
    estadoOperacional: "SIN_ASIGNAR",
    camionAsignado: null,
    activo: false,
  },
];

describe("HU10 - utils de gestion de conductores", () => {
  it("calcula KPIs y graficas segun reglas de negocio", () => {
    const panel = buildPanelConductores(conductoresMock);

    expect(panel.resumen).toEqual({
      totalConductores: 3,
      conductoresActivos: 2,
      disponibles: 1,
      enRuta: 1,
    });

    expect(panel.graficas.contrato).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "ACTIVO", value: 2 }),
        expect.objectContaining({ key: "INACTIVO", value: 1 }),
      ]),
    );
    expect(panel.graficas.operacional).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "DISPONIBLE", value: 1 }),
        expect.objectContaining({ key: "EN_RUTA", value: 1 }),
        expect.objectContaining({ key: "DESCANSANDO", value: 0 }),
      ]),
    );
  });

  it("normaliza el payload flexible del backend al modelo de la pantalla", () => {
    const panel = normalizePanelConductores({
      resumen: {
        total_conductores: 9,
        conductores_activos: 8,
        conductores_disponibles: 2,
        personal_en_ruta: 5,
      },
      conductores: [
        {
          conductor_id: "backend-1",
          nombre_completo: "Carlos Mendoza",
          correo: "cmendoza@nanutech.com",
          documento: "11223344",
          numero_licencia: "A-IIIB-11223344",
          telefono: "+51 988777666",
          estado_contrato: "ACTIVO",
          disponibilidad: "EN RUTA",
          placa_camion: "TRK-001",
        },
      ],
    });

    expect(panel.resumen.totalConductores).toBe(9);
    expect(panel.conductores[0]).toEqual(
      expect.objectContaining({
        id: "backend-1",
        nombre: "Carlos Mendoza",
        dni: "11223344",
        licencia: "A-IIIB-11223344",
        estadoContrato: "ACTIVO",
        estadoOperacional: "EN_RUTA",
        camionAsignado: "TRK-001",
      }),
    );
  });
});
