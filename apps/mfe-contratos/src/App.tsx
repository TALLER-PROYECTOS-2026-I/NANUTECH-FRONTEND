import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';

import type { Contrato } from '@nanutech/api-client';

import './App.css';

import RegistroContratoPage from './modules/registro-contrato/pages/RegistroContratoPage';
import { GestionContratosPage as ContratosPage } from './modules/gestion-contratos';
import { DetalleContratoPage } from './modules/detalle-contrato';
import { DashboardGerencial } from './modules/dashboard-gerencial';
import SeguimientoJornadas from './modules/seguimiento-jornadas/SeguimientoJornadas';

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
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-slate-900 text-white lg:flex">
        <div className="flex h-[84px] items-center gap-3 border-b border-white/10 px-6">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 font-bold">
            N
          </div>
          <div>
            <p className="text-lg font-bold">NANU TECH</p>
            <p className="text-xs text-slate-300">Gestion de Flota</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <NavItem label="Dashboard Gerencial" to="dashboard" end />
          <NavItem label="Contratos" to="." end />
          <NavItem label="Historial de Jornadas" to="historial" end />
          <NavItem label="Seguimiento Jornadas" to="seguimiento-jornadas" end />
        </nav>

        <div className="relative space-y-4 border-t border-white/10 p-4">
          {showSessionMenu && (
            <div className="absolute bottom-[86px] left-5 right-5 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl">
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="text-sm text-slate-500">Sesion iniciada como</p>
                <p className="truncate text-sm font-bold">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar Sesion
              </button>
            </div>
          )}

          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-slate-300">Sesion activa</p>
            <p className="mt-1 font-bold">1h 35m</p>
          </div>

          <button
            type="button"
            onClick={() => setShowSessionMenu((current) => !current)}
            className="flex w-full items-center gap-3 rounded-lg text-left transition hover:bg-white/5"
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="text-xs text-slate-300">Gerente de Operaciones</p>
            </div>
            <svg
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${showSessionMenu ? 'rotate-180' : ''}`}
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

      <div className="lg:pl-64">
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

function NavItem({ label, to, end }: { label: string; to: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block rounded-lg px-4 py-3 text-sm font-semibold transition ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-200 hover:bg-white/10 hover:text-white'
        }`
      }
    >
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
        <Route path="historial" element={<div>Historial de Jornadas</div>} />
        <Route path="seguimiento-jornadas" element={<SeguimientoJornadas />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return <AppRoutes />;
}
