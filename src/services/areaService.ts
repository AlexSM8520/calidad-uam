import { apiClient } from './api';
import type { Area } from '../models/Area';

export const areaService = {
  async getAll(): Promise<Area[]> {
    const response = await apiClient.get<{ data: Area[]; count: number }>('/areas');
    if (response.success && response.data) {
      // Handle different response structures
      const areas = (response.data as any).data || response.data;
      if (Array.isArray(areas)) {
        return areas;
      }
      // If response.data is the array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    return [];
  },

  async getById(id: string): Promise<Area | null> {
    const response = await apiClient.get<{ data: Area }>(`/areas/${id}`);
    if (response.success && response.data) {
      return (response.data as any).data;
    }
    return null;
  },

  async create(areaData: Omit<Area, 'id'>): Promise<Area> {
    const response = await apiClient.post<{ data: Area }>('/areas', areaData);
    if (response.success && response.data) {
      // Handle different response structures
      const area = (response.data as any).data || response.data;
      if (!area) {
        throw new Error('No area data returned from server');
      }
      // Ensure all required fields are present
      if (!area.nombre) {
        console.error('Incomplete area data:', area);
        throw new Error('Incomplete area data returned from server');
      }
      return area;
    }
    throw new Error(response.message || 'Failed to create area');
  },

  async update(id: string, areaData: Partial<Omit<Area, 'id'>>): Promise<Area> {
    const response = await apiClient.put<{ data: Area }>(`/areas/${id}`, areaData);
    if (response.success && response.data) {
      // Handle different response structures
      const area = (response.data as any).data || response.data;
      if (!area) {
        throw new Error('No area data returned from server');
      }
      return area;
    }
    throw new Error(response.message || 'Failed to update area');
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/areas/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete area');
    }
  },
};

