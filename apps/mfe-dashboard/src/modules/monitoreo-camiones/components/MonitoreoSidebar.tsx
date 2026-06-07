import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ADMIN_DASHBOARD_HOME,
  adminNavItems,
  adminNavLinkClassName,
  ADMIN_ROUTE_PREFIX,
} from "../../../navigation/adminNav";
import { AdminSidebarSession } from "../../../components/AdminSidebarSession";

// Menú lateral fijo de navegación del módulo.
export function MonitoreoSidebar() {
  const location = useLocation();
  const isConductoresActive = location.pathname.includes("/conductores");
  const [conductoresOpen, setConductoresOpen] = useState(isConductoresActive);

  const baseNav = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors";
  const activeSubCls = "bg-green-600 text-white font-semibold";
  const inactiveSubCls = "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-full min-h-screen w-52 shrink-0 flex-col bg-slate-900">
      {/* Logo */}
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
        {adminNavItems.map((item) => {
          // El item "Conductores" tiene sub-menú expandible
          if (item.label === "Conductores") {
            return (
              <div key={item.label}>
                {/* Item padre - toggle */}
                <button
                  type="button"
                  onClick={() => setConductoresOpen((o) => !o)}
                  className={`w-full ${baseNav} ${isConductoresActive ? "bg-blue-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                >
                  <span className="shrink-0 text-current">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <svg
                    className={`h-3.5 w-3.5 shrink-0 transition-transform ${conductoresOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Sub-items */}
                {conductoresOpen && (
                  <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-slate-700 pl-3">
                    {/* Ver todos */}
                    <NavLink
                      to={`${ADMIN_ROUTE_PREFIX}/conductores`}
                      end
                      className={({ isActive }) =>
                        `${baseNav} py-2 text-xs ${isActive ? "text-white font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800"}`
                      }
                    >
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      Ver todos
                    </NavLink>

                    {/* Dar de Alta */}
                    <NavLink
                      to={`${ADMIN_ROUTE_PREFIX}/conductores/dar-de-alta`}
                      className={({ isActive }) =>
                        `${baseNav} py-2 text-xs ${isActive ? activeSubCls : inactiveSubCls}`
                      }
                    >
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                      Dar de Alta
                    </NavLink>
                  </div>
                )}
              </div>
            );
          }

          // Items normales
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === ADMIN_DASHBOARD_HOME}
              className={({ isActive }) => adminNavLinkClassName(isActive, item.accentWhenActive)}
            >
              <span className="shrink-0 text-current">{item.icon}</span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <AdminSidebarSession />
    </aside>
  );
}
