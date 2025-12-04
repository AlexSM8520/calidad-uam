import { apiClient } from './api';
import type { User } from '../models/User';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    // Login endpoint returns token and user at root level, not in data
    const response = await apiClient.post<any>('/auth/login', {
      username,
      password,
    });

    // According to API docs, login response structure is:
    // { success: true, token: "...", user: {...} }
    if (response.success && (response as any).token && (response as any).user) {
      const loginData: LoginResponse = {
        success: true,
        token: (response as any).token,
        user: (response as any).user,
      };
      apiClient.setToken(loginData.token);
      return loginData;
    }

    throw new Error('Login failed');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    
    if (response.success && response.data) {
      return (response.data as any).user;
    }

    throw new Error('Failed to get current user');
  },

  logout() {
    apiClient.setToken(null);
  },

  isAuthenticated(): boolean {
    return apiClient.getToken() !== null;
  },

  async register(userData: {
    username: string;
    password: string;
    email?: string;
    nombre?: string;
    apellido?: string;
    carreraId?: string;
    areaId?: string;
  }): Promise<LoginResponse> {
    // Register endpoint returns token and user at root level, similar to login
    const response = await apiClient.post<any>('/auth/register', userData);

    // According to API docs, register response structure is:
    // { success: true, token: "...", user: {...} }
    if (response.success && (response as any).token && (response as any).user) {
      const registerData: LoginResponse = {
        success: true,
        token: (response as any).token,
        user: (response as any).user,
      };
      apiClient.setToken(registerData.token);
      return registerData;
    }

    throw new Error(response.message || 'Error al registrar el usuario');
  },
};

