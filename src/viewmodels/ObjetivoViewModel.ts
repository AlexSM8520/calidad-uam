import type { Objetivo } from '../models/Objetivo';
import { objetivoService } from '../services/objetivoService';
import { useAuthStore } from '../stores/authStore';
import { normalizeArray, normalizeId, extractId } from '../utils/modelHelpers';

export class ObjetivoViewModel {
  private objetivos: Objetivo[] = [];
  private selectedLineaId: string | null = null;
  private isFormOpen: boolean = false;
  private listeners: Array<() => void> = [];
  private dataLoaded: boolean = false;

  constructor() {
    // Subscribe to auth changes and load data when authenticated
    useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated && !this.dataLoaded) {
          this.loadObjetivos();
        } else if (!isAuthenticated) {
          // Clear data when logged out
          this.objetivos = [];
          this.dataLoaded = false;
          this.notify();
        }
      },
      { equalityFn: (a, b) => a === b }
    );

    // Load data if already authenticated
    // Use setTimeout to ensure store is fully initialized
    setTimeout(() => {
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated && !this.dataLoaded) {
        console.log('ObjetivoViewModel: User already authenticated, loading objetivos');
        this.loadObjetivos();
      }
    }, 100);
  }

  private async loadObjetivos() {
    try {
      const objetivos = await objetivoService.getAll();
      // Filter out any undefined/null objetivos before normalizing
      const validObjetivos = objetivos.filter(obj => obj != null);
      this.objetivos = normalizeArray(validObjetivos);
      this.dataLoaded = true;
      this.notify();
    } catch (error) {
      console.error('Error loading objetivos:', error);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    listener();

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  getObjetivos(): Objetivo[] {
    if (this.selectedLineaId === null) {
      return [];
    }
    return this.objetivos.filter(obj => {
      if (!obj) return false;
      // Handle lineaId as string or object - use extractId helper
      const objLineaId = extractId(obj.lineaId);
      return objLineaId === this.selectedLineaId;
    });
  }

  getAllObjetivos(): Objetivo[] {
    return this.objetivos;
  }

  getSelectedLineaId(): string | null {
    return this.selectedLineaId;
  }

  setSelectedLineaId(lineaId: string | null): void {
    this.selectedLineaId = lineaId;
    this.notify();
  }

  getIsFormOpen(): boolean {
    return this.isFormOpen;
  }

  openForm(): void {
    this.isFormOpen = true;
    this.notify();
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.notify();
  }

  async addObjetivo(objetivo: Omit<Objetivo, 'id' | '_id'>): Promise<void> {
    try {
      const newObjetivo = await objetivoService.create(objetivo);
      if (!newObjetivo) {
        throw new Error('Failed to create objetivo: No data returned');
      }
      const normalized = normalizeId(newObjetivo);
      // Validate that normalized objetivo has required fields
      if (!normalized.nombre || !normalized.descripcion || !normalized.lineaId) {
        console.error('Invalid objetivo returned from server:', normalized);
        throw new Error('Invalid objetivo data returned from server');
      }
      this.objetivos = [...this.objetivos, normalized];
      this.notify();
    } catch (error) {
      console.error('Error adding objetivo:', error);
      throw error;
    }
  }

  async deleteObjetivo(id: string): Promise<void> {
    try {
      await objetivoService.delete(id);
      this.objetivos = this.objetivos.filter(obj => extractId(obj) !== id);
      this.notify();
    } catch (error) {
      throw error;
    }
  }
}

// Singleton instance
export const objetivoViewModel = new ObjetivoViewModel();

