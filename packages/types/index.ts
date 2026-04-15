// Auth request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

// Auth response types
export interface UserData {
  email: string;
  role: string;
}

export interface SessionData {
  provider: string;
  accessToken?: string;
  tokenType: string;
  expiresIn?: number;
  expiresAt: string;
  idleTimeoutSeconds: number;
  isAuthenticated?: boolean;
}

export interface AuthResponseData {
  user: UserData;
  session: SessionData;
  nextRoute: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthResponseData;
}
