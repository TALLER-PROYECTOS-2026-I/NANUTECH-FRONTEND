// Formatea números con configuración regional peruana.
export function formatNumber(value: number, decimals = 1) {
  return new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number(value || 0));
}

