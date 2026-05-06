export { GestionContratosPage } from './components/GestionContratosPage';
export { ResumenTarjetas } from './components/ResumenTarjetas';
export { TablaContratos } from './components/TablaContratos';
export { GraficaContratos } from './components/GraficaContratos';

// Tipos
export type { Contrato, EstadoContrato, TipoServicio, ResumenDatos, DatosGrafica, PaginacionDatos } from './types';

// Mock data y servicios
export { mockContratos, calcularResumen, calcularDatosGraficaEstado, calcularDatosGraficaTipoServicio } from './mockData';
export { obtenerContratos, obtenerContratoPorId, obtenerTodasLosCamionesAsignados, obtenerColorbadgeEstado, obtenerTextoEstado } from './services';
