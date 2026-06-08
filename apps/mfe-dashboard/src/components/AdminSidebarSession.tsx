import { useState, useEffect } from "react";

type AdminSidebarSessionProps = {
  /** Texto mostrado bajo “Sesión activa” (ej. tiempo restante). */
  sessionDurationLabel?: string;
};

/**
 * Pie del sidebar admin: sesión, usuario y menú con cierre de sesión (misma UX en todas las vistas).
 */
export function AdminSidebarSession({
  sessionDurationLabel = "1h 58m",
}: AdminSidebarSessionProps) {
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [userEmail, setUserEmail] = useState("admin1@nanutech.com");
  const [displayName, setDisplayName] = useState("Carlos Administr...");
  const [displayRole, setDisplayRole] = useState("Administrador Gene...");

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("nanutech_user");
      const role = localStorage.getItem("nanutech_role");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserEmail(user.email || "admin1@nanutech.com");
        const name = user.nombres || user.nombre || "";
        const lastname = user.apellidos || "";
        const fullName = `${name} ${lastname}`.trim();
        setDisplayName(fullName || "Usuario");
      }
      if (role) {
        const upperRole = role.toUpperCase();
        if (upperRole === "ADMIN") {
          setDisplayRole("Administrador General");
        } else if (upperRole === "GERENTE" || upperRole === "GERENCIAL") {
          setDisplayRole("Gerente");
        } else if (upperRole === "CHOFER") {
          setDisplayRole("Conductor");
        } else {
          setDisplayRole(role);
        }
      }
    } catch (e) {
      console.error("Error loading user data from localStorage:", e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const initialLetter = displayName.charAt(0).toUpperCase() || "U";

  return (
    <div className="shrink-0 border-t border-slate-700 px-4 py-3">
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>Sesión activa</span>
      </div>
      <p className="mb-3 text-xs font-semibold text-white">{sessionDurationLabel}</p>

      <div className="relative">
        {menuUsuarioAbierto && (
          <div className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="mb-0.5 text-xs text-gray-500">Sesión iniciada como</p>
              <p className="text-sm font-bold text-gray-900 truncate">{userEmail}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        )}

        <button
          type="button"
          className="-mx-1 flex w-full items-center gap-2 rounded-lg p-1 transition-colors hover:bg-slate-800"
          onClick={() => setMenuUsuarioAbierto((prev) => !prev)}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
            {initialLetter}
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-xs font-semibold text-white">{displayName}</p>
            <p className="truncate text-xs text-slate-400">{displayRole}</p>
          </div>
          <svg
            className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${menuUsuarioAbierto ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>
  );
}

