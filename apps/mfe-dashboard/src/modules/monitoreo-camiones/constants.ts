// Opciones visibles en el menú lateral de esta pantalla.
export const menuItems = [
  { label: "Dashboard Admin", path: "/dashboard", icon: "grid" },
  { label: "Alertas y Emergencias", path: "/alertas", icon: "alert" },
  { label: "Camiones", path: "/camiones", icon: "truck" },
  { label: "Conductores", path: "/conductores", icon: "user" },
  { label: "GPS", path: "/gps", icon: "pin" },
  { label: "Tracking GPS", path: "/tracking", icon: "route" },
  { label: "Registro Jornadas", path: "/RegistroNuevaJornada", icon: "clock" },
  { label: "Auditoría", path: "/auditoria", icon: "shield" },
];

// Opciones del selector de estado para filtrar la flota.
export const estadoOptions = [
  { label: "Todos los estados", value: "TODOS" },
  { label: "En Uso", value: "EN_JORNADA" },
  { label: "Disponible", value: "DISPONIBLE" },
  { label: "Mantenimiento", value: "MANTENIMIENTO" },
  { label: "Inactivo", value: "INACTIVA" },
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

