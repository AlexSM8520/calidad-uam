import type { Evidencia } from '../models/Evidencia';
import { evidenciaService } from '../services/evidenciaService';
import { useAuthStore } from '../stores/authStore';
import { normalizeArray, normalizeId, extractId } from '../utils/modelHelpers';

export class EvidenciaViewModel {
  private evidencias: Evidencia[] = [];
  private listeners: Array<() => void> = [];
  private dataLoaded: boolean = false;

  constructor() {
    // Subscribe to auth changes and load data when authenticated
    useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated && !this.dataLoaded) {
          this.loadEvidencias();
        } else if (!isAuthenticated) {
          // Clear data when logged out
          this.evidencias = [];
          this.dataLoaded = false;
          this.notify();
        }
      },
      { equalityFn: (a, b) => a === b }
    );

    // Load data if already authenticated
    if (useAuthStore.getState().isAuthenticated) {
      this.loadEvidencias();
    }
  }

  private async loadEvidencias() {
    try {
      const evidencias = await evidenciaService.getAll();
      this.evidencias = normalizeArray(evidencias);
      this.dataLoaded = true;
      this.notify();
    } catch (error) {
      console.error('Error loading evidencias:', error);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    listener();
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getEvidencias(): Evidencia[] {
    return [...this.evidencias];
  }

  getEvidenciasByActividad(actividadId: string): Evidencia[] {
    return this.evidencias.filter(e => extractId(e.actividadId) === actividadId);
  }

  getEvidenciasByPOA(poaId: string): Evidencia[] {
    return this.evidencias.filter(e => {
      const evidenciaPoaId = typeof e.poaId === 'object' ? extractId(e.poaId) : e.poaId;
      return evidenciaPoaId === poaId;
    });
  }

  getEvidencia(evidenciaId: string): Evidencia | undefined {
    return this.evidencias.find(e => extractId(e) === evidenciaId);
  }

  async uploadEvidencia(
    file: File,
    actividadId: string,
    poaId: string,
    nombre?: string,
    descripcion?: string
  ): Promise<Evidencia> {
    try {
      const newEvidencia = await evidenciaService.create(file, actividadId, poaId, nombre, descripcion);
      const normalized = normalizeId(newEvidencia);
      this.evidencias.push(normalized);
      this.notify();
      return normalized;
    } catch (error) {
      console.error('Error uploading evidencia:', error);
      throw error;
    }
  }

  async updateEvidencia(evidenciaId: string, evidenciaData: { nombre?: string; descripcion?: string }): Promise<void> {
    try {
      const updatedEvidencia = await evidenciaService.update(evidenciaId, evidenciaData);
      const normalized = normalizeId(updatedEvidencia);
      const index = this.evidencias.findIndex(e => extractId(e) === evidenciaId);
      if (index !== -1) {
        this.evidencias[index] = normalized;
        this.notify();
      }
    } catch (error) {
      console.error('Error updating evidencia:', error);
      throw error;
    }
  }

  async deleteEvidencia(evidenciaId: string): Promise<void> {
    try {
      await evidenciaService.delete(evidenciaId);
      this.evidencias = this.evidencias.filter(e => extractId(e) !== evidenciaId);
      this.notify();
    } catch (error) {
      console.error('Error deleting evidencia:', error);
      throw error;
    }
  }

  async refreshEvidencias(actividadId?: string, poaId?: string) {
    try {
      const evidencias = await evidenciaService.getAll(actividadId, poaId);
      this.evidencias = normalizeArray(evidencias);
      this.notify();
    } catch (error) {
      console.error('Error refreshing evidencias:', error);
    }
  }
}

export const evidenciaViewModel = new EvidenciaViewModel();

