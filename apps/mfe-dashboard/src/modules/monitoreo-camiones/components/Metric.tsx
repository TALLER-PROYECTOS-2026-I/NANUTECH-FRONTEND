type MetricProps = {
  label: string;
  value: string;
  tone: "purple" | "blue" | "green" | "orange" | "sky";
  wide?: boolean;
};

// Bloque visual reutilizable para una métrica dentro de TruckCard.
export function Metric({ label, value, tone, wide = false }: MetricProps) {
  // Mapa de estilos por tono visual.
  const toneClass: Record<MetricProps["tone"], string> = {
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <div className={`rounded-md border p-3 ${toneClass[tone]} ${wide ? "col-span-2" : ""}`}>
      <p className="text-[11px] font-semibold">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

