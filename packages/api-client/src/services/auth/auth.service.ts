import apiClient from '../../../index';

export interface AuthUser {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  role: string;
  estado: string;
}

export interface AuthSession {
  provider: string;
  accessToken: string;
  idToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
  idleTimeoutSeconds: number;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    session: AuthSession;
    role: string;
    nextRoute: string;
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    email?: string;
    provider?: string;
    delivery?: {
      Destination?: string;
      DeliveryMedium?: string;
      AttributeName?: string;
    };
    message?: string;
  };
}

export interface ConfirmForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface MeResponse {
  success?: boolean;
  message?: string;
  data?: {
    user?: AuthUser;
    role?: string;
  };
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  });

  return response.data;
};

export const recuperarPassword = async (
  email: string
): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(
    '/auth/forgot-password',
    { email }
  );

  return response.data;
};

export const confirmarRecuperacionPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<ConfirmForgotPasswordResponse> => {
  const response = await apiClient.post<ConfirmForgotPasswordResponse>(
    '/auth/forgot-password/confirm',
    {
      email,
      code,
      newPassword,
    }
  );

  return response.data;
};

export const obtenerUsuarioActual = async (): Promise<MeResponse> => {
  const response = await apiClient.get<MeResponse>('/auth/me');
  return response.data;
};