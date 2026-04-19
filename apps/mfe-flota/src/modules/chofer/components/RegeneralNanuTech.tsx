import React from 'react';
import { ReglaGeneralNanuTech } from '../types/turnoChofer.types';

interface RegeneralNanuTechProps {
  reglas: ReglaGeneralNanuTech[];
}

/**
 * Componente que muestra las reglas generales de NANU TECH
 * Incluye: Seguridad, Puntualidad, Inspección, Uso de Botones, etc.
 */
export const RegeneralNanuTech: React.FC<RegeneralNanuTechProps> = ({ reglas }) => {
  const colorByRegla: Record<string, string> = {
    rojo: 'border-l-rose-500 bg-rose-50/60',
    azul: 'border-l-sky-500 bg-sky-50/60',
    verde: 'border-l-emerald-500 bg-emerald-50/60',
    naranja: 'border-l-amber-500 bg-amber-50/60',
    morado: 'border-l-violet-500 bg-violet-50/60',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 border-b border-gray-200 pb-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
          <span className="text-violet-600">◷</span>
          Reglas Generales de NANU TECH
        </h3>
        <p className="text-sm text-gray-500">Normas de seguridad y conducta</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {reglas.map((regla) => (
          <div
            key={regla.id}
            className={`rounded-lg border border-gray-100 border-l-4 p-3 ${colorByRegla[regla.color] || 'border-l-gray-300 bg-gray-50'}`}
          >
            <div className="flex items-start gap-2">
              <div className="pt-0.5 text-sm">{regla.icono}</div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{regla.titulo}</h4>
                <p className="text-xs text-gray-600">{regla.descripcion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
