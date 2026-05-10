import type { ContratosIndicadores } from '@nanutech/api-client';

// La HU solicita paginacion de 10 en 10 para proteger rendimiento.
export const PAGE_SIZE = 10;

// Estado vacio usado mientras cargan datos o cuando no hay respuesta del API.
export const emptyIndicadores: ContratosIndicadores = {
  total_contratos: 0,
  contratos_activos: 0,
  contratos_vencidos: 0,
  proximos_a_vencer: 0,
  camiones_asignados: 0,
  distribucion_por_estado: [],
  distribucion_por_tipo_servicio: [],
};
