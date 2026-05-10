import { Icon } from "./Icon";

type KpiCardProps = {
  label: string;
  value: number;
  tone: "blue" | "green" | "orange";
  icon: string;
};

// Tarjeta pequeña usada para mostrar un indicador numérico del panel.
export function KpiCard({ label, value, tone, icon }: KpiCardProps) {
  // Mapa de colores disponible para el fondo e icono del KPI.
  const toneClass: Record<KpiCardProps["tone"], string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${toneClass[tone]}`}>
        <Icon name={icon} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${tone === "orange" ? "text-orange-600" : tone === "green" ? "text-green-600" : "text-blue-600"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

