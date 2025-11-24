import { apiClient } from './api';
import type { User } from '../models/User';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<{ data: User[]; count: number }>('/users');
    if (response.success && response.data) {
      return (response.data as any).data || [];
    }
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
    const response = await apiClient.post<{ data: User }>('/users', userData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to create user');
  },

  async update(id: string, userData: Partial<Omit<User, 'id'>>): Promise<User> {
    const response = await apiClient.put<{ data: User }>(`/users/${id}`, userData);
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

