import type { Linea } from '../models/Linea';
import { lineaService } from '../services/lineaService';
import { useAuthStore } from '../stores/authStore';
import { normalizeArray, normalizeId, extractId } from '../utils/modelHelpers';

export class LineaViewModel {
  private lineas: Linea[] = [];
  private isFormOpen: boolean = false;
  private listeners: Array<() => void> = [];
  private dataLoaded: boolean = false;

  constructor() {
    // Subscribe to auth changes and load data when authenticated
    useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated && !this.dataLoaded) {
          this.loadLineas();
        } else if (!isAuthenticated) {
          // Clear data when logged out
          this.lineas = [];
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
        console.log('LineaViewModel: User already authenticated, loading lineas');
        this.loadLineas();
      }
    }, 100);
  }

  private async loadLineas() {
    try {
      console.log('Loading lineas...');
      const lineas = await lineaService.getAll();
      console.log('Lineas received from service:', lineas);
      const normalized = normalizeArray(lineas);
      console.log('Lineas normalized:', normalized);
      this.lineas = normalized;
      this.dataLoaded = true;
      this.notify();
      console.log('Lineas loaded, count:', this.lineas.length);
    } catch (error) {
      console.error('Error loading lineas:', error);
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

  getLineas(): Linea[] {
    return this.lineas;
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

  async addLinea(linea: Omit<Linea, 'id' | '_id'>): Promise<void> {
    try {
      const newLinea = await lineaService.create(linea);
      if (!newLinea) {
        throw new Error('Failed to create linea: No data returned');
      }
      const normalized = normalizeId(newLinea);
      // Validate that normalized linea has required fields
      if (!normalized.nombre || !normalized.descripcion) {
        console.error('Invalid linea returned from server:', normalized);
        throw new Error('Invalid linea data returned from server');
      }
      this.lineas = [...this.lineas, normalized];
      this.notify();
    } catch (error) {
      console.error('Error adding linea:', error);
      throw error;
    }
  }

  async deleteLinea(id: string): Promise<void> {
    try {
      await lineaService.delete(id);
      this.lineas = this.lineas.filter(l => extractId(l) !== id);
      this.notify();
    } catch (error) {
      throw error;
    }
  }
}

// Singleton instance
export const lineaViewModel = new LineaViewModel();

