import type { ReactNode } from 'react';

type SummaryCardProps = {
  title: string;
  value: number;
  helper: string;
  tone: 'blue' | 'green' | 'emerald' | 'sky';
  icon: ReactNode;
};

const toneClass: Record<SummaryCardProps['tone'], string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  sky: 'bg-blue-100 text-blue-600',
};

export function SummaryCard({ title, value, helper, tone, icon }: SummaryCardProps) {
  return (
    <article className="flex min-h-[116px] items-center justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="mt-1 text-3xl font-bold leading-none text-gray-900">{value}</p>
        <p className="mt-3 text-xs text-gray-500">{helper}</p>
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneClass[tone]}`}>
        {icon}
      </div>
    </article>
  );
}
