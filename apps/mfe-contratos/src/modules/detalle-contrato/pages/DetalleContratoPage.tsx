import { useEffect, useMemo, useState } from 'react';
import {
  actualizarContrato,
  getContratoById,
  getContratos,
  getPanelCamionesHu11,
  type ActualizarContratoPayload,
  type Contrato,
} from '@nanutech/api-client';
import {
  AssignedTrucksCard,
  DetailHeader,
  DetailTabs,
  EditContractPanel,
  ExpirationWarning,
  GeneralInfoCard,
  HistoryPanel,
  StatsCards,
  TariffPanel,
} from '../components/DetalleContratoComponents';
import type {
  CamionDisponible,
  DetalleContrato,
  DetalleContratoForm,
  DetalleContratoPageProps,
  DetalleContratoTab,
  EstadoContratoDetalle,
} from '../types';

const normalizeEstado = (contrato: Contrato): EstadoContratoDetalle => {
  if (contrato.estado === 'VENCIDO' || contrato.estado === 'SUSPENDIDO') return contrato.estado;
  return contrato.activo === false ? 'SUSPENDIDO' : 'VIGENTE';
};

const getContratoTarifa = (contrato: Contrato) =>
  Number(contrato.tarifa ?? contrato.total_referencial ?? contrato.tarifa_por_km ?? 0);

const firstString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim() ?? '';

const firstNumber = (...values: unknown[]) => {
  const value = values.find((item) => item !== undefined && item !== null && item !== '');
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeTruck = (value: unknown): CamionDisponible | null => {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const id = firstString(item.id, item.unidad_id, item.camion_id);
  const placa = firstString(item.placa, item.codigo, item.nombre);
  if (!id && !placa) return null;
  const marcaModelo = [firstString(item.marca), firstString(item.modelo)].filter(Boolean).join(' ');

  return {
    id: id || placa,
    placa: placa || id,
    modelo: marcaModelo || firstString(item.modelo) || 'Sin modelo',
    anio: firstNumber(item.anio, item.year) || undefined,
    capacidadKg: firstNumber(item.capacidad_kg, item.capacidadKg) || undefined,
    capacidadTon: firstNumber(item.capacidad_ton, item.capacidadTon, item.capacidad) || undefined,
    estado: firstString(item.estado, item.status) || undefined,
  };
};

const normalizeTruckList = (value: unknown): CamionDisponible[] => {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeTruck).filter((truck): truck is CamionDisponible => Boolean(truck));
};

const isMissingTruckModel = (model: string) => !model.trim() || model === 'Sin modelo';

const enrichAssignedTrucks = (
  assignedTrucks: CamionDisponible[],
  catalog: CamionDisponible[],
): CamionDisponible[] =>
  assignedTrucks.map((assigned) => {
    const match = catalog.find(
      (truck) =>
        truck.id === assigned.id ||
        truck.placa.toLowerCase() === assigned.placa.toLowerCase(),
    );

    if (!match) return assigned;

    return {
      ...assigned,
      id: assigned.id || match.id,
      placa: assigned.placa || match.placa,
      modelo: isMissingTruckModel(assigned.modelo) ? match.modelo : assigned.modelo,
      anio: assigned.anio ?? match.anio,
      capacidadKg: assigned.capacidadKg ?? match.capacidadKg,
      capacidadTon: assigned.capacidadTon ?? match.capacidadTon,
      estado: assigned.estado ?? match.estado,
    };
  });

