import { Contrato, PaginacionDatos } from './types';
import { mockContratos } from './mockData';

export const obtenerContratos = (
  pagina: number = 1,
  porPagina: number = 10,
  busqueda: string = ''
): PaginacionDatos => {
  let resultado = [...mockContratos];

  // Filtrar por búsqueda
  if (busqueda.trim()) {
    const busquedaLower = busqueda.toLowerCase();
    resultado = resultado.filter(
      (c) =>
        c.cliente.toLowerCase().includes(busquedaLower) ||
        c.codigo.toLowerCase().includes(busquedaLower)
    );
  }

  // Calcular paginación
  const total = resultado.length;
  const totalPaginas = Math.ceil(total / porPagina);
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + porPagina;
  const items = resultado.slice(inicio, fin);

  return {
    items,
    total,
    pagina,
    porPagina,
    totalPaginas,
  };
};

export const obtenerContratoPorId = (id: string): Contrato | undefined => {
  return mockContratos.find((c) => c.id === id);
};

export const obtenerTodasLosCamionesAsignados = (): number => {
  return mockContratos.reduce((sum, c) => sum + (c.camionesAsignados || 0), 0);
};

export const formatearFecha = (fecha: string): string => {
  // La fecha viene en formato DD/MM/YYYY
  return fecha;
};

export const obtenerColorbadgeEstado = (estado: string): string => {
  switch (estado) {
    case 'activo':
      return 'bg-green-100 text-green-800';
    case 'vencido':
      return 'bg-red-100 text-red-800';
    case 'suspendido':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const obtenerTextoEstado = (estado: string): string => {
  switch (estado) {
    case 'activo':
      return 'Activo';
    case 'vencido':
      return 'Vencido';
    case 'suspendido':
      return 'Suspendido';
    default:
      return estado;
  }
};
