// Opciones del selector de estado para filtrar la flota.
export const estadoOptions = [
  { label: "Todos", value: "TODOS" },
  { label: "Disponibles", value: "DISPONIBLE" },
  { label: "En Uso", value: "EN_JORNADA" },
  { label: "Mantenimiento", value: "MANTENIMIENTO" },
];

// Traduce estados técnicos del backend a texto legible para el usuario.
export const estadoLabel: Record<string, string> = {
  DISPONIBLE: "Disponible",
  EN_JORNADA: "En Uso",
  EN_AUXILIO: "En Uso",
  MANTENIMIENTO: "Mantenimiento",
  INACTIVA: "Inactivo",
};

// Define el color visual de cada estado en las tarjetas.
export const estadoBadgeClass: Record<string, string> = {
  DISPONIBLE: "bg-green-500 text-white",
  EN_JORNADA: "bg-blue-600 text-white",
  EN_AUXILIO: "bg-blue-600 text-white",
  MANTENIMIENTO: "bg-orange-500 text-white",
  INACTIVA: "bg-slate-400 text-white",
};

