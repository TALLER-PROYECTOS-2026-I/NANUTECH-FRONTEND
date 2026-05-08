import { useEffect, useMemo, useState } from 'react';
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
import { camionesDisponibles, getDetalleContratoMock, saveDetalleContratoMock } from '../mocks/detalleContratoRepository';
import type { DetalleContrato, DetalleContratoForm, DetalleContratoPageProps, DetalleContratoTab } from '../types';

// Convierte el contrato cargado a estado controlado para formularios.
const buildForm = (contrato: DetalleContrato): DetalleContratoForm => ({
  cliente: contrato.cliente,
  tipoServicio: contrato.tipoServicio,
  estado: contrato.estado,
  moneda: contrato.moneda,
  tarifa: String(contrato.tarifa),
  fechaInicio: contrato.fechaInicio,
  fechaFin: contrato.fechaFin,
  descripcion: contrato.descripcion,
  unidadIds: contrato.unidadIds,
});

// HU07 - Detalle y configuracion de contrato.
export default function DetalleContratoPage({ contratoId, onBack }: DetalleContratoPageProps) {
  // Contrato activo seleccionado desde el panel de contratos.
  const [contrato, setContrato] = useState<DetalleContrato | null>(null);

  // Controla si el usuario esta leyendo o editando el contrato completo.
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // Tabs que permiten cambiar contenido inferior sin cambiar el contrato seleccionado.
  const [activeTab, setActiveTab] = useState<DetalleContratoTab>('resumen');

  // Formulario compartido por la edicion completa y la seccion de tarifas.
  const [form, setForm] = useState<DetalleContratoForm | null>(null);

  // Mensajes de validacion inmediatos, especialmente para fechas.
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadDetalle = async () => {
      const detalle = await getDetalleContratoMock(contratoId);
      if (!active) return;
      setContrato(detalle);
      setForm(buildForm(detalle));
      setMode('view');
      setActiveTab('resumen');
    };

    void loadDetalle();

    return () => {
      active = false;
    };
  }, [contratoId]);

  const selectedTrucks = useMemo(
    () => camionesDisponibles.filter((truck) => contrato?.unidadIds.includes(truck.id)),
    [contrato]
  );

  const updateForm = (patch: Partial<DetalleContratoForm>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setError('');
    setSuccessMessage('');
  };

  const toggleTruck = (truckId: string) => {
    setForm((current) => {
      if (!current) return current;
      const exists = current.unidadIds.includes(truckId);
      return {
        ...current,
        unidadIds: exists
          ? current.unidadIds.filter((id) => id !== truckId)
          : [...current.unidadIds, truckId],
      };
    });
    setError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    if (!form) return 'No se pudo cargar el formulario.';
    if (!form.cliente.trim()) return 'El nombre del cliente es obligatorio.';
    if (!form.tarifa || Number(form.tarifa) <= 0) return 'La tarifa debe ser mayor a cero.';
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

    // El repositorio mock representa el futuro PUT a API/AWS y devuelve historial auditable.
    const { contrato: updatedContrato, changes } = await saveDetalleContratoMock(contrato, form);
    setContrato(updatedContrato);
    setForm(buildForm(updatedContrato));
    setMode('view');
    setActiveTab(changes.length ? 'historial' : activeTab);
    setSuccessMessage(changes.length ? 'Cambios guardados y registrados en historial.' : 'No se detectaron cambios.');
    setError('');
  };

  const cancelEdit = () => {
    if (!contrato) return;
    setForm(buildForm(contrato));
    setMode('view');
    setError('');
    setSuccessMessage('');
  };

  if (!contrato || !form) {
    return (
      <main className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Cargando detalle del contrato...
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
            <AssignedTrucksCard contrato={contrato} trucks={camionesDisponibles} />
          )}

          {activeTab === 'historial' && <HistoryPanel historial={contrato.historial} />}

          {activeTab !== 'camiones' && (
            <AssignedTrucksCard contrato={{ ...contrato, unidadIds: selectedTrucks.map((truck) => truck.id) }} trucks={camionesDisponibles} />
          )}
        </>
      ) : (
        <EditContractPanel
          contrato={contrato}
          form={form}
          trucks={camionesDisponibles}
          error={error}
          onChange={updateForm}
          onToggleTruck={toggleTruck}
          onSave={saveChanges}
          onCancel={cancelEdit}
        />
      )}
    </main>
  );
}
