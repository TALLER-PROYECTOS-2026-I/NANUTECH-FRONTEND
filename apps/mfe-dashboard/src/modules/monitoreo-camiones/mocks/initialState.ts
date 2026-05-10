import type { FormState } from "../types";
import { mockCamiones } from "./mockCamiones";
import { crearPanelDesdeCamiones } from "../utils/panel";

// Estado inicial del panel antes de recibir datos reales del backend.
export const initialPanel = crearPanelDesdeCamiones(mockCamiones);

// Valores iniciales del formulario de registro.
export const initialForm: FormState = {
  id: "",
  placa: "",
  marca: "",
  modelo: "",
  anio: String(new Date().getFullYear()),
  capacidad_ton: "",
  vin: "",
  color: "",
  combustible: "DIESEL",
  gps: true,
  fecha_registro: new Date().toISOString().slice(0, 10),
  kilometraje_actual: "0",
  notas: "",
};

