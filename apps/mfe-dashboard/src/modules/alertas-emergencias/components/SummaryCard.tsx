import type { ReactNode } from 'react';

type SummaryCardProps = {
  title: string;
  value: number;
  helper: string;
  tone: 'red' | 'orange' | 'green';
  icon: ReactNode;
};

// Estilos por tono para borde, texto e icono de las tarjetas resumen.
const toneClass: Record<SummaryCardProps['tone'], string> = {
  red: 'border-l-red-500 text-red-600',
  orange: 'border-l-orange-500 text-orange-600',
  green: 'border-l-green-500 text-green-600',
};

// Muestra un indicador numerico principal del panel.
export function SummaryCard({ title, value, helper, tone, icon }: SummaryCardProps) {
  return (
    <article className={`flex min-h-[116px] items-center justify-between rounded-lg border border-l-4 border-gray-200 bg-white p-5 shadow-sm ${toneClass[tone]}`}>
      <div>
        <p className="text-xs text-gray-600">{title}</p>
        <p className="mt-7 text-3xl font-bold leading-none">{value}</p>
        <p className="mt-3 text-xs text-gray-500">{helper}</p>
      </div>
      <div className="shrink-0">{icon}</div>
    </article>
  );
}
