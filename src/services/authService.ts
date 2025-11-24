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
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      username,
      password,
    });

    if (response.success && response.data) {
      const loginData = response.data as unknown as LoginResponse;
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
};

