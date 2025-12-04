import { apiClient } from './api';
import type { Evidencia } from '../models/Evidencia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const evidenciaService = {
  async getAll(actividadId?: string, poaId?: string): Promise<Evidencia[]> {
    const params = new URLSearchParams();
    if (actividadId) params.append('actividadId', actividadId);
    if (poaId) params.append('poaId', poaId);
    const url = params.toString() ? `/evidencias?${params.toString()}` : '/evidencias';
    
    const response = await apiClient.get<{ data: Evidencia[]; count: number }>(url);
    if (response.success && response.data) {
      // Handle different response structures
      const evidencias = (response.data as any).data || response.data;
      if (Array.isArray(evidencias)) {
        return evidencias;
      }
      // If response.data is the array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    return [];
  },

  async getById(id: string): Promise<Evidencia | null> {
    const response = await apiClient.get<{ data: Evidencia }>(`/evidencias/${id}`);
    if (response.success && response.data) {
      return (response.data as any).data || response.data;
    }
    return null;
  },

  async create(
    file: File,
    actividadId: string,
    poaId: string,
    nombre?: string,
    descripcion?: string
  ): Promise<Evidencia> {
    const token = apiClient.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('actividadId', actividadId);
    formData.append('poaId', poaId);
    if (nombre) formData.append('nombre', nombre);
    if (descripcion) formData.append('descripcion', descripcion);

    const url = `${API_BASE_URL}/evidencias`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        apiClient.setToken(null);
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.message || 'Failed to upload evidencia');
  },

  async update(id: string, evidenciaData: { nombre?: string; descripcion?: string }): Promise<Evidencia> {
    const response = await apiClient.put<{ data: Evidencia }>(`/evidencias/${id}`, evidenciaData);
    if (response.success && response.data) {
      return (response.data as any).data || response.data;
    }
    throw new Error(response.message || 'Failed to update evidencia');
  },

  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/evidencias/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete evidencia');
    }
  },

  getFileUrl(archivo: string): string {
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}/public/evidencia/${archivo}`;
  },
};

