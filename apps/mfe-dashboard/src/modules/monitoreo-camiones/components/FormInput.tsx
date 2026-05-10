type FormInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
};

// Input controlado reutilizable para el formulario.
export function FormInput({ label, value, onChange, type = "text", placeholder }: FormInputProps) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-gray-700">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal outline-none focus:border-blue-500"
      />
    </label>
  );
}

