import type { ReactNode } from "react";

/** Prefijo del área admin del shell (coincide con `shell-app` `/dashboard/admin/*`). */
export const ADMIN_ROUTE_PREFIX = "/dashboard/admin";

export const ADMIN_DASHBOARD_HOME = `${ADMIN_ROUTE_PREFIX}/dashboard`;

export type AdminNavItem = {
  label: string;
  to: string;
  /** Si es false, no se aplica el estilo “activo” aunque la ruta coincida (atajos al mismo dashboard). */
  accentWhenActive: boolean;
  icon: ReactNode;
};

/**
 * Menú lateral del administrador: rutas absolutas para evitar fallos con `..` en rutas anidadas
 * y estados activos duplicados cuando varios enlaces apuntaban a `../dashboard`.
 */
export const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard Admin",
    to: ADMIN_DASHBOARD_HOME,
    accentWhenActive: true,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Alertas y Emergencias",
    to: `${ADMIN_ROUTE_PREFIX}/alertas`,
    accentWhenActive: true,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    label: "Camiones",
    to: `${ADMIN_ROUTE_PREFIX}/camiones`,
    accentWhenActive: true,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Conductores",
    to: `${ADMIN_ROUTE_PREFIX}/conductores`,
    accentWhenActive: true,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "GPS",
    to: `${ADMIN_ROUTE_PREFIX}/gps`,
    accentWhenActive: true,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  // HU09: acceso lateral al panel de tracking GPS en tiempo real.
  {
    label: "Tracking GPS",
    to: `${ADMIN_ROUTE_PREFIX}/tracking-gps`,
    accentWhenActive: true,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Registro Jornadas",
    to: `${ADMIN_ROUTE_PREFIX}/registro-jornada/nueva`,
    accentWhenActive: true,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Auditoría",
    to: `${ADMIN_ROUTE_PREFIX}/auditoria`,
    accentWhenActive: true,
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const baseNav =
  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors";
const activeCls = "bg-blue-600 text-white font-semibold";
const inactiveCls = "text-slate-300 hover:bg-slate-800 hover:text-white";

export function adminNavLinkClassName(isActive: boolean, accentWhenActive: boolean): string {
  const show = accentWhenActive && isActive;
  return `${baseNav} ${show ? activeCls : inactiveCls}`;
}
