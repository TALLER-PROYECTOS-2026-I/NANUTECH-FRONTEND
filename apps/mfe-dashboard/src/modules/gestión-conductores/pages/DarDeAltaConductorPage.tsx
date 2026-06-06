import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarConductor } from '@nanutech/api-client';
import type { RegistrarConductorPayload } from '@nanutech/api-client';
import { MonitoreoSidebar } from '../../monitoreo-camiones/components/MonitoreoSidebar';
import { ADMIN_ROUTE_PREFIX } from '../../../navigation/adminNav';

// ────────────────────────────────────────────────────────────────────────────────
// Categorías vehiculares (MTC Perú)
// ────────────────────────────────────────────────────────────────────────────────
const CATEGORIAS_VEHICULARES = [
  'A-I', 'A-II-a', 'A-II-b', 'A-III-a', 'A-III-b', 'A-III-c',
  'C', 'D', 'E',
];

// ────────────────────────────────────────────────────────────────────────────────
// Tipos del formulario
// ────────────────────────────────────────────────────────────────────────────────
type FormValues = {
  nombreCompleto: string;
  emailCorporativo: string;
  dni: string;
  telefono: string;
  numeroLicencia: string;
  categoriaVehicular: string;
  fechaVencimiento: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

// ────────────────────────────────────────────────────────────────────────────────
// Estado de la petición al backend
// ────────────────────────────────────────────────────────────────────────────────
type ApiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; conductorId?: string; nombre?: string }
  | { status: 'error'; title: string; message: string; detail?: string };

// ────────────────────────────────────────────────────────────────────────────────
// Validadores onBlur según HU22
// ────────────────────────────────────────────────────────────────────────────────
const validators: Record<keyof FormValues, (v: string) => string | undefined> = {
  nombreCompleto: (v) => {
    if (!v.trim()) return 'El nombre completo es obligatorio.';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(v))
      return 'Solo se permiten letras, tildes, ñ/Ñ y espacios.';
  },
  emailCorporativo: (v) => {
    if (!v.trim()) return 'El email corporativo es obligatorio.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return 'Formato inválido. Ejemplo: usuario@dominio.com';
  },
  dni: (v) => {
    if (!v.trim()) return 'El DNI es obligatorio.';
    if (!/^\d{8}$/.test(v)) return 'El DNI debe tener exactamente 8 dígitos.';
  },
  telefono: (v) => {
    if (!v.trim()) return 'El teléfono es obligatorio.';
    if (!/^\d{9}$/.test(v)) return 'El teléfono debe tener exactamente 9 dígitos.';
  },
  numeroLicencia: (v) => {
    if (!v.trim()) return 'El número de licencia es obligatorio.';
  },
  categoriaVehicular: (v) => {
    if (!v) return 'Seleccione una categoría vehicular.';
  },
  fechaVencimiento: (v) => {
    if (!v) return 'La fecha de vencimiento es obligatoria.';
  },
};

