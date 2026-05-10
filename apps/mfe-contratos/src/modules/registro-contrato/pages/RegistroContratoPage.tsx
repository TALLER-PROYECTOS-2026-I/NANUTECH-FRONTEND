import { useMemo, useState } from 'react';
import { crearContrato } from '@nanutech/api-client';
import {
  ContractSummaryPanel,
  InlineNotice,
  InputField,
  Label,
  MoneyInput,
  SectionTitle,
  SelectField,
  StepCard,
} from '../components/RegistroFormControls';
import { Stepper } from '../components/Stepper';
import { initialRegistroContratoForm, terminalOptions, tipoServicioOptions } from '../constants';
import type {
  RegistroContratoErrors,
  RegistroContratoForm,
  RegistroContratoPageProps,
  RegistroContratoSuccess,
} from '../types';
import { buildCrearContratoPayload, getRegistroTarifaTotal } from '../utils/registroContratoMapper';
import {
  hasErrors,
  validateGeneralStep,
  validateRatesStep,
  validateRouteStep,
} from '../utils/registroContratoValidators';

/**
 * HU Registro de Contrato Comercial.
 *
 * Esta pagina es el entregable principal de la historia:
 * 1. Captura datos generales del cliente y vigencia.
 * 2. Captura parametros de ruta que luego usara monitoreo/GPS.
 * 3. Captura tarifas, calcula tarifa total y registra el contrato en el API.
 */
