import type { ChangeEvent, ReactNode } from 'react';
import { ESTADO_OPTIONS, MONEDA_OPTIONS, TIPO_SERVICIO_OPTIONS } from '../constants';
import type {
  CamionDisponible,
  DetalleContrato,
  DetalleContratoForm,
  DetalleContratoTab,
  HistorialContrato,
} from '../types';
import { formatDate, formatDateTime, formatMoney, formatTipoServicio, getDurationDays, getRemainingDays } from '../utils/formatters';

type HeaderProps = {
  contrato: DetalleContrato;
  mode: 'view' | 'edit';
  onBack: () => void;
  onEdit: () => void;
};

// Encabezado local de la HU07: conserva codigo y acciones principales.
export function DetailHeader({ contrato, mode, onBack, onEdit }: HeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          Volver
        </button>
        <div>
          <h2 className="text-2xl font-bold">{mode === 'edit' ? 'Editar Contrato' : 'Detalle de Contrato'}</h2>
          <p className="text-sm text-slate-500">{contrato.codigo}</p>
        </div>
      </div>

      {mode === 'view' && (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Editar
        </button>
      )}
    </div>
  );
}

// Alerta visual para contratos proximos a vencer.
export function ExpirationWarning({ contrato }: { contrato: DetalleContrato }) {
  const remainingDays = getRemainingDays(contrato.fechaFin);

  if (remainingDays > 30 || remainingDays < 0) return null;

  return (
    <div className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-700">
      <p className="font-bold">Contrato proximo a expirar</p>
      <p>Este contrato expira en {remainingDays} dias ({formatDate(contrato.fechaFin)}).</p>
    </div>
  );
}

type TabsProps = {
  activeTab: DetalleContratoTab;
  onChange: (tab: DetalleContratoTab) => void;
};

// Tabs superiores: cambian solo el contenido inferior.
export function DetailTabs({ activeTab, onChange }: TabsProps) {
  const tabs: Array<{ id: DetalleContratoTab; label: string }> = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'tarifas', label: 'Tarifas' },
    { id: 'camiones', label: 'Camiones' },
    { id: 'historial', label: 'Historial' },
  ];

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Tarjeta reutilizable con titulo y borde discreto.
export function DetailCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-slate-950">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// Muestra los datos centrales del contrato segun CA1.
export function GeneralInfoCard({ contrato }: { contrato: DetalleContrato }) {
  return (
    <DetailCard title="Informacion General">
      <div className="grid gap-5 md:grid-cols-2">
        <InfoItem label="Codigo de Contrato" value={contrato.codigo} strong />
        <InfoItem
          label="Estado"
          value={contrato.estado === 'VIGENTE' ? 'Activo' : contrato.estado === 'VENCIDO' ? 'Vencido' : 'Suspendido'}
          tone={contrato.estado === 'VIGENTE' ? 'green' : contrato.estado === 'VENCIDO' ? 'red' : 'amber'}
        />
        <InfoItem label="Cliente" value={contrato.cliente} strong />
        <InfoItem label="Tarifa" value={formatMoney(contrato.tarifa, contrato.moneda)} tone="green" strong />
        <InfoItem label="Tipo de Servicio" value={formatTipoServicio(contrato.tipoServicio)} />
        <InfoItem label="Fecha de Fin" value={formatDate(contrato.fechaFin)} />
        <InfoItem label="Fecha de Inicio" value={formatDate(contrato.fechaInicio)} />
        <InfoItem label="Ruta" value={`${contrato.origen} -> ${contrato.destino}`} />
      </div>
      <div className="mt-5 rounded-md bg-slate-50 p-4">
        <p className="text-xs font-semibold text-slate-500">Descripcion</p>
        <p className="mt-1 text-sm text-slate-700">{contrato.descripcion}</p>
      </div>
    </DetailCard>
  );
}

