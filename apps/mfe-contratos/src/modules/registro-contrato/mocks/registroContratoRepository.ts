import type { Contrato } from '@nanutech/api-client';
import { buildCrearContratoPayload, getRegistroTarifaTotal } from '../utils/registroContratoMapper';
import type { RegistroContratoForm } from '../types';

/**
 * Repositorio mock de registro.
 *
 * Este archivo simula la respuesta de POST /contratos. Cuando el backend este listo,
 * se puede reemplazar esta funcion por una llamada a crearContrato(...) del api-client
 * manteniendo la misma firma Promise<Contrato>.
 */
export const createMockContrato = async (form: RegistroContratoForm): Promise<Contrato> => {
  // Reutiliza el mapper para que el mock tenga el mismo payload que el API real.
  const payload = buildCrearContratoPayload(form);
  const timestamp = Date.now();
  const uniqueSuffix = timestamp.toString(36).toUpperCase();

  // Contrato enriquecido con campos que normalmente devolveria el backend.
  return {
    id: `mock-${uniqueSuffix}`,
    codigo: `CTR-2026-${uniqueSuffix}`,
    ...payload,
    tarifa: getRegistroTarifaTotal(form),
    estado: 'VIGENTE',
    activo: true,
    camiones_asignados: 0,
    proximo_a_vencer: false,
  };
};
