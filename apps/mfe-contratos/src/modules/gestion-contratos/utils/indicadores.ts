import type { Contrato, ContratosIndicadores } from '@nanutech/api-client';
import type { ContratoConUnidades } from '../types';

// Normaliza contratos sin estado explicito para que filtros e indicadores sean consistentes.
export const getNormalizedEstado = (contrato: Contrato) => {
  if (contrato.estado) return contrato.estado;
  return contrato.activo === false ? 'INACTIVO' : 'VIGENTE';
};

// Define que contratos cuentan como vigentes para indicadores y camiones asignados.
export const isActiveContract = (contrato: Contrato) => {
  const estado = getNormalizedEstado(contrato);
  return estado === 'VIGENTE' || estado === 'ACTIVO';
};

// Construye indicadores desde la lista local cuando el endpoint de indicadores no responde.
export const buildIndicadoresFromContratos = (contratos: ContratoConUnidades[]): ContratosIndicadores => {
  const estados = new Map<string, number>();
  const tipos = new Map<string, number>();
  const unidades = new Set<string>();
  let fallbackCamionesAsignados = 0;

  contratos.forEach((contrato) => {
    const estado = getNormalizedEstado(contrato);
    estados.set(estado, (estados.get(estado) || 0) + 1);
    tipos.set(contrato.tipo_servicio, (tipos.get(contrato.tipo_servicio) || 0) + 1);

    if (isActiveContract(contrato)) {
      if (contrato.unidad_ids?.length) {
        contrato.unidad_ids.forEach((id) => unidades.add(id));
      } else {
        fallbackCamionesAsignados += Number(contrato.camiones_asignados || 0);
      }
    }
  });

  return {
    total_contratos: contratos.length,
    contratos_activos: contratos.filter(isActiveContract).length,
    contratos_vencidos: contratos.filter((contrato) => getNormalizedEstado(contrato) === 'VENCIDO').length,
    proximos_a_vencer: contratos.filter((contrato) => contrato.proximo_a_vencer).length,
    camiones_asignados: unidades.size + fallbackCamionesAsignados,
    distribucion_por_estado: Array.from(estados, ([estado, cantidad]) => ({ estado, cantidad })),
    distribucion_por_tipo_servicio: Array.from(tipos, ([tipo_servicio, cantidad]) => ({
      tipo_servicio: tipo_servicio as ContratosIndicadores['distribucion_por_tipo_servicio'][number]['tipo_servicio'],
      cantidad,
    })),
  };
};
