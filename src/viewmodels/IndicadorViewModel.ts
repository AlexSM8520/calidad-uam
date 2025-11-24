import type { Indicador } from '../models/Indicador';

export class IndicadorViewModel {
  private indicadores: Indicador[] = [];
  private selectedLineaId: string | null = null;
  private selectedObjetivoId: string | null = null;
  private isFormOpen: boolean = false;
  private listeners: Array<() => void> = [];

  constructor() {
    // Initialize with example data
    // Indicadores para Linea Verde - Objetivo 1 (Reducir consumo energético)
    this.indicadores = [
      {
        id: '1',
        lineaId: '1',
        objetivoId: '1',
        nombre: 'Reducción porcentual de consumo energético',
        descripcion: 'Porcentaje de reducción en el consumo de energía eléctrica comparado con el año anterior',
        calculo: '(Consumo año anterior - Consumo año actual) / Consumo año anterior * 100',
        codigo: 'LV-OBJ-001-IND-001',
        frecuencia: 'Mensual',
        unidad: '%',
        meta: 30,
        estado: 'Activo',
      },
      {
        id: '2',
        lineaId: '1',
        objetivoId: '1',
        nombre: 'Consumo energético total en kWh',
        descripcion: 'Consumo total de energía eléctrica en kilovatios hora',
        calculo: 'Suma de lecturas de medidores eléctricos',
        codigo: 'LV-OBJ-001-IND-002',
        frecuencia: 'Mensual',
        unidad: 'kWh',
        meta: 50000,
        estado: 'Activo',
      },
      // Indicadores para Linea Verde - Objetivo 2 (Reciclaje)
      {
        id: '3',
        lineaId: '1',
        objetivoId: '2',
        nombre: 'Tasa de reciclaje',
        descripcion: 'Porcentaje de residuos reciclados del total de residuos generados',
        calculo: '(Residuos reciclados / Total residuos generados) * 100',
        codigo: 'LV-OBJ-002-IND-001',
        frecuencia: 'Mensual',
        unidad: '%',
        meta: 60,
        estado: 'Activo',
      },
      // Indicadores para Linea de Innovación Tecnológica - Objetivo 4
      {
        id: '4',
        lineaId: '2',
        objetivoId: '4',
        nombre: 'Porcentaje de procesos digitalizados',
        descripcion: 'Porcentaje de procesos administrativos que han sido migrados a plataformas digitales',
        calculo: '(Procesos digitalizados / Total procesos) * 100',
        codigo: 'IT-OBJ-001-IND-001',
        frecuencia: 'Trimestral',
        unidad: '%',
        meta: 80,
        estado: 'Activo',
      },
      {
        id: '5',
        lineaId: '2',
        objetivoId: '4',
        nombre: 'Tiempo promedio de procesamiento',
        descripcion: 'Tiempo promedio en días para completar procesos administrativos digitalizados',
        calculo: 'Suma de tiempos de procesamiento / Número de procesos',
        codigo: 'IT-OBJ-001-IND-002',
        frecuencia: 'Mensual',
        unidad: 'días',
        meta: 3,
        estado: 'Activo',
      },
      // Indicadores para Linea de Excelencia Académica - Objetivo 7
      {
        id: '6',
        lineaId: '3',
        objetivoId: '7',
        nombre: 'Número de publicaciones indexadas',
        descripcion: 'Cantidad de publicaciones en revistas indexadas en bases de datos internacionales',
        calculo: 'Conteo de publicaciones indexadas',
        codigo: 'EA-OBJ-001-IND-001',
        frecuencia: 'Anual',
        unidad: 'publicaciones',
        meta: 120,
        estado: 'Activo',
      },
      {
        id: '7',
        lineaId: '3',
        objetivoId: '7',
        nombre: 'Factor de impacto promedio',
        descripcion: 'Factor de impacto promedio de las revistas donde se publican los artículos',
        calculo: 'Suma de factores de impacto / Número de publicaciones',
        codigo: 'EA-OBJ-001-IND-002',
        frecuencia: 'Anual',
        unidad: 'puntos',
        meta: 2.5,
        estado: 'Activo',
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

  getIndicadores(): Indicador[] {
    if (this.selectedLineaId === null) {
      return [];
    }
    if (this.selectedObjetivoId === null) {
      return this.indicadores.filter(ind => ind.lineaId === this.selectedLineaId);
    }
    return this.indicadores.filter(
      ind => ind.lineaId === this.selectedLineaId && ind.objetivoId === this.selectedObjetivoId
    );
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

  addIndicador(indicador: Omit<Indicador, 'id'>): void {
    const newIndicador: Indicador = {
      ...indicador,
      id: Date.now().toString(),
    };
    this.indicadores = [...this.indicadores, newIndicador];
    this.notify();
  }

  deleteIndicador(id: string): void {
    this.indicadores = this.indicadores.filter(ind => ind.id !== id);
    this.notify();
  }
}

// Singleton instance
export const indicadorViewModel = new IndicadorViewModel();

