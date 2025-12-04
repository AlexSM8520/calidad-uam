const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Endpoints públicos que no requieren autenticación
    // According to API docs: /auth/login, /auth/register, /facultades, /carreras, /areas, /lineas, /objetivos, /indicadores (read only)
    const publicEndpoints = [
      '/auth/login', 
      '/auth/register',
      '/facultades',
      '/carreras',
      '/areas',
      '/lineas',
      '/objetivos',
      '/indicadores'
    ];
    const isPublicEndpoint = publicEndpoints.some(ep => endpoint.startsWith(ep));

    // Si no es un endpoint público y no hay token, rechazar la petición
    if (!isPublicEndpoint && !this.token) {
      throw new Error('No autenticado. Por favor, inicia sesión.');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          this.setToken(null);
          window.location.href = '/login';
          throw new Error('Unauthorized');
        }

        // Extract error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (data) {
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
          } else if (typeof data === 'string') {
            errorMessage = data;
          } else {
            // Try to extract validation errors
            const errors = data.errors || data.validationErrors;
            if (errors && Array.isArray(errors)) {
              errorMessage = errors.map((e: any) => e.message || e.msg || e).join(', ');
            } else if (errors && typeof errors === 'object') {
              errorMessage = Object.entries(errors)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
            }
          }
        }

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

