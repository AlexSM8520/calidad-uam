import type { Indicador } from '../models/Indicador';
import { indicadorService } from '../services/indicadorService';
import { useAuthStore } from '../stores/authStore';
import { normalizeArray, normalizeId, extractId } from '../utils/modelHelpers';

export class IndicadorViewModel {
  private indicadores: Indicador[] = [];
  private selectedLineaId: string | null = null;
  private selectedObjetivoId: string | null = null;
  private isFormOpen: boolean = false;
  private listeners: Array<() => void> = [];
  private dataLoaded: boolean = false;

  constructor() {
    // Subscribe to auth changes and load data when authenticated
    useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated && !this.dataLoaded) {
          this.loadIndicadores();
        } else if (!isAuthenticated) {
          // Clear data when logged out
          this.indicadores = [];
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
        this.loadIndicadores();
      }
    }, 100);
  }

  private async loadIndicadores() {
    try {
      const indicadores = await indicadorService.getAll();
      // Filter out any undefined/null indicadores before normalizing
      const validIndicadores = indicadores.filter(ind => ind != null);
      this.indicadores = normalizeArray(validIndicadores);
      this.dataLoaded = true;
      this.notify();
    } catch (error) {
      console.error('Error loading indicadores:', error);
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

  getIndicadores(): Indicador[] {
    if (this.selectedLineaId === null) {
      return [];
    }
    if (this.selectedObjetivoId === null) {
      return this.indicadores.filter(ind => {
        if (!ind) return false;
        // Handle lineaId as string or object - use extractId helper
        const indLineaId = extractId(ind.lineaId);
        return indLineaId === this.selectedLineaId;
      });
    }
    return this.indicadores.filter(ind => {
      if (!ind) return false;
      // Handle lineaId and objetivoId as string or object - use extractId helper
      const indLineaId = extractId(ind.lineaId);
      const indObjetivoId = extractId(ind.objetivoId);
      return indLineaId === this.selectedLineaId && indObjetivoId === this.selectedObjetivoId;
    });
  }

  getAllIndicadores(): Indicador[] {
    return this.indicadores;
  }

  getSelectedLineaId(): string | null {
    return this.selectedLineaId;
  }

  getSelectedObjetivoId(): string | null {
    return this.selectedObjetivoId;
  }

  setSelectedLineaId(lineaId: string | null): void {
    this.selectedLineaId = lineaId;
    if (lineaId === null) {
      this.selectedObjetivoId = null;
    }
    this.notify();
  }

  setSelectedObjetivoId(objetivoId: string | null): void {
    this.selectedObjetivoId = objetivoId;
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

  async addIndicador(indicador: Omit<Indicador, 'id' | '_id'>): Promise<void> {
    try {
      const newIndicador = await indicadorService.create(indicador);
      if (!newIndicador) {
        throw new Error('Failed to create indicador: No data returned');
      }
      const normalized = normalizeId(newIndicador);
      // Validate that normalized indicador has required fields
      if (!normalized.nombre || !normalized.descripcion || !normalized.lineaId || !normalized.objetivoId) {
        console.error('Invalid indicador returned from server:', normalized);
        throw new Error('Invalid indicador data returned from server');
      }
      this.indicadores = [...this.indicadores, normalized];
      this.notify();
    } catch (error) {
      console.error('Error adding indicador:', error);
      throw error;
    }
  }

  async deleteIndicador(id: string): Promise<void> {
    try {
      await indicadorService.delete(id);
      this.indicadores = this.indicadores.filter(ind => extractId(ind) !== id);
      this.notify();
    } catch (error) {
      throw error;
    }
  }
}

// Singleton instance
export const indicadorViewModel = new IndicadorViewModel();

