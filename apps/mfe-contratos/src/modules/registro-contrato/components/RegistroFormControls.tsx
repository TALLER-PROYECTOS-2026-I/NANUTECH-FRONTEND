import type { ReactNode } from 'react';

/**
 * Componentes pequenos y reutilizables del formulario de registro.
 *
 * Este archivo evita que RegistroContratoPage tenga detalles repetidos de inputs,
 * errores, labels y resumenes. No contiene reglas de negocio: solo presentacion.
 */

// Caja informativa usada para explicar secciones del wizard.
export function Callout({
  title,
  children,
  tone,
}: {
  title: string;
  children: string;
  tone: 'blue' | 'amber';
}) {
  const styles =
    tone === 'blue'
      ? 'border-blue-200 bg-blue-50 text-blue-900'
      : 'border-amber-200 bg-amber-50 text-amber-900';

  return (
    <div className={`rounded-lg border p-5 ${styles}`}>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-sm">{children}</p>
    </div>
  );
}

// Tarjeta principal de cada paso, con titulo, subtitulo e icono textual.
export function StepCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-slate-950">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

// Separador con titulo azul usado para dividir bloques dentro de una tarjeta.
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2 text-[11px] font-bold uppercase text-blue-600">
      <span className="h-px flex-1 bg-blue-100" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-blue-100" />
    </div>
  );
}

// Label comun para inputs. Agrega asterisco cuando el campo es obligatorio.
export function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <span className="mb-1.5 block text-sm font-bold">
      {text}
      {required && <span className="text-red-500">*</span>}
    </span>
  );
}

// Input base para texto, fecha o numero, con soporte para helper, error y estado OK.
export function InputField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  helper?: string;
  maxLength?: number;
  required?: boolean;
  success?: boolean;
}) {
  return (
    <label>
      <Label text={props.label} required={props.required} />
      <input
        type={props.type || 'text'}
        value={props.value}
        placeholder={props.placeholder}
        maxLength={props.maxLength}
        onChange={(event) => props.onChange(event.target.value)}
        className={`field-base ${
          props.error
            ? 'border-red-500 focus:ring-red-100'
            : props.success
              ? 'border-emerald-500 focus:ring-emerald-100'
              : 'border-transparent focus:ring-blue-100'
        }`}
      />
      {props.helper && !props.error && (
        <p className={`mt-1.5 text-xs ${props.success ? 'text-emerald-700' : 'text-slate-500'}`}>
          {props.success ? 'OK ' : ''}
          {props.helper}
        </p>
      )}
      {props.error && <ErrorMessage text={props.error} />}
    </label>
  );
}

// Select base para catalogos del formulario, como tipo de servicio y terminales.
export function SelectField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
}) {
  return (
    <label>
      <Label text={props.label} required={props.required} />
      <select
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className={`field-base ${props.error ? 'border-red-500 focus:ring-red-100' : 'border-transparent focus:ring-blue-100'}`}
      >
        {props.options.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {props.error && <ErrorMessage text={props.error} />}
    </label>
  );
}

// Input monetario con prefijo S/. Mantiene el valor como string para inputs controlados.
export function MoneyInput(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
}) {
  return (
    <label>
      <Label text={props.label} required />
      <div
        className={`flex overflow-hidden rounded-lg border bg-slate-100 focus-within:bg-white focus-within:ring-2 ${
          props.error
            ? 'border-red-500 focus-within:ring-red-100'
            : 'border-transparent focus-within:ring-blue-100'
        }`}
      >
        <span className="px-4 py-3 font-semibold text-slate-600">S/</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={props.value}
          placeholder="0.00"
          onChange={(event) => props.onChange(event.target.value)}
          className="w-full border-0 bg-transparent px-2 py-3 outline-none"
        />
      </div>
      {props.helper && !props.error && <p className="mt-1.5 text-xs text-slate-500">{props.helper}</p>}
      {props.error && <ErrorMessage text={props.error} />}
    </label>
  );
}

// Franja informativa compacta, similar a las notas azules de la referencia visual.
export function InlineNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-800">
      {children}
    </div>
  );
}

// Mensaje de error estandarizado para todos los controles.
export function ErrorMessage({ text }: { text: string }) {
  return <p className="mt-1.5 text-sm font-medium text-red-600">! {text}</p>;
}

// Par label/valor usado en el resumen final del contrato.
export function Summary({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={highlight ? 'text-2xl font-bold text-blue-700' : 'font-bold'}>
        {value || '-'}
      </p>
    </div>
  );
}

// Resumen lateral del paso de tarifas, orientado a validar datos antes de registrar.
export function ContractSummaryPanel({
  cliente,
  ruc,
  tipo,
  inicio,
  fin,
  origen,
  destino,
  distancia,
  tarifaKm,
  tarifaHora,
  tarifaEspera,
}: {
  cliente: string;
  ruc: string;
  tipo: string;
  inicio: string;
  fin: string;
  origen: string;
  destino: string;
  distancia: string;
  tarifaKm: string;
  tarifaHora: string;
  tarifaEspera: string;
}) {
  return (
    <aside className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs text-slate-700">
      <p className="font-bold uppercase text-blue-700">Resumen del contrato</p>
      <div className="mt-4 space-y-3">
        <Summary label="Cliente" value={cliente} />
        <Summary label="RUC" value={ruc} />
        <Summary label="Tipo" value={tipo} />
        <Summary label="Inicio" value={inicio} />
        <Summary label="Vence" value={fin} />
        <Summary label="Partida" value={origen} />
        <Summary label="Llegada" value={destino} />
        <Summary label="Distancia" value={distancia ? `${distancia} km` : '-'} />
        <Summary label="Por km" value={tarifaKm ? `S/ ${Number(tarifaKm).toFixed(2)}` : '-'} />
        <Summary label="Hora viaje" value={tarifaHora ? `S/ ${Number(tarifaHora).toFixed(2)}` : '-'} />
        <Summary label="Hora espera" value={tarifaEspera ? `S/ ${Number(tarifaEspera).toFixed(2)}` : '-'} />
      </div>
    </aside>
  );
}

// Wrapper simple para mantener spacing consistente entre pasos del wizard.
export function FormSection({ children }: { children: ReactNode }) {
  return <div className="grid gap-6">{children}</div>;
}
