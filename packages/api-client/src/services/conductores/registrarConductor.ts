import apiClient from '../../../index';

// ─── Payload enviado al backend POST /conductores/registro ────────────────────
export type RegistrarConductorPayload = {
  nombre: string;
  email: string;
  dni: string;
  telefono: string;
  numeroLicencia: string;
  categoriaVehicular: string;
  fechaVencimientoLicencia: string;
};

// ─── Respuesta del backend ────────────────────────────────────────────────────
export type RegistrarConductorResponse = {
  success: boolean;
  message: string;
  data?: {
    id?: string;
    conductorId?: string;
    nombre?: string;
    email?: string;
    [key: string]: unknown;
  };
};

// ─── Función principal que llama al endpoint de registro HU22 ─────────────────
export const registrarConductor = async (
  payload: RegistrarConductorPayload,
): Promise<RegistrarConductorResponse> => {
  // El backend serverless espera los datos de registro en este endpoint.
  const response = await apiClient.post<RegistrarConductorResponse>(
    '/conductores/registro',
    payload,
  );
  return response.data;
};
