import { apiClient } from './api';
import type { Linea } from '../models/Linea';

export const lineaService = {
  async getAll(): Promise<Linea[]> {
    const response = await apiClient.get<{ data: Linea[]; count: number }>('/lineas');
    console.log('LineaService.getAll response:', response);
    if (response.success && response.data) {
      // Handle different response structures
      const lineas = (response.data as any).data || response.data;
      console.log('Lineas parsed:', lineas);
      if (Array.isArray(lineas)) {
        return lineas;
      }
      // If response.data is the array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    console.warn('No lineas data found in response');
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
      // Handle different response structures
      const linea = (response.data as any).data || response.data;
      if (!linea) {
        throw new Error('No linea data returned from server');
      }
      // Ensure all required fields are present
      if (!linea.nombre || !linea.descripcion) {
        console.error('Incomplete linea data:', linea);
        throw new Error('Incomplete linea data returned from server');
      }
      return linea;
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

