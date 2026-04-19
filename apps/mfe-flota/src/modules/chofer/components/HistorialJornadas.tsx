import React from 'react';

/**
 * Componente HistorialJornadas
 * Muestra tarjeta con opción de ver historial completo
 */
export const HistorialJornadas: React.FC = () => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-2">
        <span className="text-violet-600">◷</span>
        <div>
          <h3 className="text-base font-bold text-gray-900">Historial de Jornadas</h3>
          <p className="text-sm text-gray-500">Consulta todas tus jornadas completadas</p>
        </div>
      </div>

      <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-4 text-center">
        <div className="mb-2 text-2xl text-indigo-500">◫</div>
        <p className="mb-3 text-sm text-gray-600">
          Revisa el historial completo de tus jornadas, filtra por fecha y consulta estadísticas detalladas.
        </p>
        <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
          Ver Historial Completo
        </button>
      </div>
    </div>
  );
};
