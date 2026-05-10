import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmarRecuperacionPassword } from '@nanutech/api-client';
import { validarFormatoCorreo } from '@nanutech/utils';

export default function ResetPasswordPage() {
  // Lee el email enviado desde la pantalla de recuperacion.
  const location = useLocation();
  const navigate = useNavigate();

  // Campos requeridos por Cognito para confirmar el cambio de password.
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Controla estado visual del formulario y mensajes de respuesta.
  const [estado, setEstado] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');

  // Confirma el codigo recibido y actualiza la password del usuario.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');

    // Valida correo antes de enviar datos al backend.
    if (!validarFormatoCorreo(email)) {
      setEstado('error');
      return setMensaje('Ingresa un correo válido.');
    }

    // El codigo es obligatorio para confirmar el flujo de recuperacion.
    if (!code.trim()) {
      setEstado('error');
      return setMensaje('Ingresa el código de verificación.');
    }

    // No permite confirmar una password vacia.
    if (!newPassword.trim()) {
      setEstado('error');
      return setMensaje('Ingresa una nueva contraseña.');
    }

    setEstado('loading');

    try {
      // Envia email, codigo y nueva password al cliente API.
      const respuesta = await confirmarRecuperacionPassword(
        email,
        code,
        newPassword
      );

      setEstado('success');
      setMensaje(respuesta.message || 'Contraseña actualizada correctamente.');

      // Luego del exito, regresa al login para iniciar sesion.
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err: unknown) {
      // Muestra mensajes de error provenientes del backend o del cliente HTTP.
      const error = err as {
        response?: { data?: { message?: string; mensaje?: string } };
        message?: string;
      };
      setEstado('error');
      setMensaje(
        error.response?.data?.message ||
          error.response?.data?.mensaje ||
          error.message ||
          'No se pudo actualizar la contraseña'
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
        <p className="text-sm text-gray-500">Restablecer Contraseña</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h3 className="text-xl font-bold mb-2">Nueva Contraseña</h3>
        <p className="text-sm text-gray-500 mb-6">
          Ingresa tu correo, el código recibido y tu nueva contraseña.
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="usuario@nanutech.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Código de Verificación
            </label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: 123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="NuevaPassword123!"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={estado === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mb-4"
          >
            {estado === 'loading' ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>

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
