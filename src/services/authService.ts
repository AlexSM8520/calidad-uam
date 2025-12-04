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
    // Register endpoint returns user at root level
    const response = await apiClient.post<any>('/auth/register', userData);

    console.log('Register response:', response);

    // Handle response structure: { success: true, message: "...", user: {...} }
    if (response.success && response.user) {
      const user = response.user;
      
      // Normalize user ID (convert id to _id for consistency with MongoDB)
      const normalizedUser: User = {
        ...user,
        _id: user._id || user.id,
        id: user.id || user._id,
      };

      // Check if token is in response (some APIs include it, others don't)
      const token = (response as any).token;
      
      if (token) {
        // Token provided, set it and return
        const registerData: LoginResponse = {
          success: true,
          token: token,
          user: normalizedUser,
        };
        apiClient.setToken(token);
        return registerData;
      } else {
        // No token in response - according to Swagger docs, register should return token
        // But if it doesn't, we need to login after registration
        // For now, try to auto-login with the credentials
        try {
          console.log('No token in register response, attempting auto-login...');
          const loginResponse = await this.login(userData.username, userData.password);
          return {
            success: true,
            token: loginResponse.token,
            user: normalizedUser, // Use the user from register response
          };
        } catch (loginError) {
          console.error('Auto-login failed:', loginError);
          // If auto-login fails, still return success but without token
          // User will need to login manually
          throw new Error('Usuario registrado exitosamente, pero no se pudo iniciar sesión automáticamente. Por favor, inicie sesión.');
        }
      }
    }

    // If we get here, the response structure is unexpected
    const errorMessage = (response as any).message || response.message || 'Error al registrar el usuario';
    console.error('Unexpected register response structure:', response);
    throw new Error(errorMessage);
  },
};

