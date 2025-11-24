import { apiClient } from './api';
import type { Indicador } from '../models/Indicador';

export const indicadorService = {
  async getAll(objetivoId?: string, lineaId?: string): Promise<Indicador[]> {
    const params = new URLSearchParams();
    if (objetivoId) params.append('objetivoId', objetivoId);
    if (lineaId) params.append('lineaId', lineaId);
    const url = params.toString() ? `/indicadores?${params.toString()}` : '/indicadores';
    
    const response = await apiClient.get<{ data: Indicador[]; count: number }>(url);
    if (response.success && response.data) {
      return (response.data as any).data || [];
    }
    return [];
  },

  async getById(id: string): Promise<Indicador | null> {
    const response = await apiClient.get<{ data: Indicador }>(`/indicadores/${id}`);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    return null;
  },

  async create(indicadorData: Omit<Indicador, 'id'>): Promise<Indicador> {
    const response = await apiClient.post<{ data: Indicador }>('/indicadores', indicadorData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to create indicador');
  },

  async update(id: string, indicadorData: Partial<Omit<Indicador, 'id'>>): Promise<Indicador> {
    const response = await apiClient.put<{ data: Indicador }>(`/indicadores/${id}`, indicadorData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to update indicador');
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/indicadores/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete indicador');
    }
  },
};

