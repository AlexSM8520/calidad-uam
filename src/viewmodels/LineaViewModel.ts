import type { Linea } from '../models/Linea';

export class LineaViewModel {
  private lineas: Linea[] = [];
  private isFormOpen: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    // Initialize with example data
    this.lineas = [
      {
        id: '1',
        nombre: 'Linea Verde',
        descripcion: 'Iniciativa para promover la sostenibilidad ambiental en el campus universitario',
        duracion: 24,
        fechaInicio: '2024-01-15',
        fechaFin: '2025-12-15',
        color: '#22c55e',
        plan: 'Plan institucional',
      },
      {
        id: '2',
        nombre: 'Linea de Innovación Tecnológica',
        descripcion: 'Fortalecimiento de las capacidades tecnológicas y digitales de la universidad',
        duracion: 36,
        fechaInicio: '2024-03-01',
        fechaFin: '2027-02-28',
        color: '#3b82f6',
        plan: 'Plan nacional',
      },
      {
        id: '3',
        nombre: 'Linea de Excelencia Académica',
        descripcion: 'Mejora continua de los procesos académicos y de investigación',
        duracion: 48,
        fechaInicio: '2024-01-01',
        fechaFin: '2027-12-31',
        color: '#8b5cf6',
        plan: 'Plan institucional',
      },
    ];
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

  addLinea(linea: Omit<Linea, 'id'>): void {
    const newLinea: Linea = {
      ...linea,
      id: Date.now().toString(),
    };
    this.lineas = [...this.lineas, newLinea];
    this.notify();
  }

  deleteLinea(id: string): void {
    this.lineas = this.lineas.filter(l => l.id !== id);
    this.notify();
  }
}

// Singleton instance
export const lineaViewModel = new LineaViewModel();

