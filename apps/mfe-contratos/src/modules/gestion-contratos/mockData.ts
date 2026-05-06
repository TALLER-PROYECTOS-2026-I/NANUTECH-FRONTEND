import { Contrato, EstadoContrato } from './types';

export const mockContratos: Contrato[] = [
  {
    id: '1',
    codigo: 'CONT-2024-001',
    cliente: 'Distribuidora San Miguel S.A.C.',
    tipoServicio: 'Por Viaje',
    tarifa: 'USD 2.5',
    fechaInicio: '31/12/2023',
    fechaFin: '30/12/2024',
    estado: 'vencido',
    camionesAsignados: 3,
  },
  {
    id: '2',
    codigo: 'CONT-2024-002',
    cliente: 'Commercial La Victoria E.I.R.L.',
    tipoServicio: 'Por Hora',
    tarifa: 'USD 85',
    fechaInicio: '31/12/2023',
    fechaFin: '28/11/2024',
    estado: 'vencido',
    camionesAsignados: 2,
  },
  {
    id: '3',
    codigo: 'CONT-2024-003',
    cliente: 'Importadora del Norte S.A.',
    tipoServicio: 'Por Tonelada',
    tarifa: 'USD 35',
    fechaInicio: '14/11/2023',
    fechaFin: '14/1/2025',
    estado: 'vencido',
    camionesAsignados: 1,
  },
  {
    id: '4',
    codigo: 'CONT-2024-004',
    cliente: 'Alimentos Premium S.A.C.',
    tipoServicio: 'Por Hora',
    tarifa: 'USD 95',
    fechaInicio: '31/12/2023',
    fechaFin: '28/4/2025',
    estado: 'activo',
    camionesAsignados: 4,
  },
  {
    id: '5',
    codigo: 'CONT-2024-005',
    cliente: 'Construcciones del Sur E.I.R.L.',
    tipoServicio: 'Por Tonelada',
    tarifa: 'USD 28',
    fechaInicio: '14/2/2024',
    fechaFin: '30/5/2026',
    estado: 'activo',
    camionesAsignados: 2,
  },
  {
    id: '6',
    codigo: 'CONT-2023-015',
    cliente: 'Textil Peruana S.A.',
    tipoServicio: 'Por Viaje',
    tarifa: 'USD 1.8',
    fechaInicio: '18/11/2023',
    fechaFin: '18/1/2024',
    estado: 'vencido',
    camionesAsignados: 1,
  },
  {
    id: '7',
    codigo: 'CONT-2024-007',
    cliente: 'Minera Andina S.A.C.',
    tipoServicio: 'Por Tonelada',
    tarifa: 'USD 45',
    fechaInicio: '31/12/2023',
    fechaFin: '30/12/2025',
    estado: 'activo',
    camionesAsignados: 5,
  },
  {
    id: '8',
    codigo: 'CONT-2024-008',
    cliente: 'Agrosport Lima S.A.',
    tipoServicio: 'Por Hora',
    tarifa: 'USD 120',
    fechaInicio: '31/5/2024',
    fechaFin: '30/12/2024',
    estado: 'activo',
    camionesAsignados: 3,
  },
  {
    id: '9',
    codigo: 'CONT-TEST-001',
    cliente: 'Transportes del Norte SAC',
    tipoServicio: 'Por Viaje',
    tarifa: 'PEN.',
    fechaInicio: '5/4/2024',
    fechaFin: '2/10/2024',
    estado: 'activo',
    camionesAsignados: 2,
  },
  {
    id: '10',
    codigo: 'CONT-TEST-002',
    cliente: 'Distribuidora Sur EIR.L.',
    tipoServicio: 'Por Hora',
    tarifa: 'PEN.',
    fechaInicio: '5/4/2024',
    fechaFin: '2/10/2024',
    estado: 'activo',
    camionesAsignados: 1,
  },
  {
    id: '11',
    codigo: 'CONT-2024-009',
    cliente: 'Logística Integral S.A.',
    tipoServicio: 'Por Tonelada Km',
    tarifa: 'USD 12',
    fechaInicio: '01/03/2024',
    fechaFin: '15/06/2026',
    estado: 'activo',
    camionesAsignados: 2,
  },
  {
    id: '12',
    codigo: 'CONT-2024-010',
    cliente: 'Comercio Global E.I.R.L.',
    tipoServicio: 'Por Viaje',
    tarifa: 'USD 3.2',
    fechaInicio: '15/01/2024',
    fechaFin: '20/08/2025',
    estado: 'suspendido',
    camionesAsignados: 0,
  },
];

export const calcularResumen = (contratos: Contrato[]) => {
  const totalContratos = contratos.length;
  const contratosActivos = contratos.filter((c) => c.estado === 'activo').length;
  const contratosVencidos = contratos.filter((c) => c.estado === 'vencido').length;
  const camionesAsignados = contratos.reduce((sum, c) => sum + (c.camionesAsignados || 0), 0);

  return {
    totalContratos,
    contratosActivos,
    contratosVencidos,
    camionesAsignados,
  };
};

export const calcularDatosGraficaEstado = (contratos: Contrato[]) => {
  const activos = contratos.filter((c) => c.estado === 'activo').length;
  const vencidos = contratos.filter((c) => c.estado === 'vencido').length;
  const suspendidos = contratos.filter((c) => c.estado === 'suspendido').length;

  return [
    { name: 'Activos', value: activos },
    { name: 'Vencidos', value: vencidos },
    { name: 'Suspendidos', value: suspendidos },
  ];
};

export const calcularDatosGraficaTipoServicio = (contratos: Contrato[]) => {
  const tiposServicio = new Map<string, number>();

  contratos.forEach((c) => {
    const tipo = c.tipoServicio;
    tiposServicio.set(tipo, (tiposServicio.get(tipo) || 0) + 1);
  });

  return Array.from(tiposServicio.entries()).map(([name, value]) => ({
    name,
    value,
  }));
};
