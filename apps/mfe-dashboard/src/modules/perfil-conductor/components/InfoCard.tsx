import type { ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  icon: ReactNode;
  borderColor: string;
  iconBg: string;
  iconColor: string;
};

export function InfoCard({ label, value, icon, borderColor, iconBg, iconColor }: Props) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm ${borderColor}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="truncate text-sm font-bold text-gray-900">{value || '—'}</p>
      </div>
    </div>
  );
}
