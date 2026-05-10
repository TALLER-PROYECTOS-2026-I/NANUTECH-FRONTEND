type RegistrationToastProps = {
  placa: string;
  modelo: string;
};

// Toast temporal de confirmación; se muestra luego de registrar un camión.
export function RegistrationToast({ placa, modelo }: RegistrationToastProps) {
  return (
    <div
      role="status"
      className="fixed right-6 top-6 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
    >
      <p className="text-sm font-bold text-gray-900">¡Camión registrado con éxito!</p>
      <p className="mt-1 text-xs text-gray-500">
        {placa} · {modelo} fue agregado al sistema.
      </p>
    </div>
  );
}

