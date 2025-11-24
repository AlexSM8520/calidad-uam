import { apiClient } from './api';
import type { Facultad } from '../models/Facultad';

export const facultadService = {
  async getAll(): Promise<Facultad[]> {
    const response = await apiClient.get<{ data: Facultad[]; count: number }>('/facultades');
    if (response.success && response.data) {
      return (response.data as any).data || [];
    }
    return [];
  },

  async getById(id: string): Promise<Facultad | null> {
    const response = await apiClient.get<{ data: Facultad }>(`/facultades/${id}`);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    return null;
  },

  async create(facultadData: Omit<Facultad, 'id'>): Promise<Facultad> {
    const response = await apiClient.post<{ data: Facultad }>('/facultades', facultadData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to create facultad');
  },

  async update(id: string, facultadData: Partial<Omit<Facultad, 'id'>>): Promise<Facultad> {
    const response = await apiClient.put<{ data: Facultad }>(`/facultades/${id}`, facultadData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to update facultad');
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/facultades/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete facultad');
    }
  },
};

