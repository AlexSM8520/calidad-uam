import { apiClient } from './api';
import type { Objetivo } from '../models/Objetivo';

export const objetivoService = {
  async getAll(lineaId?: string): Promise<Objetivo[]> {
    const url = lineaId ? `/objetivos?lineaId=${lineaId}` : '/objetivos';
    const response = await apiClient.get<{ data: Objetivo[]; count: number }>(url);
    if (response.success && response.data) {
      // Handle different response structures
      const objetivos = (response.data as any).data || response.data;
      if (Array.isArray(objetivos)) {
        return objetivos;
      }
      // If response.data is the array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    return [];
  },

  async getById(id: string): Promise<Objetivo | null> {
    const response = await apiClient.get<{ data: Objetivo }>(`/objetivos/${id}`);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    return null;
  },

  async create(objetivoData: Omit<Objetivo, 'id'>): Promise<Objetivo> {
    const response = await apiClient.post<{ data: Objetivo }>('/objetivos', objetivoData);
    if (response.success && response.data) {
      // Handle different response structures
      const objetivo = (response.data as any).data || response.data;
      if (!objetivo) {
        throw new Error('No objetivo data returned from server');
      }
      // Ensure all required fields are present
      if (!objetivo.nombre || !objetivo.descripcion || !objetivo.lineaId) {
        console.error('Incomplete objetivo data:', objetivo);
        throw new Error('Incomplete objetivo data returned from server');
      }
      return objetivo;
    }
    throw new Error(response.message || 'Failed to create objetivo');
  },

  async update(id: string, objetivoData: Partial<Omit<Objetivo, 'id'>>): Promise<Objetivo> {
    const response = await apiClient.put<{ data: Objetivo }>(`/objetivos/${id}`, objetivoData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to update objetivo');
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/objetivos/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete objetivo');
    }
  },
};