function InfoItem({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: 'green' | 'red' | 'amber' }) {
  const color = tone === 'green' ? 'text-green-600' : tone === 'red' ? 'text-red-600' : tone === 'amber' ? 'text-amber-600' : 'text-slate-950';

  return (
    <div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-sm ${strong ? 'font-bold' : 'font-medium'} ${color}`}>{value}</p>
    </div>
  );
}

// Estadisticas laterales: contador de unidades, duracion y dias restantes.
export function StatsCards({ contrato }: { contrato: DetalleContrato }) {
  const remainingDays = getRemainingDays(contrato.fechaFin);
  return (
    <div className="space-y-4">
      <DetailCard title="Estadisticas">
        <div className="space-y-3">
          <StatRow label="Camiones" value={contrato.unidadIds.length} tone="blue" />
          <StatRow label="Duracion" value={`${getDurationDays(contrato.fechaInicio, contrato.fechaFin)} dias`} tone="green" />
          <StatRow label="Dias restantes" value={remainingDays > 0 ? remainingDays : 0} tone="purple" />
        </div>
      </DetailCard>

      <DetailCard title="Informacion del Sistema">
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            <span className="block text-xs font-semibold text-slate-500">Fecha de Creacion</span>
            {formatDateTime(contrato.fechaCreacion)}
          </p>
          <p>
            <span className="block text-xs font-semibold text-slate-500">Ultima Actualizacion</span>
            {formatDateTime(contrato.ultimaActualizacion)}
          </p>
        </div>
      </DetailCard>
    </div>
  );
}

function StatRow({ label, value, tone }: { label: string; value: string | number; tone: 'blue' | 'green' | 'purple' }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  }[tone];

  return (
    <div className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-semibold ${styles}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

// Vista de camiones asignados; cumple el contador visible de unidades vinculadas.
export function AssignedTrucksCard({ contrato, trucks }: { contrato: DetalleContrato; trucks: CamionDisponible[] }) {
  const assigned = trucks.filter((truck) => contrato.unidadIds.includes(truck.id));

  return (
    <DetailCard title={`Camiones Asignados (${assigned.length})`} subtitle="Unidades vinculadas a este contrato">
      {assigned.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {assigned.map((truck) => (
            <div key={truck.id} className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="font-bold text-slate-950">{truck.placa}</p>
              <p className="text-sm text-slate-600">{truck.modelo}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid min-h-36 place-items-center rounded-lg border border-dashed border-slate-200 text-center text-sm text-slate-500">
          No hay camiones asignados a este contrato
        </div>
      )}
    </DetailCard>
  );
}

// Seccion de tarifas editable desde el detalle sin abrir el formulario completo.
export function TariffPanel({
  form,
  error,
  onChange,
  onSave,
}: {
  form: DetalleContratoForm;
  error?: string;
  onChange: (patch: Partial<DetalleContratoForm>) => void;
  onSave: () => void;
}) {
  return (
    <DetailCard title="Reglas de Tarifa" subtitle="Visualice y edite el esquema de cobro del contrato">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Tipo de Servicio">
          <select
            value={form.tipoServicio}
            onChange={(event) => onChange({ tipoServicio: event.target.value as DetalleContratoForm['tipoServicio'] })}
            className="form-input"
          >
            {TIPO_SERVICIO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Moneda">
          <select
            value={form.moneda}
            onChange={(event) => onChange({ moneda: event.target.value as DetalleContratoForm['moneda'] })}
            className="form-input"
          >
            {MONEDA_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Tarifa">
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.tarifa}
            onChange={(event) => onChange({ tarifa: event.target.value })}
            className="form-input"
          />
        </Field>
      </div>
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      <div className="mt-5 flex justify-end">
        <button type="button" onClick={onSave} className="rounded-md bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
          Guardar Cambios
        </button>
      </div>
    </DetailCard>
  );
}

// Formulario completo de edicion con datepickers y seleccion multiple de camiones.
export function EditContractPanel({
  contrato,
  form,
  trucks,
  error,
  onChange,
  onToggleTruck,
  onSave,
  onCancel,
}: {
  contrato: DetalleContrato;
  form: DetalleContratoForm;
  trucks: CamionDisponible[];
  error?: string;
  onChange: (patch: Partial<DetalleContratoForm>) => void;
  onToggleTruck: (truckId: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const handleInput = (key: keyof DetalleContratoForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    onChange({ [key]: event.target.value } as Partial<DetalleContratoForm>);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <DetailCard title="Informacion del Contrato" subtitle="Datos generales del contrato">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Codigo de Contrato">
            <input value={contrato.codigo} disabled className="form-input bg-slate-100 text-slate-500" />
          </Field>
          <Field label="Nombre del Cliente">
            <input value={form.cliente} onChange={handleInput('cliente')} className="form-input" />
          </Field>
          <Field label="Tipo de Servicio">
            <select value={form.tipoServicio} onChange={handleInput('tipoServicio')} className="form-input">
              {TIPO_SERVICIO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Estado">
            <select value={form.estado} onChange={handleInput('estado')} className="form-input">
              {ESTADO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Tarifa">
            <input type="number" step="0.01" min="0" value={form.tarifa} onChange={handleInput('tarifa')} className="form-input" />
          </Field>
          <Field label="Moneda">
            <select value={form.moneda} onChange={handleInput('moneda')} className="form-input">
              {MONEDA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Fecha de Inicio">
            <input type="date" value={form.fechaInicio} onChange={handleInput('fechaInicio')} className="form-input" />
          </Field>
          <Field label="Fecha de Fin">
            <input type="date" value={form.fechaFin} onChange={handleInput('fechaFin')} className="form-input" />
          </Field>
          <Field label="Descripcion" className="md:col-span-2">
            <textarea value={form.descripcion} onChange={handleInput('descripcion')} rows={4} className="form-input resize-none" />
          </Field>
        </div>
      </DetailCard>

      <div className="space-y-4">
        <DetailCard title="Camiones Asignados *" subtitle="Seleccione los camiones para este contrato">
          <div className="space-y-2">
            {trucks.map((truck) => (
              <label key={truck.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={form.unidadIds.includes(truck.id)}
                  onChange={() => onToggleTruck(truck.id)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>
                  <span className="block text-sm font-bold text-slate-950">{truck.placa}</span>
                  <span className="block text-xs text-slate-500">{truck.modelo}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">Camiones seleccionados: {form.unidadIds.length}</p>
        </DetailCard>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
        <button type="button" onClick={onSave} className="w-full rounded-md bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
          Guardar Cambios
        </button>
        <button type="button" onClick={onCancel} className="w-full rounded-md border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

// Historial auditable con fecha/hora, campo, valor anterior, nuevo valor e IP.
export function HistoryPanel({ historial }: { historial: HistorialContrato[] }) {
  return (
    <DetailCard title="Historial de Cambios" subtitle="Registro de modificaciones del contrato">
      {historial.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="px-3 py-2">Fecha/Hora</th>
                <th className="px-3 py-2">Campo modificado</th>
                <th className="px-3 py-2">Valor Anterior</th>
                <th className="px-3 py-2">Valor Nuevo</th>
                <th className="px-3 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-3 py-3 text-slate-600">{formatDateTime(item.fechaHora)}</td>
                  <td className="px-3 py-3 font-semibold text-slate-950">{item.campo}</td>
                  <td className="px-3 py-3 text-slate-600">{item.valorAnterior}</td>
                  <td className="px-3 py-3 text-slate-600">{item.valorNuevo}</td>
                  <td className="px-3 py-3 text-slate-600">{item.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">Aun no existen cambios registrados para este contrato.</p>
      )}
    </DetailCard>
  );
}
