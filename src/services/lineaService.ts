import { apiClient } from './api';
import type { Linea } from '../models/Linea';

export const lineaService = {
  async getAll(): Promise<Linea[]> {
    const response = await apiClient.get<{ data: Linea[]; count: number }>('/lineas');
    if (response.success && response.data) {
      return (response.data as any).data || [];
    }
    return [];
  },

  async getById(id: string): Promise<Linea | null> {
    const response = await apiClient.get<{ data: Linea }>(`/lineas/${id}`);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    return null;
  },

  async create(lineaData: Omit<Linea, 'id'>): Promise<Linea> {
    const response = await apiClient.post<{ data: Linea }>('/lineas', lineaData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to create linea');
  },

  async update(id: string, lineaData: Partial<Omit<Linea, 'id'>>): Promise<Linea> {
    const response = await apiClient.put<{ data: Linea }>(`/lineas/${id}`, lineaData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to update linea');
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/lineas/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete linea');
    }
  },
};

