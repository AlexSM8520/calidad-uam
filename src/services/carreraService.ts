import { apiClient } from './api';
import type { Carrera } from '../models/Carrera';

export const carreraService = {
  async getAll(facultad?: string): Promise<Carrera[]> {
    const url = facultad ? `/carreras?facultad=${encodeURIComponent(facultad)}` : '/carreras';
    const response = await apiClient.get<{ data: Carrera[]; count: number }>(url);
    if (response.success && response.data) {
      return (response.data as any).data || [];
    }
    return [];
  },

  async getById(id: string): Promise<Carrera | null> {
    const response = await apiClient.get<{ data: Carrera }>(`/carreras/${id}`);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    return null;
  },

  async create(carreraData: Omit<Carrera, 'id'>): Promise<Carrera> {
    const response = await apiClient.post<{ data: Carrera }>('/carreras', carreraData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to create carrera');
  },

  async update(id: string, carreraData: Partial<Omit<Carrera, 'id'>>): Promise<Carrera> {
    const response = await apiClient.put<{ data: Carrera }>(`/carreras/${id}`, carreraData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to update carrera');
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/carreras/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete carrera');
    }
  },
};

