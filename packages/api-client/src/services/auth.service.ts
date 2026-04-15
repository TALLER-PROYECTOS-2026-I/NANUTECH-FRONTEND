// packages/api-client/src/services/auth.service.ts
import { apiClient } from '../../index';
import type { AuthResponse, LoginRequest, ForgotPasswordRequest } from '@nanutech/types';

const AUTH_ERROR_MESSAGES: Record<number, string> = {
  400: 'Email o contraseña inválidos.',
  401: 'Credenciales incorrectas.',
  404: 'Usuario no encontrado.',
  423: 'Tu cuenta ha sido bloqueada. Contacta al administrador.',
  502: 'Error de conexión con el servidor de autenticación.',
};

export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  } catch (error: any) {
    const status: number = error?.response?.status;
    const message = AUTH_ERROR_MESSAGES[status] ?? 'Ocurrió un error al iniciar sesión.';
    throw new Error(message);
  }
};

export const forgotPassword = async (payload: ForgotPasswordRequest): Promise<string> => {
  try {
    const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', payload);
    return data.message ?? 'Te hemos enviado un enlace de recuperación a tu correo.';
  } catch (error: any) {
    const status: number = error?.response?.status;
    if (status === 404) throw new Error('No encontramos una cuenta con ese correo.');
    throw new Error('No pudimos procesar tu solicitud. Inténtalo de nuevo.');
  }
};

export const getMe = async (): Promise<AuthResponse> => {
  const { data } = await apiClient.get<AuthResponse>('/auth/me');
  return data;
};