import type { Contrato, TipoServicio } from '@nanutech/api-client';

// Props que recibe la pagina desde App.tsx.
// onRegistered permite que App muestre el toast y refresque flujo cuando se cree el contrato.
export type RegistroContratoPageProps = {
  onBack: () => void;
  onRegistered?: (contrato: Contrato) => void;
};

// Contrato creado en modo mock. Se guarda para mostrar la pantalla de exito sin salir del modulo.
export type RegistroContratoSuccess = Pick<Contrato, 'id' | 'codigo' | 'estado'>;

// Modelo interno del formulario.
// Los numeros viven como string porque los inputs HTML controlados trabajan mejor asi.
export type RegistroContratoForm = {
  cliente: string;
  ruc: string;
  tipo_servicio: TipoServicio | '';
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  origen: string;
  destino: string;
  distancia_estimada_km: string;
  tiempo_estimado_horas: string;
  observaciones_ruta: string;
  tarifa_por_km: string;
  tarifa_por_hora: string;
  tarifa_por_tonelada: string;
  tarifa_espera: string;
};

// Errores por campo. Partial permite guardar solo los campos que realmente fallaron.
export type RegistroContratoErrors = Partial<Record<keyof RegistroContratoForm, string>>;
