import type { CamionHu11, PanelCamionesHu11 } from "@nanutech/api-client";

// Construye el resumen, la gráfica y la lista del panel a partir de un arreglo de camiones.
export const crearPanelDesdeCamiones = (camiones: CamionHu11[]): PanelCamionesHu11 => {
  // Suma todas las horas en movimiento para calcular KPIs y porcentajes.
  const horasMovimiento = camiones.reduce((sum, camion) => sum + camion.horas_movimiento, 0);
  // Suma todas las horas detenidas para calcular KPIs y porcentajes.
  const horasDetenido = camiones.reduce((sum, camion) => sum + camion.horas_detenido, 0);
  // Total de horas consideradas en la gráfica.
  const horasTotales = horasMovimiento + horasDetenido;

  // Devuelve la estructura exacta que consume el componente principal.
  return {
    resumen: {
      total_camiones: camiones.length,
      en_uso: camiones.filter((camion) => camion.estado === "EN_JORNADA" || camion.estado === "EN_AUXILIO").length,
      disponibles: camiones.filter((camion) => camion.estado === "DISPONIBLE").length,
      mantenimiento: camiones.filter((camion) => camion.estado === "MANTENIMIENTO").length,
    },
    grafica_movimiento: {
      horas_movimiento: Number(horasMovimiento.toFixed(1)),
      horas_detenido: Number(horasDetenido.toFixed(1)),
      porcentaje_movimiento: horasTotales ? Number(((horasMovimiento / horasTotales) * 100).toFixed(2)) : 0,
      porcentaje_detenido: horasTotales ? Number(((horasDetenido / horasTotales) * 100).toFixed(2)) : 0,
    },
    camiones,
  };
};

