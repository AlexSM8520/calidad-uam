import type { Objetivo } from '../models/Objetivo';

export class ObjetivoViewModel {
  private objetivos: Objetivo[] = [];
  private selectedLineaId: string | null = null;
  private isFormOpen: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    // Initialize with example data related to the lineas estratégicas
    // Linea Verde (id: '1')
    this.objetivos = [
      {
        id: '1',
        nombre: 'Reducir consumo energético en un 30%',
        descripcion: 'Implementar medidas de eficiencia energética en todas las instalaciones del campus para reducir el consumo de energía en un 30% durante los próximos 2 años',
        codigoReferencia: 'LV-OBJ-001',
        lineaId: '1', // Linea Verde
      },
      {
        id: '2',
        nombre: 'Implementar programa de reciclaje integral',
        descripcion: 'Establecer un sistema completo de reciclaje que cubra todos los tipos de residuos generados en el campus universitario',
        codigoReferencia: 'LV-OBJ-002',
        lineaId: '1', // Linea Verde
      },
      {
        id: '3',
        nombre: 'Aumentar áreas verdes en un 25%',
        descripcion: 'Expandir las áreas verdes del campus mediante la plantación de árboles nativos y creación de jardines sostenibles',
        codigoReferencia: 'LV-OBJ-003',
        lineaId: '1', // Linea Verde
      },
      // Linea de Innovación Tecnológica (id: '2')
      {
        id: '4',
        nombre: 'Digitalizar el 80% de los procesos administrativos',
        descripcion: 'Migrar los procesos administrativos tradicionales a plataformas digitales para mejorar la eficiencia y accesibilidad',
        codigoReferencia: 'IT-OBJ-001',
        lineaId: '2', // Linea de Innovación Tecnológica
      },
      {
        id: '5',
        nombre: 'Implementar aulas inteligentes en todas las facultades',
        descripcion: 'Equipar todas las aulas con tecnología de última generación para mejorar la experiencia de enseñanza y aprendizaje',
        codigoReferencia: 'IT-OBJ-002',
        lineaId: '2', // Linea de Innovación Tecnológica
      },
      {
        id: '6',
        nombre: 'Capacitar al 100% del personal en herramientas digitales',
        descripcion: 'Proporcionar capacitación continua en herramientas digitales a todo el personal docente y administrativo',
        codigoReferencia: 'IT-OBJ-003',
        lineaId: '2', // Linea de Innovación Tecnológica
      },
      // Linea de Excelencia Académica (id: '3')
      {
        id: '7',
        nombre: 'Aumentar publicaciones indexadas en un 40%',
        descripcion: 'Fomentar la investigación de calidad y aumentar el número de publicaciones en revistas indexadas internacionalmente',
        codigoReferencia: 'EA-OBJ-001',
        lineaId: '3', // Linea de Excelencia Académica
      },
      {
        id: '8',
        nombre: 'Mejorar tasa de retención estudiantil al 90%',
        descripcion: 'Implementar programas de apoyo estudiantil y seguimiento para mejorar la retención y graduación de estudiantes',
        codigoReferencia: 'EA-OBJ-002',
        lineaId: '3', // Linea de Excelencia Académica
      },
      {
        id: '9',
        nombre: 'Acreditar el 100% de los programas académicos',
        descripcion: 'Obtener acreditación nacional e internacional para todos los programas académicos de la universidad',
        codigoReferencia: 'EA-OBJ-003',
        lineaId: '3', // Linea de Excelencia Académica
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

  getObjetivos(): Objetivo[] {
    if (this.selectedLineaId === null) {
      return [];
    }
    return this.objetivos.filter(obj => obj.lineaId === this.selectedLineaId);
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

  addObjetivo(objetivo: Omit<Objetivo, 'id'>): void {
    const newObjetivo: Objetivo = {
      ...objetivo,
      id: Date.now().toString(),
    };
    this.objetivos = [...this.objetivos, newObjetivo];
    this.notify();
  }

  deleteObjetivo(id: string): void {
    this.objetivos = this.objetivos.filter(obj => obj.id !== id);
    this.notify();
  }
}

// Singleton instance
export const objetivoViewModel = new ObjetivoViewModel();

