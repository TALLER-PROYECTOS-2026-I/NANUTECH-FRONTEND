import type { DetalleContrato, DetalleContratoForm, CamionDisponible, HistorialContrato } from '../types';
import { MOCK_AUDIT_IP } from '../constants';

// Camiones mock que simulan el catalogo operativo disponible para asociar contratos.
export const camionesDisponibles: CamionDisponible[] = [
  { id: 'CAM-001', placa: 'ABC-123', modelo: 'Volvo FH16' },
  { id: 'CAM-002', placa: 'DEF-456', modelo: 'Scania R450' },
  { id: 'CAM-003', placa: 'GHI-789', modelo: 'Mercedes-Benz Actros' },
  { id: 'CAM-004', placa: 'JKL-012', modelo: 'Iveco Stralis' },
  { id: 'CAM-005', placa: 'MNO-345', modelo: 'DAF XF' },
  { id: 'CAM-006', placa: 'PQR-678', modelo: 'Volvo FMX' },
];

// Detalles mock por contrato. La estructura imita lo que deberia retornar AWS/API despues.
const detalleContratos: DetalleContrato[] = [
  {
    id: 'cont-2024-001',
    codigo: 'CONT-2024-001',
    cliente: 'Distribuidora San Miguel S.A.C.',
    ruc: '20123456789',
    tipoServicio: 'POR_VIAJE',
    estado: 'VENCIDO',
    moneda: 'USD',
    tarifa: 25,
    fechaInicio: '2023-12-31',
    fechaFin: '2024-12-30',
    descripcion: 'Contrato para transporte de mercaderia seca entre Lima y Callao.',
    origen: 'Lima - Terminal Ate',
    destino: 'Callao - Terminal Norte',
    fechaCreacion: '2023-12-15T08:00:00',
    ultimaActualizacion: '2024-01-03T10:30:00',
    unidadIds: ['CAM-001', 'CAM-002'],
    historial: [
      {
        id: 'hist-001',
        fechaHora: '2024-01-03T10:30:00',
        campo: 'Tarifa',
        valorAnterior: 'USD. 22.00',
        valorNuevo: 'USD. 25.00',
        ip: MOCK_AUDIT_IP,
      },
    ],
  },
  {
    id: 'cont-2024-004',
    codigo: 'CONT-2024-004',
    cliente: 'Alimentos Premium S.A.C.',
    ruc: '20444888999',
    tipoServicio: 'POR_HORA',
    estado: 'VIGENTE',
    moneda: 'USD',
    tarifa: 95,
    fechaInicio: '2023-12-31',
    fechaFin: '2026-04-29',
    descripcion: 'Transporte refrigerado para alimentos de alto valor hacia el sur.',
    origen: 'Arequipa',
    destino: 'Moquegua',
    fechaCreacion: '2023-12-20T08:00:00',
    ultimaActualizacion: '2026-03-01T09:15:00',
    unidadIds: ['CAM-005'],
    historial: [],
  },
  {
    id: 'cont-test-001',
    codigo: 'CONT-TEST-001',
    cliente: 'Transportes del Norte SAC',
    ruc: '20999111222',
    tipoServicio: 'POR_VIAJE',
    estado: 'VIGENTE',
    moneda: 'PEN',
    tarifa: 120,
    fechaInicio: '2026-04-05',
    fechaFin: '2026-10-02',
    descripcion: 'Servicio regular de traslado de carga general hacia Trujillo.',
    origen: 'Lima',
    destino: 'Trujillo',
    fechaCreacion: '2026-04-05T09:00:00',
    ultimaActualizacion: '2026-04-05T09:00:00',
    unidadIds: [],
    historial: [],
  },
];

// Simula GET /contratos/:id/detalle.
export const getDetalleContratoMock = async (contratoId: string): Promise<DetalleContrato> => {
  const detalle = detalleContratos.find(
    (contrato) => contrato.id === contratoId || contrato.codigo === contratoId
  );

  return structuredClone(detalle || detalleContratos[0]);
};

// Simula PUT /contratos/:id y devuelve el contrato actualizado junto al historial nuevo.
export const saveDetalleContratoMock = async (
  current: DetalleContrato,
  form: DetalleContratoForm
): Promise<{ contrato: DetalleContrato; changes: HistorialContrato[] }> => {
  const now = new Date().toISOString();
  const nextTarifa = Number(form.tarifa || 0);
  const fieldChanges: Array<[string, string, string]> = [];

  if (current.cliente !== form.cliente) fieldChanges.push(['Cliente', current.cliente, form.cliente]);
  if (current.tipoServicio !== form.tipoServicio) fieldChanges.push(['Tipo de servicio', current.tipoServicio, form.tipoServicio]);
  if (current.estado !== form.estado) fieldChanges.push(['Estado', current.estado, form.estado]);
  if (current.moneda !== form.moneda) fieldChanges.push(['Moneda', current.moneda, form.moneda]);
  if (Number(current.tarifa) !== nextTarifa) fieldChanges.push(['Tarifa', String(current.tarifa), String(nextTarifa)]);
  if (current.fechaInicio !== form.fechaInicio) fieldChanges.push(['Fecha inicio', current.fechaInicio, form.fechaInicio]);
  if (current.fechaFin !== form.fechaFin) fieldChanges.push(['Fecha fin', current.fechaFin, form.fechaFin]);
  if (current.descripcion !== form.descripcion) fieldChanges.push(['Descripcion', current.descripcion, form.descripcion]);

  const previousUnits = current.unidadIds.join(', ') || 'Sin camiones';
  const nextUnits = form.unidadIds.join(', ') || 'Sin camiones';
  if (previousUnits !== nextUnits) fieldChanges.push(['Camiones asignados', previousUnits, nextUnits]);

  const changes = fieldChanges.map(([campo, valorAnterior, valorNuevo], index) => ({
    id: `hist-${Date.now()}-${index}`,
    fechaHora: now,
    campo,
    valorAnterior,
    valorNuevo,
    ip: MOCK_AUDIT_IP,
  }));

  return {
    changes,
    contrato: {
      ...current,
      cliente: form.cliente,
      tipoServicio: form.tipoServicio,
      estado: form.estado,
      moneda: form.moneda,
      tarifa: nextTarifa,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      descripcion: form.descripcion,
      unidadIds: form.unidadIds,
      ultimaActualizacion: now,
      historial: [...changes, ...current.historial],
    },
  };
};
