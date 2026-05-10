import { NavLink } from "react-router-dom";
import {
  ADMIN_DASHBOARD_HOME,
  adminNavItems,
  adminNavLinkClassName,
} from "../../../navigation/adminNav";
import { AdminSidebarSession } from "../../../components/AdminSidebarSession";

// Menú lateral fijo de navegación del módulo.
export function MonitoreoSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-20 flex h-full min-h-screen w-52 shrink-0 flex-col bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-700 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">NANU TECH</p>
          <p className="text-xs text-slate-400">Gestión de Flota</p>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === ADMIN_DASHBOARD_HOME}
            className={({ isActive }) => adminNavLinkClassName(isActive, item.accentWhenActive)}
          >
            <span className="shrink-0 text-current">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <AdminSidebarSession />
    </aside>
  );
}

