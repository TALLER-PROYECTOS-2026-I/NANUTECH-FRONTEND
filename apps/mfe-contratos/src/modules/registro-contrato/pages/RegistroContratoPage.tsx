import { useMemo, useState } from 'react';
import { crearContrato, type Contrato, type TipoServicio } from '@nanutech/api-client';

type Props = {
  onBack: () => void;
  onRegistered?: (contrato: Contrato) => void;
};

type Form = {
  cliente: string;
  ruc: string;
  tipo_servicio: TipoServicio | '';
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  origen: string;
  destino: string;
  distancia_estimada_km: string;
  tarifa_por_km: string;
  tarifa_por_hora: string;
  tarifa_espera: string;
};

const getTodayLocal = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const initialForm: Form = {
  cliente: '',
  ruc: '',
  tipo_servicio: 'POR_VIAJE',
  fecha_inicio: getTodayLocal(),
  fecha_fin: '',
  descripcion: '',
  origen: '',
  destino: '',
  distancia_estimada_km: '',
  tarifa_por_km: '',
  tarifa_por_hora: '',
  tarifa_espera: '',
};

export default function RegistroContratoPage({ onBack, onRegistered }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const tarifaTotal = useMemo(() => {
    return Number(form.distancia_estimada_km || 0) * Number(form.tarifa_por_km || 0);
  }, [form.distancia_estimada_km, form.tarifa_por_km]);

  const update = (field: keyof Form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setNotice('');
  };

  const validarPaso1 = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.cliente.trim()) nextErrors.cliente = 'Campo obligatorio';
    if (!/^\d{11}$/.test(form.ruc)) {
      nextErrors.ruc = 'El RUC debe tener 11 dígitos numéricos';
    }
    if (!form.tipo_servicio) nextErrors.tipo_servicio = 'Seleccione un tipo de servicio';
    if (!form.fecha_inicio) nextErrors.fecha_inicio = 'Campo obligatorio';
    if (!form.fecha_fin) nextErrors.fecha_fin = 'Campo obligatorio';
    if (form.fecha_fin && form.fecha_inicio && form.fecha_fin <= form.fecha_inicio) {
      nextErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validarPaso2 = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.origen.trim()) nextErrors.origen = 'Campo obligatorio';
    if (!form.destino.trim()) nextErrors.destino = 'Campo obligatorio';
    if (Number(form.distancia_estimada_km) <= 0) {
      nextErrors.distancia_estimada_km = 'La distancia debe ser mayor a 0';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validarPaso3 = () => {
    const nextErrors: Record<string, string> = {};

    if (Number(form.tarifa_por_km) <= 0) nextErrors.tarifa_por_km = 'Debe ser mayor a 0';
    if (form.tarifa_por_hora === '') nextErrors.tarifa_por_hora = 'Campo obligatorio';
    if (Number(form.tarifa_por_hora) < 0) nextErrors.tarifa_por_hora = 'No puede ser negativo';
    if (form.tarifa_espera === '') nextErrors.tarifa_espera = 'Campo obligatorio';
    if (Number(form.tarifa_espera) < 0) nextErrors.tarifa_espera = 'No puede ser negativo';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = () => {
    if (step === 1 && validarPaso1()) {
      setStep(2);
      setNotice('Información general validada correctamente');
    }
    if (step === 2 && validarPaso2()) {
      setStep(3);
      setNotice('Ruta de servicio validada correctamente');
    }
  };

  const registrar = async () => {
    if (!validarPaso3()) return;

    setLoading(true);

    try {
      const contrato = await crearContrato({
        cliente: form.cliente.trim(),
        ruc: form.ruc,
        descripcion: form.descripcion.trim() || undefined,
        tipo_servicio: form.tipo_servicio as TipoServicio,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        origen: form.origen.trim(),
        destino: form.destino.trim(),
        distancia_estimada_km: Number(Number(form.distancia_estimada_km).toFixed(2)),
        tarifa_por_km: Number(Number(form.tarifa_por_km).toFixed(2)),
        tarifa_por_hora: Number(Number(form.tarifa_por_hora).toFixed(2)),
        tarifa_espera: Number(Number(form.tarifa_espera).toFixed(2)),
        moneda: 'PEN',
      });

      onRegistered?.(contrato);
      onBack();
    } catch (error) {
      let errorMessage = 'No se pudo registrar el contrato';
      if (error && typeof error === 'object') {
        const err = error as Record<string, unknown>;
        if ('response' in err && err.response && typeof err.response === 'object') {
          const response = err.response as Record<string, unknown>;
          if ('data' in response && response.data && typeof response.data === 'object') {
            const data = response.data as Record<string, unknown>;
            if ('message' in data && typeof data.message === 'string') {
              errorMessage = data.message;
            }
          }
        } else if ('message' in err && typeof err.message === 'string') {
          errorMessage = err.message;
        }
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {notice && (
        <div className="fixed right-4 top-24 z-20 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-lg">
          {notice}
        </div>
      )}

      <header className="mb-6 flex items-start gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver al listado"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-xl text-slate-700 shadow-sm hover:border-blue-300"
        >
          ←
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Registro de Contrato</h1>
          <p className="mt-1 text-slate-600">
            Complete los siguientes pasos para registrar un nuevo contrato
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Stepper step={step} />

        <div className="mt-8 min-h-[430px]">
          {step === 1 && (
            <div className="grid gap-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Input
                  label="Nombre del Cliente"
                  required
                  value={form.cliente}
                  error={errors.cliente}
                  placeholder="Ej: Empresa Constructora ABC S.A.C."
                  onChange={(value) => update('cliente', value)}
                />

                <Input
                  label="RUC"
                  required
                  value={form.ruc}
                  error={errors.ruc}
                  placeholder="11 dígitos numéricos"
                  maxLength={11}
                  helper={
                    form.ruc.length === 11 && !errors.ruc
                      ? 'RUC válido'
                      : `${form.ruc.length}/11 dígitos`
                  }
                  success={form.ruc.length === 11 && !errors.ruc}
                  onChange={(value) => update('ruc', value.replace(/\D/g, '').slice(0, 11))}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <label>
                  <Label text="Tipo de Servicio" required />
                  <select
                    value={form.tipo_servicio}
                    onChange={(event) => update('tipo_servicio', event.target.value)}
                    className="field-base"
                  >
                    <option value="POR_VIAJE">Por Viaje</option>
                    <option value="POR_HORA">Por Hora</option>
                    <option value="POR_TONELADA">Por Tonelada</option>
                    <option value="POR_KM">Por Kilómetro</option>
                    <option value="MENSUAL">Mensual</option>
                  </select>
                  {errors.tipo_servicio && <Error text={errors.tipo_servicio} />}
                </label>

                <Input
                  type="date"
                  label="Fecha de Inicio"
                  required
                  value={form.fecha_inicio}
                  error={errors.fecha_inicio}
                  onChange={(value) => update('fecha_inicio', value)}
                />
              </div>

              <Input
                type="date"
                label="Fecha de Fin"
                required
                value={form.fecha_fin}
                error={errors.fecha_fin}
                onChange={(value) => update('fecha_fin', value)}
              />

              <label>
                <Label text="Descripción del Servicio (Opcional)" />
                <textarea
                  value={form.descripcion}
                  placeholder="Detalles adicionales del servicio..."
                  onChange={(event) => update('descripcion', event.target.value)}
                  className="field-base min-h-20 resize-y"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6">
              <Callout tone="blue" title="Información de Ruta">
                Estos parámetros se utilizarán como referencia para el monitoreo de la flota y el
                cálculo de tarifas.
              </Callout>

              <div className="grid gap-6 lg:grid-cols-2">
                <Input
                  label="Punto de Partida"
                  required
                  value={form.origen}
                  error={errors.origen}
                  placeholder="Ej: Av. Lima 123, Lima"
                  onChange={(value) => update('origen', value)}
                />

                <Input
                  label="Punto de Llegada"
                  required
                  value={form.destino}
                  error={errors.destino}
                  placeholder="Ej: Calle Arequipa 456, Callao"
                  onChange={(value) => update('destino', value)}
                />
              </div>

              <Input
                type="number"
                label="Distancia Estimada (Kilómetros)"
                required
                value={form.distancia_estimada_km}
                error={errors.distancia_estimada_km}
                placeholder="Ej: 25.50"
                helper="Ingrese la distancia estimada entre el punto de partida y llegada"
                onChange={(value) => update('distancia_estimada_km', value)}
              />

              {form.origen && form.destino && form.distancia_estimada_km && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                  <p className="font-bold">Vista previa de ruta</p>
                  <p className="mt-1 text-sm">{form.origen} → {form.destino}</p>
                  <p className="mt-3 text-2xl font-bold">{form.distancia_estimada_km} km</p>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6">
              <Callout tone="amber" title="Configuración de Tarifas">
                Todas las tarifas se guardan en Soles (S/) con dos decimales. La Tarifa Total se
                calcula como: Distancia Estimada × Tarifa por KM.
              </Callout>

              <div className="grid gap-6 xl:grid-cols-3">
                <MoneyInput
                  label="Tarifa por KM"
                  value={form.tarifa_por_km}
                  error={errors.tarifa_por_km}
                  helper="Costo por kilómetro recorrido"
                  onChange={(value) => update('tarifa_por_km', value)}
                />

                <MoneyInput
                  label="Tarifa por Hora"
                  value={form.tarifa_por_hora}
                  error={errors.tarifa_por_hora}
                  helper="Costo por hora de servicio"
                  onChange={(value) => update('tarifa_por_hora', value)}
                />

                <MoneyInput
                  label="Tarifa por Espera"
                  value={form.tarifa_espera}
                  error={errors.tarifa_espera}
                  helper="Costo por tiempo de espera"
                  onChange={(value) => update('tarifa_espera', value)}
                />
              </div>

              {Number(form.tarifa_por_km) > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-blue-900">
                  <p className="font-semibold">Cálculo Automático:</p>
                  <p className="mt-2 text-sm">
                    {form.distancia_estimada_km} km × S/ {Number(form.tarifa_por_km).toFixed(2)} /km
                  </p>
                  <p className="mt-4 text-3xl font-bold">Tarifa Total: S/ {tarifaTotal.toFixed(2)}</p>
                </div>
              )}

              <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-md">
                <h3 className="mb-6 text-lg font-bold">Resumen del Contrato</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <Summary label="Cliente" value={form.cliente} />
                  <Summary label="RUC" value={form.ruc} />
                  <Summary label="Ruta" value={`${form.origen} → ${form.destino}`} />
                  <Summary label="Distancia" value={`${form.distancia_estimada_km} km`} />
                  <Summary label="Vigencia" value={`${form.fecha_inicio} - ${form.fecha_fin}`} />
                  <Summary label="Tarifa Total" value={`S/ ${tarifaTotal.toFixed(2)}`} highlight />
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((currentStep) => currentStep - 1)}
            className="rounded-lg border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:border-blue-300 disabled:opacity-40"
          >
            ← Anterior
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-sm text-slate-500">Paso {step} de 3</span>

            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={registrar}
                className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? 'Registrando...' : 'Registrar Contrato'}
              </button>
            )}
          </div>
        </footer>
      </section>
    </main>
  );
}

function Stepper({ step }: { step: number }) {
  const items = ['Información General', 'Ruta de Servicio', 'Tarifas'];

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {items.map((item, index) => {
        const number = index + 1;
        const active = step === number;
        const done = step > number;

        return (
          <div key={item} className="relative flex flex-col items-center text-center">
            {index < items.length - 1 && (
              <div
                className={`absolute left-[60%] top-6 hidden h-1 w-[80%] rounded-full sm:block ${
                  step > number ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}

            <div
              className={`z-10 grid h-12 w-12 place-items-center rounded-full text-xl font-bold ${
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {done ? '✓' : number === 3 ? '$' : number}
            </div>

            <p
              className={`mt-2 text-xs font-semibold ${
                done ? 'text-emerald-700' : active ? 'text-blue-700' : 'text-slate-500'
              }`}
            >
              {item}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Callout({
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

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <span className="mb-1.5 block text-sm font-bold">
      {text} {required && <span className="text-red-500">*</span>}
    </span>
  );
}

function Input(props: {
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
          {props.success ? '✓ ' : ''}
          {props.helper}
        </p>
      )}
      {props.error && <Error text={props.error} />}
    </label>
  );
}

function MoneyInput(props: {
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
      {props.error && <Error text={props.error} />}
    </label>
  );
}

function Error({ text }: { text: string }) {
  return <p className="mt-1.5 text-sm font-medium text-red-600">ⓘ {text}</p>;
}

function Summary({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={highlight ? 'text-2xl font-bold text-blue-700' : 'font-bold'}>{value || '-'}</p>
    </div>
  );
}
