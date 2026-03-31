import { useState } from 'react';
import { Button, Card, Input } from '@nanutech/ui-components';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí a futuro conectaremos con el backend real de NANUTECH
    console.log('Iniciando sesión con:', email);
    
    //Simulamos que el login fue exitoso
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-lg border-slate-100">
        
        {/*Cabecera*/}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">NANU TECH</h1>
          <p className="text-sm text-slate-500 mt-1">Sistema de Gestión de Flota</p>
        </div>

        {/*Formulario*/}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 block text-left">
              Email
            </label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 block text-left">
              Contraseña
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* Botón Principal */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-base"
            >
              Iniciar Sesión
            </Button>
          </div>
          
        </form>

        {/* Link de recuperación */}
        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

      </Card>
    </div>
  );
}