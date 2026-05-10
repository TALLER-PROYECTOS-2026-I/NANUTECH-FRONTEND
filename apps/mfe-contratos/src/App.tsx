import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Navigate,
  Route,
  Routes,
  NavLink,
} from 'react-router-dom';

import type { Contrato } from '@nanutech/api-client';

import './App.css';

/* Pages */
import RegistroContratoPage from './modules/registro-contrato/pages/RegistroContratoPage';
import { GestionContratosPage as ContratosPage } from './modules/gestion-contratos';
import { DetalleContratoPage } from './modules/detalle-contrato';

/* Seguimiento (si existe, si no se usa fallback) */
import SeguimientoJornadas from './modules/seguimiento-jornadas/SeguimientoJornadas';

type Toast = {
  title: string;
  message: string;
};

/* FORMATOS */
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

/* =========================
   LAYOUT
========================= */
function AppShell({
  children,
  toast,
}: {
  children: ReactNode;
  toast: Toast | null;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const today = useMemo(() => formatDate(now), [now]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">

      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-slate-900 text-white lg:flex">

        <div className="flex h-[84px] items-center gap-3 border-b border-white/10 px-6">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 font-bold">
            N
          </div>
          <div>
            <p className="text-lg font-bold">NANU TECH</p>
            <p className="text-xs text-slate-300">Gestión de Flota</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <NavItem label="Dashboard Gerencial" to="dashboard" />
          <NavItem label="Contratos" to="." />
          <NavItem label="Historial de Jornadas" to="historial" />
          <NavItem label="Seguimiento Jornadas" to="seguimiento-jornadas" />
        </nav>

        {/* ✅ SOLO AGREGADO - BLOQUE MARÍA GERENTE */}
        <div className="space-y-4 border-t border-white/10 p-4">

          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-slate-300">Sesión activa</p>
            <p className="mt-1 font-bold">1h 35m</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 font-semibold">
              M
            </div>
            <div>
              <p className="text-sm font-bold">María Gerente</p>
              <p className="text-xs text-slate-300">Gerente de Operaciones</p>
            </div>
          </div>

        </div>

      </aside>

      {/* MAIN */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-[84px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <div>
            <h1 className="text-2xl font-bold">Sistema de Gestión</h1>
            <p className="text-sm text-slate-500">{today}</p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p>Última actualización</p>
            <p className="font-bold text-slate-950">{formatTime(now)}</p>
          </div>
        </header>

        <div className="min-h-[calc(100vh-84px)] px-4 py-6 sm:px-8">
          {children}
        </div>

        <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500 sm:px-8">
          © 2026 NANU TECH
        </footer>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed right-4 top-5 z-30 w-[360px] rounded-lg border bg-white p-4 shadow-lg">
          <p className="font-semibold">{toast.title}</p>
          <p className="text-sm text-slate-500">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

/* NAV ITEM */
function NavItem({
  label,
  to,
}: {
  label: string;
  to: string;
}) {
  return (
    <NavLink
      to={to}
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

/* ROUTES (NO TOCADO) */
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

        <Route path="dashboard" element={<div>Dashboard Gerencial</div>} />
        <Route path="historial" element={<div>Historial de Jornadas</div>} />

        <Route
          path="seguimiento-jornadas"
          element={
            SeguimientoJornadas ? (
              <SeguimientoJornadas />
            ) : (
              <div>Seguimiento Jornadas (pendiente de módulo)</div>
            )
          }
        />

        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return <AppRoutes />;
}
