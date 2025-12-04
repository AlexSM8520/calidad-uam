import { apiClient } from './api';
import type { User } from '../models/User';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<{ data: User[]; count: number }>('/users');
    console.log('UserService.getAll response:', response);
    if (response.success && response.data) {
      // Handle different response structures
      const users = (response.data as any).data || response.data;
      console.log('Users parsed:', users);
      if (Array.isArray(users)) {
        return users;
      }
      // If response.data is the array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    console.warn('No users data found in response');
    return [];
  },

  async getById(id: string): Promise<User | null> {
    const response = await apiClient.get<{ data: User }>(`/users/${id}`);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    return null;
  },

  async create(userData: Omit<User, 'id'>): Promise<User> {
    // Ensure password is included for new users (required by API)
    if (!userData.password || !userData.password.trim()) {
      throw new Error('La contraseña es requerida para crear un usuario');
    }
    
    // Ensure username is provided
    if (!userData.username || !userData.username.trim()) {
      throw new Error('El nombre de usuario es requerido');
    }
    
    // Prepare request body according to API spec
    const requestBody: any = {
      username: userData.username.trim(),
      password: userData.password,
      rol: userData.rol,
    };

    // Add optional fields only if they have values
    if (userData.email && userData.email.trim()) {
      requestBody.email = userData.email.trim();
    }
    if (userData.nombre && userData.nombre.trim()) {
      requestBody.nombre = userData.nombre.trim();
    }
    if (userData.apellido && userData.apellido.trim()) {
      requestBody.apellido = userData.apellido.trim();
    }

    // Only include carreraId or areaId if rol is 'Usuario'
    if (userData.rol === 'Usuario') {
      if (userData.carreraId && userData.carreraId.trim()) {
        requestBody.carreraId = userData.carreraId.trim();
      } else if (userData.areaId && userData.areaId.trim()) {
        requestBody.areaId = userData.areaId.trim();
      }
    } else {
      // For non-Usuario roles, explicitly set to null
      requestBody.carreraId = null;
      requestBody.areaId = null;
    }

    console.log('Creating user with data:', requestBody);

    const response = await apiClient.post<{ data: User }>('/users', requestBody);
    if (response.success && response.data) {
      // Handle different response structures
      const user = (response.data as any).data || response.data;
      if (!user) {
        throw new Error('No user data returned from server');
      }
      return user;
    }
    throw new Error(response.message || 'Failed to create user');
  },

  async update(id: string, userData: Partial<Omit<User, 'id'>>): Promise<User> {
    // Prepare request body - only include fields that are being updated
    const requestBody: any = {};
    
    if (userData.username !== undefined) requestBody.username = userData.username;
    if (userData.email !== undefined) requestBody.email = userData.email;
    if (userData.nombre !== undefined) requestBody.nombre = userData.nombre;
    if (userData.apellido !== undefined) requestBody.apellido = userData.apellido;
    if (userData.rol !== undefined) requestBody.rol = userData.rol;
    if (userData.activo !== undefined) requestBody.activo = userData.activo;
    
    // Only include password if it's being updated (not empty)
    if (userData.password && userData.password.trim()) {
      requestBody.password = userData.password;
    }
    
    // Handle carreraId and areaId
    if (userData.rol === 'Usuario') {
      if (userData.carreraId !== undefined) {
        requestBody.carreraId = userData.carreraId || null;
      }
      if (userData.areaId !== undefined) {
        requestBody.areaId = userData.areaId || null;
      }
    } else {
      // If role is not 'Usuario', clear carreraId and areaId
      requestBody.carreraId = null;
      requestBody.areaId = null;
    }

    const response = await apiClient.put<{ data: User }>(`/users/${id}`, requestBody);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to update user');
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete user');
    }
  },
};

