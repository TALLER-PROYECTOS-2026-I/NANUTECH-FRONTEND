// Estado interno del formulario de registro.
// Los campos numéricos se guardan como string porque vienen de inputs HTML.
export type FormState = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: string;
  capacidad_ton: string;
  vin: string;
  color: string;
  combustible: string;
  gps: boolean;
  fecha_registro: string;
  kilometraje_actual: string;
  notas: string;
};

