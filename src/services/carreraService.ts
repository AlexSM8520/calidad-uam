import { apiClient } from './api';
import type { Carrera } from '../models/Carrera';

export const carreraService = {
  async getAll(facultad?: string): Promise<Carrera[]> {
    const url = facultad ? `/carreras?facultad=${encodeURIComponent(facultad)}` : '/carreras';
    const response = await apiClient.get<{ data: Carrera[]; count: number }>(url);
    if (response.success && response.data) {
      // Handle different response structures
      const carreras = (response.data as any).data || response.data;
      if (Array.isArray(carreras)) {
        return carreras;
      }
      // If response.data is the array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
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
      // Handle different response structures
      const carrera = (response.data as any).data || response.data;
      if (!carrera) {
        throw new Error('No carrera data returned from server');
      }
      // Ensure all required fields are present
      if (!carrera.nombre || !carrera.facultad) {
        console.error('Incomplete carrera data:', carrera);
        throw new Error('Incomplete carrera data returned from server');
      }
      return carrera;
    }
    throw new Error(response.message || 'Failed to create carrera');
  },

  async update(id: string, carreraData: Partial<Omit<Carrera, 'id'>>): Promise<Carrera> {
    const response = await apiClient.put<{ data: Carrera }>(`/carreras/${id}`, carreraData);
    if (response.success && response.data) {
      // Handle different response structures
      const carrera = (response.data as any).data || response.data;
      if (!carrera) {
        throw new Error('No carrera data returned from server');
      }
      return carrera;
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

