import type { FormEvent } from "react";
import type { FormState } from "../types";
import { FormInput } from "./FormInput";
import { Icon } from "./Icon";

type RegistrationModalProps = {
  form: FormState;
  error: string;
  onChange: (field: keyof FormState, value: string | boolean) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

// Modal con el formulario completo de registro de camiones.
export function RegistrationModal({ form, error, onChange, onClose, onSubmit }: RegistrationModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Icon name="truck" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Registrar Nuevo Camión</h2>
              <p className="text-xs text-gray-500">Completa todos los datos requeridos del vehículo</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-700">
            ×
          </button>
        </div>

        <h3 className="mb-3 text-sm font-bold text-gray-900">Información Básica</h3>
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="ID" value={form.id} onChange={(value) => onChange("id", value)} placeholder="unidad-001" />
          <FormInput label="Placa *" value={form.placa} onChange={(value) => onChange("placa", value)} placeholder="ABC-123" />
          <FormInput label="Marca *" value={form.marca} onChange={(value) => onChange("marca", value)} placeholder="Volvo, Scania..." />
          <FormInput label="Modelo *" value={form.modelo} onChange={(value) => onChange("modelo", value)} placeholder="FH16, R450..." />
          <FormInput label="Año *" type="number" value={form.anio} onChange={(value) => onChange("anio", value)} />
          <FormInput label="Capacidad (toneladas) *" type="number" value={form.capacidad_ton} onChange={(value) => onChange("capacidad_ton", value)} placeholder="28" />
          <FormInput label="VIN *" value={form.vin} onChange={(value) => onChange("vin", value)} placeholder="VIN único" />
          <FormInput label="Color *" value={form.color} onChange={(value) => onChange("color", value)} placeholder="Blanco, Rojo..." />
        </div>

        <h3 className="mb-3 mt-5 text-sm font-bold text-gray-900">Información Técnica</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-gray-700">
            Tipo de Combustible
            <select
              value={form.combustible}
              onChange={(event) => onChange("combustible", event.target.value)}
              className="h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal outline-none focus:border-blue-500"
            >
              <option value="DIESEL">Diesel</option>
              <option value="GASOLINA">Gasolina</option>
              <option value="GNV">GNV</option>
              <option value="GLP">GLP</option>
              <option value="ELECTRICO">Eléctrico</option>
              <option value="HIBRIDO">Híbrido</option>
            </select>
          </label>
          <FormInput label="Fecha de Registro" type="date" value={form.fecha_registro} onChange={(value) => onChange("fecha_registro", value)} />
          <FormInput label="Kilometraje Actual" type="number" value={form.kilometraje_actual} onChange={(value) => onChange("kilometraje_actual", value)} />
        </div>

        <h3 className="mb-3 mt-5 text-sm font-bold text-gray-900">Configuración GPS</h3>
        <label className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.gps}
            onChange={(event) => onChange("gps", event.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="block font-semibold">Habilitar GPS</span>
            <span className="text-xs text-gray-500">El camión quedará disponible para ser monitoreado en el sistema GPS.</span>
          </span>
        </label>

        <label className="mt-3 flex flex-col gap-1 text-xs font-semibold text-gray-700">
          Notas Adicionales
          <textarea
            value={form.notas}
            onChange={(event) => onChange("notas", event.target.value)}
            placeholder="Información adicional sobre el camión..."
            className="min-h-20 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-normal outline-none focus:border-blue-500"
          />
        </label>

        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-700">
          <strong>Estado Inicial: Disponible.</strong> El camión será registrado con estado Disponible y estará listo para asignar a conductores.
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
            Cancelar
          </button>
          <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Registrar Camión
          </button>
        </div>
      </form>
    </div>
  );
}

