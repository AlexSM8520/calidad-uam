import { apiClient } from './api';
import type { POA, Actividad } from '../models/POA';

export const poaService = {
  async getAll(): Promise<POA[]> {
    const response = await apiClient.get<{ data: POA[]; count: number }>('/poas');
    if (response.success && response.data) {
      return (response.data as any).data || [];
    }
    return [];
  },

  async getById(id: string): Promise<POA | null> {
    const response = await apiClient.get<{ data: POA }>(`/poas/${id}`);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    return null;
  },

  async create(poaData: Omit<POA, 'id' | 'actividades'> & { actividades?: Omit<Actividad, 'id'>[] }): Promise<POA> {
    const response = await apiClient.post<{ data: POA }>('/poas', poaData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to create POA');
  },

  async update(id: string, poaData: Partial<Omit<POA, 'id' | 'actividades'>>): Promise<POA> {
    const response = await apiClient.put<{ data: POA }>(`/poas/${id}`, poaData);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to update POA');
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/poas/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete POA');
    }
  },

  async addActividad(poaId: string, actividad: Omit<Actividad, 'id'>): Promise<POA> {
    const response = await apiClient.post<{ data: POA }>(`/poas/${poaId}/actividades`, actividad);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to add actividad');
  },

  async updateActividad(poaId: string, actividadId: string, actividad: Partial<Actividad>): Promise<POA> {
    const response = await apiClient.put<{ data: POA }>(`/poas/${poaId}/actividades/${actividadId}`, actividad);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    throw new Error(response.message || 'Failed to update actividad');
  },

  async deleteActividad(poaId: string, actividadId: string): Promise<void> {
    const response = await apiClient.delete(`/poas/${poaId}/actividades/${actividadId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete actividad');
    }
  },
};