const normalizeDateInput = (value?: string) => {
  if (!value) return '';

  const trimmed = value.trim();
  const dateOnly = trimmed.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return dateOnly;

  const slashMatch = dateOnly.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return '';

  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const mapContratoToDetalle = (contrato: Contrato): DetalleContrato => {
  const backend = contrato as Contrato & {
    created_at?: string;
    updated_at?: string;
    unidad_ids?: string[];
    historial?: DetalleContrato['historial'];
    camiones_asignados?: number;
    unidades_asignadas?: number;
    total_camiones?: number;
    camiones?: unknown[];
    unidades?: unknown[];
    unidades_asignadas_detalle?: unknown[];
    origen_nombre?: string;
    origen_direccion?: string;
    ruta_origen?: string;
    punto_origen?: string;
    ciudad_origen?: string;
    destino_nombre?: string;
    destino_direccion?: string;
    ruta_destino?: string;
    punto_destino?: string;
    ciudad_destino?: string;
  };

  const fechaInicio = normalizeDateInput(contrato.fecha_inicio);
  const fechaFin = normalizeDateInput(contrato.fecha_fin || contrato.fecha_inicio);
  const fechaCreacion = normalizeDateInput(backend.created_at || contrato.fecha_inicio);
  const ultimaActualizacion = normalizeDateInput(backend.updated_at || backend.created_at || contrato.fecha_inicio);
  const unidadIds = Array.isArray(backend.unidad_ids) ? backend.unidad_ids : [];
  const camionesAsignadosDetalle = [
    ...normalizeTruckList(backend.camiones),
    ...normalizeTruckList(backend.unidades),
    ...normalizeTruckList(backend.unidades_asignadas_detalle),
  ];
  const camionesAsignados = Number(
    backend.camiones_asignados ??
      backend.unidades_asignadas ??
      backend.total_camiones ??
      camionesAsignadosDetalle.length ??
      unidadIds.length
  );
  const origen = firstString(
    contrato.origen,
    backend.origen_nombre,
    backend.origen_direccion,
    backend.ruta_origen,
    backend.punto_origen,
    backend.ciudad_origen,
  );
  const destino = firstString(
    contrato.destino,
    backend.destino_nombre,
    backend.destino_direccion,
    backend.ruta_destino,
    backend.punto_destino,
    backend.ciudad_destino,
  );

  return {
    id: contrato.id,
    codigo: contrato.codigo || contrato.id,
    cliente: contrato.cliente,
    ruc: contrato.ruc,
    tipoServicio: contrato.tipo_servicio,
    estado: normalizeEstado(contrato),
    moneda: contrato.moneda === 'USD' ? 'USD' : 'PEN',
    tarifa: getContratoTarifa(contrato),
    fechaInicio,
    fechaFin: fechaFin || fechaInicio,
    descripcion: contrato.descripcion || '',
    origen,
    destino,
    distanciaEstimadaKm: firstNumber(contrato.distancia_estimada_km),
    tarifaPorKm: firstNumber(contrato.tarifa_por_km),
    tarifaPorHora: firstNumber(contrato.tarifa_por_hora),
    tarifaEspera: firstNumber(contrato.tarifa_espera),
    camionesAsignados: Number.isFinite(camionesAsignados) ? camionesAsignados : unidadIds.length,
    camionesAsignadosDetalle,
    fechaCreacion,
    ultimaActualizacion,
    unidadIds,
    historial: Array.isArray(backend.historial) ? backend.historial : [],
  };
};

const buildForm = (contrato: DetalleContrato): DetalleContratoForm => ({
  cliente: contrato.cliente,
  tipoServicio: contrato.tipoServicio,
  estado: contrato.estado,
  moneda: contrato.moneda,
  tarifa: String(contrato.tarifa),
  fechaInicio: contrato.fechaInicio,
  fechaFin: contrato.fechaFin,
  descripcion: contrato.descripcion,
  unidadIds: contrato.unidadIds.length
    ? contrato.unidadIds
    : contrato.camionesAsignadosDetalle.map((truck) => truck.id),
});

const buildUpdatePayload = (contrato: DetalleContrato, form: DetalleContratoForm): ActualizarContratoPayload => {
  const payload: ActualizarContratoPayload = {};
  const tarifa = Number(form.tarifa);

  if (form.cliente.trim() !== contrato.cliente) payload.cliente = form.cliente.trim();
  if (form.tipoServicio !== contrato.tipoServicio) payload.tipo_servicio = form.tipoServicio;
  if (form.estado !== contrato.estado) payload.estado = form.estado;
  if (form.moneda !== contrato.moneda) payload.moneda = form.moneda;
  if (Number.isFinite(tarifa) && tarifa !== contrato.tarifa) payload.tarifa = tarifa;
  if (form.fechaInicio !== contrato.fechaInicio) payload.fecha_inicio = form.fechaInicio;
  if (form.fechaFin !== contrato.fechaFin) payload.fecha_fin = form.fechaFin;
  if (form.descripcion !== contrato.descripcion) payload.descripcion = form.descripcion;

  return payload;
};

export default function DetalleContratoPage({ contratoId, onBack }: DetalleContratoPageProps) {
  const [contrato, setContrato] = useState<DetalleContrato | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [activeTab, setActiveTab] = useState<DetalleContratoTab>('resumen');
  const [form, setForm] = useState<DetalleContratoForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [trucks, setTrucks] = useState<CamionDisponible[]>([]);

  useEffect(() => {
    let active = true;

    const loadDetalle = async () => {
      setLoading(true);
      setLoadError('');
      setError('');
      setSuccessMessage('');

      try {
        const [detalleResult, listadoResult, panelResult] = await Promise.allSettled([
          getContratoById(contratoId),
          getContratos({ page: 1, limit: 100 }),
          getPanelCamionesHu11(),
        ]);

        if (detalleResult.status === 'rejected') throw detalleResult.reason;
        if (!active) return;

        const response = detalleResult.value;
        const listadoContrato =
          listadoResult.status === 'fulfilled'
            ? listadoResult.value.data.find((item) => item.id === contratoId || item.codigo === response.codigo)
            : undefined;
        const panelCamiones =
          panelResult.status === 'fulfilled'
            ? panelResult.value.camiones.map((truck) => ({
                id: truck.id,
                placa: truck.placa,
                modelo: [truck.marca, truck.modelo].filter(Boolean).join(' ') || 'Sin modelo',
                anio: truck.anio,
                capacidadTon: truck.capacidad_ton,
                estado: truck.estado,
              }))
            : [];
        const detalle = mapContratoToDetalle({
          ...response,
          camiones_asignados: response.camiones_asignados ?? listadoContrato?.camiones_asignados,
        });
        detalle.camionesAsignadosDetalle = enrichAssignedTrucks(detalle.camionesAsignadosDetalle, panelCamiones);
        setTrucks(panelCamiones);
        setContrato(detalle);
        setForm(buildForm(detalle));
        setMode('view');
        setActiveTab('resumen');
      } catch {
        if (!active) return;
        setContrato(null);
        setForm(null);
        setLoadError('No se pudo cargar el detalle del contrato desde el servidor.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDetalle();

    return () => {
      active = false;
    };
  }, [contratoId]);

  const selectedTrucks = useMemo(
    () => trucks.filter((truck) => contrato?.unidadIds.includes(truck.id)),
    [contrato, trucks]
  );

  const updateForm = (patch: Partial<DetalleContratoForm>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    if (!form) return 'No se pudo cargar el formulario.';
    if (!form.cliente.trim()) return 'El nombre del cliente es obligatorio.';
    if (!form.tarifa || Number(form.tarifa) <= 0) return 'La tarifa debe ser mayor a cero.';
    if (!form.fechaInicio || !form.fechaFin) return 'Las fechas de inicio y fin son obligatorias.';
    if (new Date(`${form.fechaFin}T00:00:00`) < new Date(`${form.fechaInicio}T00:00:00`)) {
      return 'La fecha de fin no puede ser menor a la fecha de inicio.';
    }
    return '';
  };

  const saveChanges = async () => {
    if (!contrato || !form) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = buildUpdatePayload(contrato, form);

      if (Object.keys(payload).length === 0) {
        setMode('view');
        setSuccessMessage('No se detectaron cambios en los datos del contrato.');
        return;
      }

      const updated = await actualizarContrato(contrato.id, payload);
      const updatedDetalle = mapContratoToDetalle({
        ...updated,
        origen: firstString(updated.origen, contrato.origen),
        destino: firstString(updated.destino, contrato.destino),
        unidad_ids: contrato.unidadIds,
        camiones_asignados: updated.camiones_asignados ?? contrato.camionesAsignados,
        camiones: contrato.camionesAsignadosDetalle,
      });
      setContrato(updatedDetalle);
      setForm(buildForm(updatedDetalle));
      setMode('view');
      setSuccessMessage('Cambios guardados correctamente.');
    } catch {
      setError('No se pudieron guardar los cambios en el servidor. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (!contrato) return;
    setForm(buildForm(contrato));
    setMode('view');
    setError('');
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <main className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Cargando detalle del contrato...
      </main>
    );
  }

  if (loadError || !contrato || !form) {
    return (
      <main className="space-y-4 rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-700">
          {loadError || 'No se encontro informacion del contrato.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
        >
          Volver
        </button>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <DetailHeader
        contrato={contrato}
        mode={mode}
        onBack={onBack}
        onEdit={() => {
          setMode('edit');
          setError('');
          setSuccessMessage('');
        }}
      />

      {mode === 'view' ? (
        <>
          <ExpirationWarning contrato={contrato} />
          <DetailTabs activeTab={activeTab} onChange={setActiveTab} />
          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              {successMessage}
            </div>
          )}

          {activeTab === 'resumen' && (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              <GeneralInfoCard contrato={contrato} />
              <StatsCards contrato={contrato} />
            </div>
          )}

          {activeTab === 'tarifas' && (
            <TariffPanel form={form} error={error} onChange={updateForm} onSave={saveChanges} />
          )}

          {activeTab === 'camiones' && (
            <AssignedTrucksCard contrato={contrato} trucks={trucks} />
          )}

          {activeTab === 'historial' && <HistoryPanel historial={contrato.historial} />}

          {activeTab !== 'camiones' && (
            <AssignedTrucksCard contrato={{ ...contrato, unidadIds: selectedTrucks.map((truck) => truck.id) }} trucks={trucks} />
          )}
        </>
      ) : (
        <>
          {saving && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              Guardando cambios...
            </div>
          )}
          <EditContractPanel
            contrato={contrato}
            form={form}
            trucks={trucks}
            error={error}
            onChange={updateForm}
            onSave={saveChanges}
            onCancel={cancelEdit}
            saving={saving}
          />
        </>
      )}
    </main>
  );
}
