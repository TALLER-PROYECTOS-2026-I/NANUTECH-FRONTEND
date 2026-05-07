import type { CamionHu11 } from "@nanutech/api-client";

// Escapa valores para evitar romper columnas cuando se genera CSV local.
function csvValue(value: unknown) {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replaceAll('"', '""')}"`;
}

// Genera un CSV local cuando la descarga desde backend falla.
export function buildCsv(camiones: CamionHu11[]) {
  const headers = [
    "ID",
    "Placa",
    "Marca",
    "Modelo",
    "Año",
    "Capacidad (ton)",
    "Estado",
    "VIN",
    "Color",
    "GPS",
    "Kilometraje",
    "Fecha de Registro",
    "Último Mantenimiento",
    "Próximo Mantenimiento",
  ];

  const rows = camiones.map((camion) => [
    camion.id,
    camion.placa,
    camion.marca,
    camion.modelo,
    camion.anio,
    camion.capacidad_ton,
    camion.estado,
    camion.vin,
    camion.color,
    camion.gps_habilitado ? "SI" : "NO",
    camion.kilometros_totales || camion.kilometraje_actual || 0,
    camion.fecha_registro,
    camion.ultima_fecha_mantenimiento || "",
    camion.proxima_fecha_mantenimiento || "",
  ]);

  return [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
}

// Dispara la descarga del CSV en el navegador.
export function downloadCsv(csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "camiones.csv";
  link.click();
  URL.revokeObjectURL(url);
}
