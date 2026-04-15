import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordConfirm } from '@nanutech/api-client';

export default function ForgotPasswordConfirmPage() {
  const [correo, setCorreo] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setLoading(true);
    try {
      const msg = await forgotPasswordConfirm({ email: correo, code, newPassword });
      setMensaje(msg);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setMensaje(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center">Confirmar recuperación</h2>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          className="input input-bordered w-full mb-4"
          required
        />
        <input
          type="text"
          placeholder="Código de verificación"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="input input-bordered w-full mb-4"
          required
        />
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="input input-bordered w-full mb-6"
          required
        />
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar'}
        </button>
        {mensaje && <div className="mt-4 text-center text-sm text-blue-600">{mensaje}</div>}
      </form>
    </div>
  );
}
