import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';

import type { Contrato } from '@nanutech/api-client';

import './App.css';

import RegistroContratoPage from './modules/registro-contrato/pages/RegistroContratoPage';
import { GestionContratosPage as ContratosPage } from './modules/gestion-contratos';
import { DetalleContratoPage } from './modules/detalle-contrato';
import { DashboardGerencial } from './modules/dashboard-gerencial';
import HistorialJornadasPage from './modules/historial-jornadas';
import SeguimientoJornadas from './modules/seguimiento-jornadas/pages/SeguimientoJornadas';

type Toast = {
  title: string;
  message: string;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .replace(/\s/g, ' ');

const getStoredUser = () => {
  const storedUser = localStorage.getItem('nanutech_user');

  if (!storedUser) {
    return { name: 'Maria Gerente', email: 'gerente@nanutech.com' };
  }

  try {
    const parsed = JSON.parse(storedUser) as { name?: string; nombre?: string; email?: string };
    return {
      name: parsed.name || parsed.nombre || 'Maria Gerente',
      email: parsed.email || 'gerente@nanutech.com',
    };
  } catch {
    return { name: 'Maria Gerente', email: 'gerente@nanutech.com' };
  }
};

function AppShell({ children, toast }: { children: ReactNode; toast: Toast | null }) {
  const [now, setNow] = useState(() => new Date());
  const [showSessionMenu, setShowSessionMenu] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const today = useMemo(() => formatDate(now), [now]);
  const user = useMemo(() => getStoredUser(), []);

  const handleLogout = () => {
    localStorage.removeItem('nanutech_token');
    localStorage.removeItem('nanutech_id_token');
    localStorage.removeItem('nanutech_user');
    localStorage.removeItem('nanutech_role');
    localStorage.removeItem('nanutech_expires_at');
    window.location.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed left-0 top-0 z-20 hidden h-full min-h-screen w-52 shrink-0 flex-col bg-slate-900 text-white lg:flex">
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
            <p className="text-xs text-slate-400">Gestion de Flota</p>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4">
          <NavItem label="Dashboard Gerencial" to="dashboard" icon="dashboard" end />
          <NavItem label="Contratos" to="." icon="file" end />
          <NavItem label="Historial de Jornadas" to="historial" icon="clock" end />
          <NavItem label="Seguimiento Jornadas" to="seguimiento-jornadas" icon="route" end />
        </nav>

        <div className="relative shrink-0 border-t border-slate-700 px-4 py-3">
          {showSessionMenu && (
            <div className="absolute bottom-full left-4 right-4 z-50 mb-2 overflow-hidden rounded-xl border border-gray-100 bg-white text-slate-900 shadow-xl">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="mb-0.5 text-xs text-gray-500">Sesion iniciada como</p>
                <p className="truncate text-sm font-bold">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar Sesion
              </button>
            </div>
          )}

          <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Sesion activa</span>
          </div>
          <p className="mb-3 text-xs font-semibold text-white">1h 35m</p>

          <button
            type="button"
            onClick={() => setShowSessionMenu((current) => !current)}
            className="-mx-1 flex w-full items-center gap-2 rounded-lg p-1 text-left transition-colors hover:bg-slate-800"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-400">Gerente de Operaciones</p>
            </div>
            <svg
              className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${showSessionMenu ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="lg:pl-52">
        <header className="sticky top-0 z-10 flex h-[84px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <div>
            <h1 className="text-2xl font-bold">Sistema de Gestion</h1>
            <p className="text-sm text-slate-500">{today}</p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p>Ultima actualizacion</p>
            <p className="font-bold text-slate-950">{formatTime(now)}</p>
          </div>
        </header>

        <div className="min-h-[calc(100vh-84px)] px-4 py-6 sm:px-8">
          {children}
        </div>

        <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500 sm:px-8">
          2026 NANU TECH
        </footer>
      </div>

      {toast && (
        <div className="fixed right-4 top-5 z-30 w-[360px] rounded-lg border bg-white p-4 shadow-lg">
          <p className="font-semibold">{toast.title}</p>
          <p className="text-sm text-slate-500">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  const props = {
    className: 'h-4 w-4 shrink-0',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (name === 'dashboard') {
    return (
      <svg {...props}>
        <line x1="3" y1="21" x2="21" y2="21" />
        <rect x="5" y="11" width="3.5" height="7" />
        <rect x="10.25" y="7" width="3.5" height="11" />
        <rect x="15.5" y="13" width="3.5" height="5" />
      </svg>
    );
  }

  if (name === 'file') {
    return (
      <svg {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    );
  }

  if (name === 'clock') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15.5 14" />
      </svg>
    );
  }

  if (name === 'route') {
    return (
      <svg {...props}>
        <circle cx="6" cy="19" r="2.5" />
        <circle cx="18" cy="5" r="2.5" />
        <path d="M8.5 19H14a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5.5" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function NavItem({ label, to, icon, end }: { label: string; to: string; icon: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? 'bg-blue-600 font-semibold text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <NavIcon name={icon} />
      {label}
    </NavLink>
  );
}

export function AppRoutes() {
  const [showRegistro, setShowRegistro] = useState(false);
  const [selectedContratoId, setSelectedContratoId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  };

  const handleRegistered = (contrato: Contrato) => {
    showToast({
      title: 'Contrato registrado',
      message: `ID: ${contrato.codigo || contrato.id}`,
    });
  };

  return (
    <AppShell toast={toast}>
      <Routes>
        <Route
          index
          element={
            showRegistro ? (
              <RegistroContratoPage
                onBack={() => setShowRegistro(false)}
                onRegistered={handleRegistered}
              />
            ) : selectedContratoId ? (
              <DetalleContratoPage
                contratoId={selectedContratoId}
                onBack={() => setSelectedContratoId(null)}
              />
            ) : (
              <ContratosPage
                onNuevoContrato={() => setShowRegistro(true)}
                onVerContrato={setSelectedContratoId}
              />
            )
          }
        />

        <Route path="dashboard" element={<DashboardGerencial />} />
        <Route path="historial" element={<HistorialJornadasPage />} />
        <Route path="seguimiento-jornadas" element={<SeguimientoJornadas />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return <AppRoutes />;
}
