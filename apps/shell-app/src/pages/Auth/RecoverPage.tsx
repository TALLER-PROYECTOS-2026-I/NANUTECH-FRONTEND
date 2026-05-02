import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recuperarPassword } from '@nanutech/api-client';
import { validarFormatoCorreo } from '@nanutech/utils';

export default function RecoverPage() {
  const [correo, setCorreo] = useState('');
  const [estado, setEstado] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');

    if (!validarFormatoCorreo(correo)) {
      setEstado('error');
      return setMensaje('Ingresa un correo válido.');
    }

    setEstado('loading');

    try {
      const respuesta = await recuperarPassword(correo);

      setEstado('success');
      setMensaje(
        respuesta.data?.message ||
          respuesta.message ||
          'Se envió el correo de recuperación.'
      );

      setTimeout(() => {
        navigate('/recuperar/confirmar', { state: { email: correo } });
      }, 1500);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string; mensaje?: string } };
        message?: string;
      };
      setEstado('error');
      setMensaje(
        error.response?.data?.message ||
          error.response?.data?.mensaje ||
          error.message ||
          'No se pudo procesar la solicitud'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-blue-200 shadow-lg">
          <span className="text-white text-2xl font-bold">NT</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">NANU TECH</h2>
        <p className="text-sm text-gray-500">Recuperación de Contraseña</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-xl font-bold mb-2">¿Olvidaste tu Contraseña?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
        </p>

        {mensaje && (
          <div
            className={`mb-6 p-3 rounded-md text-sm border ${
              estado === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            {mensaje}
          </div>
        )}

        {estado !== 'success' ? (
          <form onSubmit={handleRecover}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="usuario@nanutech.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={estado === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mb-4"
            >
              {estado === 'loading' ? 'Enviando...' : 'Enviar Código de Recuperación'}
            </button>
          </form>
        ) : null}

        <button
          onClick={() => navigate('/login')}
          className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
        >
          <span>←</span> Volver al Login
        </button>
      </div>
    </div>
  );
}
