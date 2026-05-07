import { Contrato, Camion, CambioHistorial } from './types';

export const mockContratos: Contrato[] = [
  {
    id: '1',
    codigo: 'CTR-2026-004',
    cliente: 'Petróleunica Nacional',
    descripcion: 'Transporte de productos químicos',
    fechaInicio: '28/02/2026',
    fechaFin: '24/03/2026',
    estado: 'Activo',
    tarifa: 120,
    moneda: 'PEN',
    tipoTarifa: 'Por Viaje',
    diasRestantes: 24,
    diasVencimiento: 7,
  },
  {
    id: '2',
    codigo: 'CTR-2026-001',
    cliente: 'Minera del Sur SAC',
    descripcion: 'Transporte de mineral de puerta a puerto',
    fechaInicio: '31/12/2025',
    fechaFin: '30/12/2026',
    estado: 'Activo',
    tarifa: 25,
    moneda: 'PEN',
    tipoTarifa: 'Por Tonelada',
    diasRestantes: 364,
    diasVencimiento: 200,
  },
];

export const mockCamiones: Camion[] = [
  {
    id: '1',
    placa: 'ABC-123',
    modelo: 'Volvo FH16',
    capacidad: '30 toneladas',
    estado: 'Disponible',
  },
  {
    id: '2',
    placa: 'DEF-456',
    modelo: 'Scania R440',
    capacidad: '25 toneladas',
    estado: 'Disponible',
  },
  {
    id: '3',
    placa: 'GHI-789',
    modelo: 'Mercedes-Benz Actros',
    capacidad: '28 toneladas',
    estado: 'Disponible',
  },
  {
    id: '4',
    placa: 'JKL-012',
    modelo: 'Man TGX',
    capacidad: '26 toneladas',
    estado: 'En Ruta',
  },
  {
    id: '5',
    placa: 'MNO-345',
    modelo: 'Iveco Stralis',
    capacidad: '24 toneladas',
    estado: 'Disponible',
  },
];

export const mockHistorialCambios: CambioHistorial[] = [
  {
    id: '1',
    fecha: '1/3/2026',
    hora: '10:30 p.m.',
    campo: 'Tarifa',
    valorAnterior: 'PEN 100',
    valorNuevo: 'PEN 120',
    usuario: 'Carlos Administrador',
  },
  {
    id: '2',
    fecha: '28/2/2026',
    hora: '09:15 a.m.',
    campo: 'Estado',
    valorAnterior: 'Inactivo',
    valorNuevo: 'Activo',
    usuario: 'Carlos Administrador',
  },
];

export const mockCamionesAsignados: Camion[] = [
  {
    id: '1',
    placa: 'ABC-123',
    modelo: 'Volvo FH16',
  },
  {
    id: '2',
    placa: 'GHI-789',
    modelo: 'Mercedes-Benz Actros',
  },
];

export const getCamisonesDisponibles = (): Camion[] => {
  return mockCamiones;
};

export const getContratoPorId = (id: string): Contrato | undefined => {
  return mockContratos.find((c) => c.id === id);
};
