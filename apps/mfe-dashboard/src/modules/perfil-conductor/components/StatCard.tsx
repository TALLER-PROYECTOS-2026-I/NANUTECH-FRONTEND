import type { ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  sublabel: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
};

export function StatCard({ label, value, sublabel, icon, iconBg, iconColor }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-2xl font-extrabold leading-tight text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{sublabel}</p>
      </div>
    </div>
  );
}
