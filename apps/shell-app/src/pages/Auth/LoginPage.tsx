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
      const { data } = await login({ email: correo, password });
      localStorage.setItem('nanutech_token', data.session.accessToken ?? '');
      navigate(data.nextRoute);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* LADO IZQUIERDO: Formulario */}
      <div className="flex flex-col justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-blue-200 shadow-lg">
              <span className="text-white text-2xl font-bold">NT</span> {/* Aquí va el ícono del camión */}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">NANU TECH</h2>
            <p className="text-sm text-gray-500">Sistema de Gestión de Flota</p>
          </div>

          <form onSubmit={handleSubmit}>
            <h3 className="text-xl font-bold mb-1">Iniciar Sesión</h3>
            <p className="text-sm text-gray-500 mb-6">Ingrese sus credenciales para acceder al sistema</p>
            
            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                autoComplete="username"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="usuario@nanutech.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                autoComplete="current-password"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              {cargando ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
<a href="/forgot-password" className="text-sm text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>          </div>
        </div>
      </div>

      {/* LADO DERECHO: Panel Oscuro (Se oculta en celulares) */}
      <div className="hidden md:flex flex-col justify-center items-start bg-slate-900 p-16 text-white relative overflow-hidden">
        {/* Aquí Ángel debe usar el patrón de puntos de fondo con CSS o un SVG */}
        <div className="z-10 w-full max-w-lg">
          <h1 className="text-5xl font-bold mb-4 leading-tight">Gestión Inteligente de Flota</h1>
          <p className="text-slate-400 text-lg mb-12">Control total de tu operación logística en tiempo real</p>
          
          {/* Opciones informativas (Administradores, Gerentes, Conductores) */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
               <div className="bg-blue-500 p-2 rounded-lg text-white">✓</div>
               <div>
                 <h4 className="font-bold">Para Administradores</h4>
                 <p className="text-sm text-slate-400">Gestión completa del sistema y camiones</p>
               </div>
            </div>
            {/* Repetir para Gerentes y Conductores cambiando el color del ícono */}
          </div>
        </div>
      </div>

    </div>
  );
}