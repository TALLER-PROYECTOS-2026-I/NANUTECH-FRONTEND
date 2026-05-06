import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { Contrato } from '@nanutech/api-client';
import './App.css';
import RegistroContratoPage from './modules/registro-contrato/pages/RegistroContratoPage';
import ContratosPage from './modules/registro-contrato/pages/ContratosPage';

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
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-slate-900 text-white lg:flex">
        <div className="flex h-[84px] items-center gap-3 border-b border-white/10 px-6">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 font-bold">N</div>
          <div>
            <p className="text-lg font-bold leading-tight">NANU TECH</p>
            <p className="text-xs text-slate-300">Gestión de Flota</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <NavItem label="Dashboard Gerencial" />
          <NavItem active label="Contratos" />
          <NavItem label="Historial de Jornadas" />
          <NavItem label="Seguimiento Jornadas" />
        </nav>

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

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-[84px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <div>
            <h1 className="text-2xl font-bold">Contratos</h1>
            <p className="text-sm text-slate-500">{today}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Última actualización</p>
            <p className="font-bold text-slate-950">{formatTime(now)}</p>
          </div>
        </header>

        <div className="min-h-[calc(100vh-84px)] px-4 py-6 sm:px-8">{children}</div>

        <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500 sm:px-8">
          © 2026 NANU TECH - Sistema de Gestión de Flota de Camiones
        </footer>
      </div>

      {toast && (
        <div className="fixed right-4 top-5 z-30 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <p className="font-semibold text-slate-950">{toast.title}</p>
          <p className="mt-1 text-sm text-slate-500">{toast.message}</p>
        </div>
      )}
    </div>
  );
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={`rounded-lg px-4 py-3 text-sm font-semibold ${
        active ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20' : 'text-slate-200'
      }`}
    >
      {label}
    </div>
  );
}

function AppRoutes() {
  const [showRegistro, setShowRegistro] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (nextToast: Toast) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 4000);
  };

  const handleRegistered = (contrato: Contrato) => {
    showToast({
      title: 'Contrato registrado exitosamente',
      message: `ID: ${contrato.codigo || contrato.id} · Tarifa Total: S/ ${Number(
        contrato.tarifa ?? contrato.total_referencial ?? 0
      ).toFixed(2)}`,
    });
  };

  return (
    <AppShell toast={toast}>
      <Routes>
        <Route
          path="/"
          element={
            showRegistro ? (
              <RegistroContratoPage
                onBack={() => setShowRegistro(false)}
                onRegistered={handleRegistered}
              />
            ) : (
              <ContratosPage onNuevoContrato={() => setShowRegistro(true)} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
