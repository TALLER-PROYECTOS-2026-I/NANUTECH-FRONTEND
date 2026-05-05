import { useMemo, useState } from 'react';
import { crearContrato, type TipoServicio } from '@nanutech/api-client';

type Props = {
  onBack: () => void;
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

const today = getTodayLocal();

const initialForm: Form = {
  cliente: '',
  ruc: '',
  tipo_servicio: 'POR_VIAJE',
  fecha_inicio: today,
  fecha_fin: '',
  descripcion: '',
  origen: '',
  destino: '',
  distancia_estimada_km: '',
  tarifa_por_km: '',
  tarifa_por_hora: '',
  tarifa_espera: '',
};

export default function RegistroContratoPage({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const tarifaTotal = useMemo(() => {
    return Number(form.distancia_estimada_km || 0) * Number(form.tarifa_por_km || 0);
  }, [form.distancia_estimada_km, form.tarifa_por_km]);

  const update = (field: keyof Form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validarPaso1 = () => {
    const e: Record<string, string> = {};

    if (!form.cliente.trim()) e.cliente = 'Campo obligatorio';
    if (!/^\d{11}$/.test(form.ruc)) e.ruc = 'El RUC debe tener 11 dígitos numéricos';
    if (!form.tipo_servicio) e.tipo_servicio = 'Seleccione un tipo de servicio';
    if (!form.fecha_inicio) e.fecha_inicio = 'Campo obligatorio';
    if (!form.fecha_fin) e.fecha_fin = 'Campo obligatorio';

    if (form.fecha_fin && form.fecha_inicio && form.fecha_fin <= form.fecha_inicio) {
      e.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validarPaso2 = () => {
    const e: Record<string, string> = {};

    if (!form.origen.trim()) e.origen = 'Campo obligatorio';
    if (!form.destino.trim()) e.destino = 'Campo obligatorio';
    if (Number(form.distancia_estimada_km) <= 0) {
      e.distancia_estimada_km = 'La distancia debe ser mayor a 0';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validarPaso3 = () => {
    const e: Record<string, string> = {};

    if (Number(form.tarifa_por_km) <= 0) e.tarifa_por_km = 'Debe ser mayor a 0';
    if (form.tarifa_por_hora === '') e.tarifa_por_hora = 'Campo obligatorio';
    if (Number(form.tarifa_por_hora) < 0) e.tarifa_por_hora = 'No puede ser negativo';
    if (form.tarifa_espera === '') e.tarifa_espera = 'Campo obligatorio';
    if (Number(form.tarifa_espera) < 0) e.tarifa_espera = 'No puede ser negativo';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && validarPaso1()) setStep(2);
    if (step === 2 && validarPaso2()) setStep(3);
  };

  const registrar = async () => {
    if (!validarPaso3()) return;

    setLoading(true);

    try {
      await crearContrato({
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

      onBack();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'No se pudo registrar el contrato');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-8">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3"
        >
          ←
        </button>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">Registro de Contrato</h1>
          <p className="text-slate-600">
            Complete los siguientes pasos para registrar un nuevo contrato
          </p>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <Stepper step={step} />

        {step === 1 && (
          <div className="mt-8 grid gap-6">
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Nombre del Cliente"
                required
                value={form.cliente}
                error={errors.cliente}
                placeholder="Ej: Empresa Constructora ABC S.A.C."
                onChange={(v) => update('cliente', v)}
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
                onChange={(v) => update('ruc', v.replace(/\D/g, '').slice(0, 11))}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <label>
                <Label text="Tipo de Servicio" required />
                <select
                  value={form.tipo_servicio}
                  onChange={(e) => update('tipo_servicio', e.target.value)}
                  className="w-full rounded-lg border-0 bg-slate-100 px-4 py-3 outline-none"
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
                onChange={(v) => update('fecha_inicio', v)}
              />
            </div>

            <Input
              type="date"
              label="Fecha de Fin"
              required
              value={form.fecha_fin}
              error={errors.fecha_fin}
              onChange={(v) => update('fecha_fin', v)}
            />

            <label>
              <Label text="Descripción del Servicio (Opcional)" />
              <textarea
                value={form.descripcion}
                placeholder="Detalles adicionales del servicio..."
                onChange={(e) => update('descripcion', e.target.value)}
                className="h-20 w-full resize-none rounded-lg border-0 bg-slate-100 px-4 py-3 outline-none"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 grid gap-6">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-blue-700">
              <h3 className="font-bold">Información de Ruta</h3>
              <p className="text-sm">
                Estos parámetros se utilizarán como referencia para el monitoreo de la flota y el cálculo de tarifas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Punto de Partida"
                required
                value={form.origen}
                error={errors.origen}
                placeholder="Ej: Av. Lima 123, Lima"
                onChange={(v) => update('origen', v)}
              />

              <Input
                label="Punto de Llegada"
                required
                value={form.destino}
                error={errors.destino}
                placeholder="Ej: Calle Arequipa 456, Callao"
                onChange={(v) => update('destino', v)}
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
              onChange={(v) => update('distancia_estimada_km', v)}
            />

            {form.origen && form.destino && form.distancia_estimada_km && (
              <div className="rounded-xl border border-green-300 bg-green-50 p-5 text-green-700">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold">Vista Previa de Ruta</p>
                    <p>{form.origen} → {form.destino}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Distancia Estimada</p>
                    <p className="text-2xl font-bold">{form.distancia_estimada_km} km</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 grid gap-6">
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-5 text-yellow-800">
              <h3 className="font-bold">Configuración de Tarifas</h3>
              <p className="text-sm">
                Todas las tarifas se guardan en <b>Soles (S/)</b> con dos decimales. La Tarifa Total se calcula como:
                <b> Distancia Estimada × Tarifa por KM</b>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <MoneyInput
                label="Tarifa por KM"
                value={form.tarifa_por_km}
                error={errors.tarifa_por_km}
                helper="Costo por kilómetro recorrido"
                onChange={(v) => update('tarifa_por_km', v)}
              />

              <MoneyInput
                label="Tarifa por Hora"
                value={form.tarifa_por_hora}
                error={errors.tarifa_por_hora}
                helper="Costo por hora de servicio"
                onChange={(v) => update('tarifa_por_hora', v)}
              />

              <MoneyInput
                label="Tarifa por Espera"
                value={form.tarifa_espera}
                error={errors.tarifa_espera}
                helper="Costo por tiempo de espera"
                onChange={(v) => update('tarifa_espera', v)}
              />
            </div>

            {Number(form.tarifa_por_km) > 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-blue-700">
                <p>Cálculo Automático:</p>
                <p className="mt-2">
                  {form.distancia_estimada_km} km × S/ {Number(form.tarifa_por_km).toFixed(2)} /km
                </p>
                <p className="mt-4 text-3xl font-bold">
                  Tarifa Total: S/ {tarifaTotal.toFixed(2)}
                </p>
              </div>
            )}

            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="mb-6 text-lg font-bold">Resumen del Contrato</h3>
              <div className="grid grid-cols-2 gap-6">
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

        <footer className="mt-10 flex items-center justify-between border-t pt-6">
          <button
            disabled={step === 1}
            onClick={() => setStep((prev) => prev - 1)}
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold disabled:opacity-40"
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-4">
            <span className="text-slate-500">Paso {step} de 3</span>

            {step < 3 ? (
              <button
                onClick={next}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
              >
                Siguiente →
              </button>
            ) : (
              <button
                disabled={loading}
                onClick={registrar}
                className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loading ? 'Registrando...' : '💾 Registrar Contrato'}
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
    <div className="grid grid-cols-3 items-start">
      {items.map((item, index) => {
        const number = index + 1;
        const active = step === number;
        const done = step > number;

        return (
          <div key={item} className="relative flex flex-col items-center">
            {index < items.length - 1 && (
              <div
                className={`absolute left-[56%] top-7 h-1 w-[88%] rounded-full ${
                  step > number ? 'bg-green-500' : 'bg-slate-200'
                }`}
              />
            )}

            <div
              className={`z-10 mb-2 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ${
                done
                  ? 'bg-green-500 text-white'
                  : active
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {done ? '✓' : number === 1 ? '📄' : number === 2 ? '📍' : '$'}
            </div>

            <p
              className={`z-10 text-sm font-semibold ${
                done ? 'text-green-600' : active ? 'text-blue-600' : 'text-slate-500'
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

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <span className="mb-1 block text-sm font-bold">
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
        onChange={(e) => props.onChange(e.target.value)}
        className={`w-full rounded-lg border bg-slate-100 px-4 py-3 outline-none focus:ring-2 ${
          props.error
            ? 'border-red-500 focus:ring-red-200'
            : props.success
              ? 'border-green-500 focus:ring-green-200'
              : 'border-transparent focus:ring-blue-300'
        }`}
      />

      {props.helper && !props.error && (
        <p className={`mt-1 text-xs ${props.success ? 'text-green-600' : 'text-slate-500'}`}>
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
        className={`flex rounded-lg border bg-slate-100 ${
          props.error ? 'border-red-500' : 'border-transparent'
        }`}
      >
        <span className="px-4 py-3 font-semibold text-slate-600">S/</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={props.value}
          placeholder="0.00"
          onChange={(e) => props.onChange(e.target.value)}
          className="w-full rounded-r-lg border-0 bg-slate-100 px-2 py-3 outline-none"
        />
      </div>
      {props.helper && <p className="mt-1 text-xs text-slate-500">{props.helper}</p>}
      {props.error && <Error text={props.error} />}
    </label>
  );
}

function Error({ text }: { text: string }) {
  return <p className="mt-1 text-sm text-red-600">ⓘ {text}</p>;
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
      <p className={highlight ? 'text-2xl font-bold text-blue-600' : 'font-bold text-slate-900'}>
        {value || '-'}
      </p>
    </div>
  );
}