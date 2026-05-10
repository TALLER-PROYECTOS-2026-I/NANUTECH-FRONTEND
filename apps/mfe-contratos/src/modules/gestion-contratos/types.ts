import type { Contrato } from '@nanutech/api-client';

// Props publicas de la pagina HU06.
// onNuevoContrato abre el formulario HU14; onVerContrato queda listo para navegar al detalle real.
export type GestionContratosPageProps = {
  onNuevoContrato: () => void;
  onVerContrato?: (contratoId: string) => void;
};

// Estados disponibles en los filtros del panel.
export type EstadoFiltro = 'TODOS' | 'VIGENTE' | 'VENCIDO' | 'SUSPENDIDO';

// Direccion de ordenamiento por fecha de vencimiento.
export type SortDirection = 'asc' | 'desc';

// Extension local para poder calcular camiones unicos cuando el backend envie IDs de unidades.
export type ContratoConUnidades = Contrato & {
  unidad_ids?: string[];
};