export default function RegistroContratoPage({ onBack, onRegistered }: RegistroContratoPageProps) {
  // Paso actual del wizard: 1 datos generales, 2 ruta de servicio, 3 reglas de tarifa.
  const [step, setStep] = useState(1);

  // Estado controlado de todos los campos del formulario.
  const [form, setForm] = useState<RegistroContratoForm>(initialRegistroContratoForm);

  // Errores por campo, poblados por los validadores del modulo.
  const [errors, setErrors] = useState<RegistroContratoErrors>({});

  // Estado de guardado para deshabilitar el boton mientras responde el backend.
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Contrato registrado. Si existe, se muestra la pantalla final de exito.
  const [registeredContrato, setRegisteredContrato] = useState<RegistroContratoSuccess | null>(null);

  // Tarifa total de la HU: Distancia Estimada x Tarifa por KM.
  const tarifaTotal = useMemo(() => getRegistroTarifaTotal(form), [form]);

  // Etiqueta legible del tipo de servicio para mostrar en el resumen lateral.
  const tipoServicioLabel =
    tipoServicioOptions.find((option) => option.value === form.tipo_servicio)?.label || '-';

  /**
   * Actualiza cualquier campo del formulario y limpia su error puntual.
   * Mantiene feedback inmediato sin borrar errores de otros campos.
   */
  const update = (field: keyof RegistroContratoForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  /**
   * Avanza al siguiente paso solo si el paso actual cumple sus criterios.
   */
  const next = () => {
    const nextErrors = step === 1 ? validateGeneralStep(form) : validateRouteStep(form);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) return;

    setStep((currentStep) => currentStep + 1);
  };

  /**
   * Registra el contrato en backend usando POST /contratos.
   * Devuelve el contrato creado a App.tsx mediante onRegistered.
   */
  const registrar = async () => {
    const nextErrors = validateRatesStep(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const contrato = await crearContrato(buildCrearContratoPayload(form));
      setRegisteredContrato({
        id: contrato.id,
        codigo: contrato.codigo,
        estado: contrato.estado,
      });
      onRegistered?.(contrato);
    } catch (error) {
      const apiError = error as {
        response?: { data?: { message?: string; mensaje?: string } };
        message?: string;
      };
      setSubmitError(
        apiError.response?.data?.message ||
          apiError.response?.data?.mensaje ||
          apiError.message ||
          'No se pudo registrar el contrato en el backend'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reinicia la HU para registrar otro contrato sin salir de la pagina.
   */
  const startNewContract = () => {
    setStep(1);
    setForm(initialRegistroContratoForm);
    setErrors({});
    setRegisteredContrato(null);
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      {/* Breadcrumb y titulo orientados a la HU. */}
      <header>
        <p className="text-xs font-semibold text-blue-700">Contratos / Nuevo Contrato</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">Registrar Nuevo Contrato</h1>
        <p className="mt-1 text-sm text-slate-500">
          HU16 - Complete los 3 pasos para crear el contrato y configurar tarifas
        </p>
      </header>

      {/* El stepper queda visible incluso en la pantalla final para mostrar el proceso completo. */}
      <Stepper step={registeredContrato ? 4 : step} />

      {registeredContrato ? (
        <SuccessState
          contrato={registeredContrato}
          onCreateAnother={startNewContract}
          onViewContracts={onBack}
        />
      ) : (
        <>
          {/* Paso 1: cumple criterio de aceptacion 1. */}
          {step === 1 && (
            <StepCard
              icon="ID"
              title="Datos Generales del Contrato"
              subtitle="Informacion del cliente y tipo de servicio"
            >
              <div className="space-y-6">
                <SectionTitle>Informacion del cliente</SectionTitle>

                <InputField
                  label="Nombre del Cliente"
                  required
                  value={form.cliente}
                  error={errors.cliente}
                  placeholder="Ej: Distribuidora Nacional S.A.C."
                  onChange={(value) => update('cliente', value)}
                />

                <div className="grid gap-5 lg:grid-cols-2">
                  <InputField
                    label="RUC"
                    required
                    value={form.ruc}
                    error={errors.ruc}
                    placeholder="Ej: 20123456789"
                    maxLength={11}
                    helper={
                      form.ruc.length === 11 && !errors.ruc
                        ? 'RUC valido'
                        : `${form.ruc.length}/11 digitos`
                    }
                    success={form.ruc.length === 11 && !errors.ruc}
                    onChange={(value) => update('ruc', value.replace(/\D/g, '').slice(0, 11))}
                  />

                  <SelectField
                    label="Tipo de Servicio"
                    required
                    value={form.tipo_servicio}
                    options={tipoServicioOptions}
                    error={errors.tipo_servicio}
                    onChange={(value) => update('tipo_servicio', value)}
                  />
                </div>

                <SectionTitle>Vigencia del contrato</SectionTitle>

                <div className="grid gap-5 lg:grid-cols-2">
                  <InputField
                    type="date"
                    label="Fecha de Inicio"
                    required
                    value={form.fecha_inicio}
                    error={errors.fecha_inicio}
                    onChange={(value) => update('fecha_inicio', value)}
                  />

                  <InputField
                    type="date"
                    label="Fecha de Vencimiento"
                    required
                    value={form.fecha_fin}
                    error={errors.fecha_fin}
                    onChange={(value) => update('fecha_fin', value)}
                  />
                </div>

                <InlineNotice>
                  Todos los campos marcados con * son obligatorios. El sistema validara el RUC y las fechas antes de avanzar.
                </InlineNotice>
              </div>
            </StepCard>
          )}

          {/* Paso 2: cumple criterio de aceptacion 2. */}
          {step === 2 && (
            <StepCard
              icon="PIN"
              title="Configuracion de Ruta de Servicio"
              subtitle="Define el origen, destino y distancia de la ruta"
            >
              <div className="space-y-6">
                <SectionTitle>Puntos de ruta</SectionTitle>

                <div className="grid gap-5 lg:grid-cols-2">
                  <SelectField
                    label="Punto de Partida"
                    required
                    value={form.origen}
                    options={terminalOptions}
                    error={errors.origen}
                    onChange={(value) => update('origen', value)}
                  />

                  <SelectField
                    label="Punto de Llegada"
                    required
                    value={form.destino}
                    options={terminalOptions}
                    error={errors.destino}
                    onChange={(value) => update('destino', value)}
                  />
                </div>

                <SectionTitle>Parametros de ruta</SectionTitle>

                <div className="grid gap-5 lg:grid-cols-2">
                  <InputField
                    type="number"
                    label="Distancia Estimada"
                    required
                    value={form.distancia_estimada_km}
                    error={errors.distancia_estimada_km}
                    placeholder="0"
                    helper="Este valor se usara para detectar desvios de ruta via GPS"
                    onChange={(value) => update('distancia_estimada_km', value)}
                  />

                  <InputField
                    type="number"
                    label="Tiempo Estimado de Viaje"
                    value={form.tiempo_estimado_horas}
                    placeholder="0"
                    helper="Referencia orientativa, no obligatoria"
                    onChange={(value) => update('tiempo_estimado_horas', value)}
                  />
                </div>

                <label>
                  <Label text="Observaciones de Ruta" />
                  <textarea
                    value={form.observaciones_ruta}
                    placeholder="Ej: Ruta pasa por peaje Variante de Pasamayo..."
                    onChange={(event) => update('observaciones_ruta', event.target.value)}
                    className="field-base min-h-24 resize-y"
                  />
                </label>

                <InlineNotice>
                  La distancia estimada se cruzara en tiempo real con los datos del modulo GPS para generar alertas automaticas.
                </InlineNotice>
              </div>
            </StepCard>
          )}

          {/* Paso 3: cumple criterio de aceptacion 3 y reglas de negocio de tarifas. */}
          {step === 3 && (
            <StepCard
              icon="S/"
              title="Definicion de Reglas de Tarifa"
              subtitle="Configura las tarifas en Soles (S/) con hasta 2 decimales"
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
                <div className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-3">
                    <MoneyInput
                      label="Tarifa por KM"
                      value={form.tarifa_por_km}
                      error={errors.tarifa_por_km}
                      helper="S/ por kilometro"
                      onChange={(value) => update('tarifa_por_km', value)}
                    />

                    <MoneyInput
                      label="Tarifa por Hora"
                      value={form.tarifa_por_hora}
                      error={errors.tarifa_por_hora}
                      helper="S/ por hora de viaje"
                      onChange={(value) => update('tarifa_por_hora', value)}
                    />

                    <MoneyInput
                      label="Tarifa por Espera"
                      value={form.tarifa_espera}
                      error={errors.tarifa_espera}
                      helper="S/ por hora de espera"
                      onChange={(value) => update('tarifa_espera', value)}
                    />
                  </div>

                  <InlineNotice>
                    Las tarifas se registran en Soles (S/) y aceptan hasta 2 decimales. Al guardar se generara un ID unico y estado Activo.
                  </InlineNotice>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-blue-900">
                    <p className="text-sm font-semibold">Tarifa Total inicial</p>
                    <p className="mt-2 text-sm">
                      {form.distancia_estimada_km || 0} km x S/ {Number(form.tarifa_por_km || 0).toFixed(2)} por km
                    </p>
                    <p className="mt-4 text-3xl font-bold">S/ {tarifaTotal.toFixed(2)}</p>
                  </div>
                </div>

                <ContractSummaryPanel
                  cliente={form.cliente}
                  ruc={form.ruc}
                  tipo={tipoServicioLabel}
                  inicio={form.fecha_inicio}
                  fin={form.fecha_fin}
                  origen={form.origen}
                  destino={form.destino}
                  distancia={form.distancia_estimada_km}
                  tarifaKm={form.tarifa_por_km}
                  tarifaHora={form.tarifa_por_hora}
                  tarifaEspera={form.tarifa_espera}
                />
              </div>
            </StepCard>
          )}

          {/* Navegacion del wizard: cancelar, anterior, siguiente y registrar. */}
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {submitError}
            </div>
          )}

          <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((currentStep) => currentStep - 1)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300"
                >
                  {'<-'} Anterior
                </button>
              )}
              <button type="button" onClick={onBack} className="px-3 py-2 text-sm font-semibold text-red-600">
                x Cancelar
              </button>
            </div>

            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Siguiente: {step === 1 ? 'Ruta de Servicio' : 'Reglas de Tarifa'} {'->'}
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={registrar}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Registrando...' : 'Registrar Contrato'}
              </button>
            )}
          </footer>
        </>
      )}
    </main>
  );
}

function SuccessState({
  contrato,
  onCreateAnother,
  onViewContracts,
}: {
  contrato: RegistroContratoSuccess;
  onCreateAnother: () => void;
  onViewContracts: () => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
        OK
      </div>
      <h2 className="mt-6 text-2xl font-bold text-slate-950">Contrato registrado exitosamente</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        El contrato ha sido creado en el backend y esta disponible para asociar jornadas y registrar kilometrajes.
      </p>

      <div className="mx-auto mt-6 inline-flex items-center gap-5 rounded-lg border border-blue-200 bg-blue-50 px-6 py-4">
        <div className="text-left">
          <p className="text-[10px] font-bold uppercase text-blue-700">ID de contrato generado</p>
          <p className="text-xl font-bold text-blue-700">{contrato.codigo || contrato.id}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          {contrato.estado || 'Activo'}
        </span>
      </div>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCreateAnother}
          className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300"
        >
          + Nuevo Contrato
        </button>
        <button
          type="button"
          onClick={onViewContracts}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Ver todos los contratos
        </button>
      </div>
    </section>
  );
}
