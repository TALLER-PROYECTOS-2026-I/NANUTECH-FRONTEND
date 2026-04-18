import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@nanutech/api-client';
import { validarFormatoCorreo } from '@nanutech/utils';

export default function LoginPage() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validarFormatoCorreo(correo)) {
      return setError('Por favor, ingresa un correo válido.');
    }

    setCargando(true);

    try {
      const respuesta = await login(correo, password);

      const { user, session, role, nextRoute } = respuesta.data;

      localStorage.setItem('nanutech_token', session.accessToken);
      localStorage.setItem('nanutech_id_token', session.idToken);
      localStorage.setItem('nanutech_user', JSON.stringify(user));
      localStorage.setItem('nanutech_role', role);
      localStorage.setItem('nanutech_expires_at', session.expiresAt);
      localStorage.setItem('nanutech_token', respuesta.data.session.accessToken);
      localStorage.setItem('nanutech_user', JSON.stringify(respuesta.data.user));

      if (nextRoute) {
        navigate(nextRoute);
      } else if (role.toUpperCase() === 'ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/chofer');
      }
    } catch (err: any) {
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data?.mensaje ||
        err?.message ||
        'Credenciales incorrectas';

      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* Panel izquierdo — formulario */}
      <div className="flex flex-col justify-between items-center bg-gray-50 p-8">
        <div className="w-full max-w-md flex flex-col items-center mt-8">

          {/* Logo superior */}
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            {/* Ícono de camión SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 h-9 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 5v4h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 tracking-wide">NANU TECH</h2>
          <p className="text-sm text-gray-500 mb-8">Sistema de Gestión de Flota</p>

          {/* Tarjeta del formulario */}
          <div className="w-full bg-white rounded-2xl shadow-md p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Iniciar Sesión</h3>
            <p className="text-sm text-gray-500 mb-6">
              Ingrese sus credenciales para acceder al sistema
            </p>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Correo */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    autoComplete="username"
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="usuario@nanutech.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-sm"
              >
                {cargando ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <a href="/recuperar" className="text-sm text-blue-500 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Aviso de bloqueo */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>
                Después de 5 intentos fallidos, tu cuenta será bloqueada por 15 minutos.
              </span>
            </div>
          </div>
        </div>

        {/* Footer izquierdo */}
        <p className="text-xs text-gray-400 mt-8 mb-2">
          © 2026 NANU TECH. Todos los derechos reservados.
        </p>
      </div>

      {/* Panel derecho — marketing */}
      <div className="hidden md:flex flex-col justify-center items-start bg-slate-900 p-16 text-white relative overflow-hidden">

        {/* Patrón de cruces de fondo */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M19 0h2v40h-2z'/%3E%3Cpath d='M0 19h40v2H0z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="z-10 w-full max-w-lg">
          {/* Logo panel derecho */}
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 h-9 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 5v4h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>

          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Gestión Inteligente de Flota
          </h1>
          <p className="text-slate-400 text-lg mb-10">
            Control total de tu operación logística en tiempo real
          </p>

          {/* Cards de roles */}
          <div className="flex flex-col gap-4">
            {/* Administradores */}
            <div className="flex items-center gap-4 bg-slate-800 rounded-xl px-5 py-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Para Administradores</p>
                <p className="text-slate-400 text-xs">Gestión completa del sistema, camiones, contratos y operaciones</p>
              </div>
            </div>

            {/* Gerentes */}
            <div className="flex items-center gap-4 bg-slate-800 rounded-xl px-5 py-4">
              <div className="w-11 h-11 rounded-xl bg-purple-500 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Para Gerentes</p>
                <p className="text-slate-400 text-xs">Análisis estadístico y reportes detallados de jornadas laborales</p>
              </div>
            </div>

            {/* Conductores */}
            <div className="flex items-center gap-4 bg-slate-800 rounded-xl px-5 py-4">
              <div className="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Para Conductores</p>
                <p className="text-slate-400 text-xs">Registra jornadas de trabajo de forma rápida y sencilla</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}