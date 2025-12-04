import { apiClient } from './api';
import type { POA, Actividad } from '../models/POA';

export const poaService = {
  async getAll(): Promise<POA[]> {
    const response = await apiClient.get<{ data: POA[]; count: number }>('/poas');
    if (response.success && response.data) {
      // Handle different response structures
      const poas = (response.data as any).data || response.data;
      if (Array.isArray(poas)) {
        // Ensure each POA has actividades as an array
        return poas.map(poa => ({
          ...poa,
          actividades: poa.actividades || []
        }));
      }
      // If response.data is the array directly
      if (Array.isArray(response.data)) {
        return response.data.map(poa => ({
          ...poa,
          actividades: poa.actividades || []
        }));
      }
    }
    return [];
  },

  async getById(id: string): Promise<POA | null> {
    const response = await apiClient.get<{ data: POA }>(`/poas/${id}`);
    if (response.success && response.data) {
      // Handle different response structures
      const poa = (response.data as any).data || response.data;
      if (!poa) {
        return null;
      }
      // Ensure actividades is always an array
      if (!poa.actividades) {
        poa.actividades = [];
      }
      return poa;
    }
    return null;
  },

  async create(poaData: Omit<POA, 'id' | 'actividades'> & { actividades?: Omit<Actividad, 'id'>[] }): Promise<POA> {
    const response = await apiClient.post<{ data: POA }>('/poas', poaData);
    if (response.success && response.data) {
      // Handle different response structures
      const poa = (response.data as any).data || response.data;
      if (!poa) {
        throw new Error('No POA data returned from server');
      }
      // Ensure actividades is always an array
      if (!poa.actividades) {
        poa.actividades = [];
      }
      return poa;
    }
    throw new Error(response.message || 'Failed to create POA');
  },

  async update(id: string, poaData: Partial<Omit<POA, 'id' | 'actividades'>>): Promise<POA> {
    const response = await apiClient.put<{ data: POA }>(`/poas/${id}`, poaData);
    if (response.success && response.data) {
      // Handle different response structures
      const poa = (response.data as any).data || response.data;
      if (!poa) {
        throw new Error('No POA data returned from server');
      }
      // Ensure actividades is always an array
      if (!poa.actividades) {
        poa.actividades = [];
      }
      return poa;
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
      // Handle different response structures
      const poa = (response.data as any).data || response.data;
      if (!poa) {
        throw new Error('No POA data returned from server');
      }
      // Ensure actividades is always an array
      if (!poa.actividades) {
        poa.actividades = [];
      }
      return poa;
    }
    throw new Error(response.message || 'Failed to add actividad');
  },

  async updateActividad(poaId: string, actividadId: string, actividad: Partial<Actividad>): Promise<POA> {
    const response = await apiClient.put<{ data: POA }>(`/poas/${poaId}/actividades/${actividadId}`, actividad);
    if (response.success && response.data) {
      // Handle different response structures
      const poa = (response.data as any).data || response.data;
      if (!poa) {
        throw new Error('No POA data returned from server');
      }
      // Ensure actividades is always an array
      if (!poa.actividades) {
        poa.actividades = [];
      }
      return poa;
    }
    throw new Error(response.message || 'Failed to update actividad');
  },

  async deleteActividad(poaId: string, actividadId: string): Promise<POA> {
    const response = await apiClient.delete<{ data: POA }>(`/poas/${poaId}/actividades/${actividadId}`);
    if (response.success && response.data) {
      // Handle different response structures
      const poa = (response.data as any).data || response.data;
      if (!poa) {
        throw new Error('No POA data returned from server');
      }
      // Ensure actividades is always an array
      if (!poa.actividades) {
        poa.actividades = [];
      }
      return poa;
    }
    throw new Error(response.message || 'Failed to delete actividad');
  },
};

