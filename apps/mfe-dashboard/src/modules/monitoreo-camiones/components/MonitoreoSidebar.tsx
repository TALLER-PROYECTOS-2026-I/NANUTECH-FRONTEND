import { NavLink } from "react-router-dom";
import { menuItems } from "../constants";
import { Icon } from "./Icon";

// Menú lateral fijo de navegación del módulo.
export function MonitoreoSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-20 flex h-full min-h-screen w-52 shrink-0 flex-col bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-700 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
          <Icon name="truck" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">NANU TECH</p>
          <p className="text-xs text-slate-400">Gestión de Flota</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 font-semibold text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span className="shrink-0 text-current">
              <Icon name={item.icon} />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 px-4 py-3">
        <div className="mb-3 rounded-lg border border-orange-500/40 bg-orange-500/10 p-3 text-xs text-orange-300">
          <p className="font-semibold">Sesión activa</p>
          <p className="mt-1 text-white">0h 13m</p>
          <p className="mt-1">Por vencer</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg p-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
            C
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">Carlos Administr...</p>
            <p className="truncate text-xs text-slate-400">Administrador Gene...</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