// ────────────────────────────────────────────────────────────────────────────────
// Extrae mensaje de error HTTP (Axios) de forma segura
// ────────────────────────────────────────────────────────────────────────────────
function parseApiError(error: unknown): { title: string; message: string; detail?: string } {
  const e = error as {
    response?: { status?: number; data?: { message?: string; error?: string } };
    message?: string;
    code?: string;
  };

  const status = e.response?.status;
  const apiMsg = e.response?.data?.message ?? e.response?.data?.error;

  if (e.code === 'ERR_NETWORK' || !e.response) {
    return {
      title: 'Sin conexión con el servidor',
      message: 'No se pudo contactar al backend. Verifica que VITE_API_URL esté configurado correctamente.',
      detail: e.message,
    };
  }
  if (status === 409) {
    return {
      title: 'El conductor ya existe',
      message: apiMsg ?? 'Ya existe un conductor registrado con ese DNI o email corporativo.',
    };
  }
  if (status === 400) {
    return {
      title: 'Datos inválidos',
      message: apiMsg ?? 'El backend rechazó el formulario. Revisa los campos e intenta de nuevo.',
    };
  }
  if (status === 401 || status === 403) {
    return {
      title: 'Sin autorización',
      message: 'Tu sesión no tiene permisos para registrar conductores. Inicia sesión como administrador.',
      detail: `HTTP ${status}`,
    };
  }
  return {
    title: `Error del servidor (HTTP ${status ?? '?'})`,
    message: apiMsg ?? 'Ocurrió un error inesperado. Intenta de nuevo en unos momentos.',
    detail: e.message,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// Icono check verde
// ────────────────────────────────────────────────────────────────────────────────
function CheckCircle({ size = 5 }: { size?: number }) {
  return (
    <svg
      className={`h-${size} w-${size} text-green-500 shrink-0`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    >
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Componente de campo de texto reutilizable
// ────────────────────────────────────────────────────────────────────────────────
function FormField({
  id, label, required, value, error, touched, hint,
  onChange, onBlur, placeholder, type = 'text', maxLength, inputMode,
}: {
  id: string; label: string; required?: boolean; value: string; error?: string;
  touched?: boolean; hint?: string; onChange: (v: string) => void; onBlur: () => void;
  placeholder?: string; type?: string; maxLength?: number;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  const isValid = touched && !error && value.trim() !== '';
  const hasError = !!error;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm outline-none transition-all
            ${hasError
              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
              : isValid
              ? 'border-green-400 bg-white focus:ring-2 focus:ring-green-100'
              : 'border-gray-300 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
        />
        {isValid && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle />
          </span>
        )}
      </div>
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Página principal HU22 — conectada al backend real
// ────────────────────────────────────────────────────────────────────────────────
export default function DarDeAltaConductorPage() {
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>({
    nombreCompleto: '',
    emailCorporativo: '',
    dni: '',
    telefono: '',
    numeroLicencia: '',
    categoriaVehicular: '',
    fechaVencimiento: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [apiState, setApiState] = useState<ApiState>({ status: 'idle' });
  const [categoriaOpen, setCategoriaOpen] = useState(false);
  const categoriaRef = useRef<HTMLDivElement>(null);

  // Estado derivado de cuenta según datos ingresados
  const estadoCuenta = values.nombreCompleto && values.emailCorporativo && values.dni ? 'Activo' : '—';

  const handleChange = (field: keyof FormValues, val: string) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    // Limpia error del backend al editar de nuevo
    if (apiState.status === 'error') setApiState({ status: 'idle' });
    if (touched[field]) {
      const err = validators[field](val);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validators[field](values[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const isFieldValid = (field: keyof FormValues) =>
    touched[field] && !errors[field] && values[field].trim() !== '';

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    const newTouched: Partial<Record<keyof FormValues, boolean>> = {};
    let valid = true;
    (Object.keys(validators) as (keyof FormValues)[]).forEach((field) => {
      newTouched[field] = true;
      const err = validators[field](values[field]);
      if (err) { newErrors[field] = err; valid = false; }
    });
    setTouched(newTouched);
    setErrors(newErrors);
    return valid;
  };

  // ── Envío al backend ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateAll()) return;

    setApiState({ status: 'loading' });

    const payload: RegistrarConductorPayload = {
      nombreCompleto: values.nombreCompleto.trim(),
      email: values.emailCorporativo.trim().toLowerCase(),
      dni: values.dni.trim(),
      telefono: values.telefono.trim(),
      numeroLicencia: values.numeroLicencia.trim().toUpperCase(),
      categoria: values.categoriaVehicular,
      fechaVencimiento: values.fechaVencimiento,
    };

    try {
      const res = await registrarConductor(payload);
      setApiState({
        status: 'success',
        conductorId: res.data?.id ?? res.data?.conductorId,
        nombre: res.data?.nombre ?? values.nombreCompleto,
      });
      // Redirige al panel después de 2 segundos para que el usuario vea el éxito
      setTimeout(() => navigate(`${ADMIN_ROUTE_PREFIX}/conductores`), 2000);
    } catch (error) {
      const parsed = parseApiError(error);
      setApiState({ status: 'error', ...parsed });
      // Scroll al tope para que vea el banner de error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => navigate(`${ADMIN_ROUTE_PREFIX}/conductores`);

  const isLoading = apiState.status === 'loading';
  const isSuccess = apiState.status === 'success';

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <MonitoreoSidebar />

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Conductores</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('es-PE', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-blue-500">Última actualización</p>
            <p className="text-sm font-semibold text-gray-800">
              {new Date().toLocaleTimeString('es-PE')}
            </p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6 max-w-3xl">
          {/* Breadcrumb */}
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver a Conductores (HU10)
          </button>

          <p className="text-xs font-semibold text-blue-500 mb-1 tracking-wide">NANU TECH · HU22</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Dar de Alta Nuevo Conductor</h2>
          <p className="text-sm text-gray-500 mb-6">
            Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios.
          </p>

          {/* ── Banner de éxito ── */}
          {isSuccess && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-800 shadow-sm animate-pulse">
              <CheckCircle size={6} />
              <div>
                <p className="font-bold text-sm">
                  ✅ Conductor registrado exitosamente
                  {apiState.status === 'success' && apiState.conductorId && (
                    <span className="ml-2 text-xs font-normal text-green-600">
                      ID: {apiState.conductorId}
                    </span>
                  )}
                </p>
                <p className="text-xs mt-0.5">
                  {apiState.status === 'success' && apiState.nombre
                    ? `"${apiState.nombre}" ha sido dado de alta en el sistema.`
                    : 'El conductor ha sido registrado correctamente.'}
                  {' '}Redirigiendo al panel...
                </p>
              </div>
            </div>
          )}

          {/* ── Banner de error del backend ── */}
          {apiState.status === 'error' && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 shadow-sm">
              <svg className="h-5 w-5 shrink-0 text-red-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{apiState.title}</p>
                <p className="text-xs mt-0.5">{apiState.message}</p>
                {apiState.detail && (
                  <p className="mt-1 text-[11px] font-mono text-red-600 bg-red-100 rounded px-2 py-1 break-all">
                    {apiState.detail}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setApiState({ status: 'idle' })}
                className="shrink-0 text-red-400 hover:text-red-600 transition"
                aria-label="Cerrar"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* ── Sección 1: Datos Personales ── */}
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
              <h3 className="text-base font-bold text-gray-900">Datos Personales</h3>
            </div>

            <div className="px-6 py-5 grid gap-5">
              {/* Nombre Completo */}
              <FormField
                id="nombreCompleto"
                label="Nombre Completo"
                required
                value={values.nombreCompleto}
                error={errors.nombreCompleto}
                touched={touched.nombreCompleto}
                placeholder="Roberto Alonso Quispe Herrera"
                onChange={(v) => handleChange('nombreCompleto', v)}
                onBlur={() => handleBlur('nombreCompleto')}
              />

              {/* Email + DNI */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  id="emailCorporativo"
                  label="Email Corporativo"
                  required
                  type="email"
                  value={values.emailCorporativo}
                  error={errors.emailCorporativo}
                  touched={touched.emailCorporativo}
                  placeholder="roberto.quispe@nanutech.com"
                  onChange={(v) => handleChange('emailCorporativo', v)}
                  onBlur={() => handleBlur('emailCorporativo')}
                />
                <div>
                  <FormField
                    id="dni"
                    label="DNI"
                    required
                    inputMode="numeric"
                    maxLength={8}
                    value={values.dni}
                    error={errors.dni}
                    touched={touched.dni}
                    placeholder="72345819"
                    onChange={(v) => handleChange('dni', v.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('dni')}
                  />
                  <p className={`mt-1 text-xs ${values.dni.length === 8 ? 'text-green-500 font-semibold' : 'text-gray-400'}`}>
                    {values.dni.length}/8 dígitos
                  </p>
                </div>
              </div>

              {/* Teléfono */}
              <div className="max-w-xs">
                <FormField
                  id="telefono"
                  label="Teléfono"
                  required
                  inputMode="numeric"
                  maxLength={9}
                  value={values.telefono}
                  error={errors.telefono}
                  touched={touched.telefono}
                  placeholder="958712340"
                  onChange={(v) => handleChange('telefono', v.replace(/\D/g, ''))}
                  onBlur={() => handleBlur('telefono')}
                />
                <p className={`mt-1 text-xs ${values.telefono.length === 9 ? 'text-green-500 font-semibold' : 'text-gray-400'}`}>
                  {values.telefono.length}/9 dígitos
                </p>
              </div>
            </div>
          </div>

          {/* ── Sección 2: Información Inicial de Licencia ── */}
          <div className="mb-5 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">2</span>
              <h3 className="text-base font-bold text-gray-900">Información Inicial de Licencia</h3>
            </div>

            <div className="px-6 py-5 grid grid-cols-3 gap-4">
              {/* Número de Licencia */}
              <FormField
                id="numeroLicencia"
                label="Número de Licencia"
                required
                value={values.numeroLicencia}
                error={errors.numeroLicencia}
                touched={touched.numeroLicencia}
                placeholder="Q07234512"
                onChange={(v) => handleChange('numeroLicencia', v.toUpperCase())}
                onBlur={() => handleBlur('numeroLicencia')}
              />

              {/* Categoría Vehicular — dropdown custom */}
              <div ref={categoriaRef} className="relative">
                <label htmlFor="categoriaVehicular" className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Categoría Vehicular <span className="text-red-500">*</span>
                </label>
                <button
                  id="categoriaVehicular"
                  type="button"
                  onClick={() => setCategoriaOpen((o) => !o)}
                  onBlur={() => {
                    setTimeout(() => {
                      setCategoriaOpen(false);
                      handleBlur('categoriaVehicular');
                    }, 150);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm outline-none transition-all text-left
                    ${errors.categoriaVehicular && touched.categoriaVehicular
                      ? 'border-red-400 bg-red-50'
                      : isFieldValid('categoriaVehicular')
                      ? 'border-green-400 bg-white'
                      : 'border-gray-300 bg-white hover:border-blue-400'}`}
                >
                  <span className={values.categoriaVehicular ? 'text-gray-900' : 'text-gray-400'}>
                    {values.categoriaVehicular || 'Seleccionar'}
                  </span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${categoriaOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {categoriaOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                    <div className="max-h-52 overflow-y-auto py-1">
                      {CATEGORIAS_VEHICULARES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onMouseDown={() => {
                            handleChange('categoriaVehicular', cat);
                            setCategoriaOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          {cat}
                          {values.categoriaVehicular === cat && (
                            <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {errors.categoriaVehicular && touched.categoriaVehicular && (
                  <p className="mt-1 text-xs text-red-500">{errors.categoriaVehicular}</p>
                )}
              </div>

              {/* Fecha de Vencimiento */}
              <FormField
                id="fechaVencimiento"
                label="Fecha de Vencimiento"
                required
                type="date"
                value={values.fechaVencimiento}
                error={errors.fechaVencimiento}
                touched={touched.fechaVencimiento}
                onChange={(v) => handleChange('fechaVencimiento', v)}
                onBlur={() => handleBlur('fechaVencimiento')}
              />
            </div>

            {/* Barra de estado inferior */}
            <div className="grid grid-cols-3 divide-x divide-gray-200 border-t border-gray-100 bg-gray-50">
              <div className="px-6 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Estado de Cuenta</p>
                <p className={`text-sm font-semibold ${estadoCuenta === 'Activo' ? 'text-gray-800' : 'text-gray-400'}`}>
                  {estadoCuenta}
                </p>
              </div>
              <div className="px-6 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Estado Operacional</p>
                <p className="text-sm font-semibold text-green-600">Disponible</p>
              </div>
              <div className="px-6 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Camión Asignado</p>
                <p className="text-sm font-semibold text-gray-400">Sin asignar</p>
              </div>
            </div>
          </div>

          {/* ── Footer: botones ── */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-400">
              <span className="text-red-500 font-bold">*</span> Campos obligatorios
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                id="btn-cancelar-alta"
                onClick={handleCancel}
                disabled={isLoading || isSuccess}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-registrar-conductor"
                onClick={handleSubmit}
                disabled={isLoading || isSuccess}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-60 shadow-sm"
              >
                {isLoading && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                    <path d="M22 12a10 10 0 00-10-10" />
                  </svg>
                )}
                {isLoading ? 'Registrando...' : isSuccess ? '¡Registrado! ✓' : 'Registrar Conductor'}
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
