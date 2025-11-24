export type Frecuencia = 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual';
export type EstadoIndicador = 'Activo' | 'Inactivo' | 'En Revisión' | 'Completado';

export interface Indicador {
  id: string;
  lineaId: string; // Reference to Linea
  objetivoId: string; // Reference to Objetivo
  nombre: string;
  descripcion: string;
  calculo: string; // Cálculo o métrica
  codigo: string;
  frecuencia: Frecuencia;
  unidad: string;
  meta: number;
  estado: EstadoIndicador;
}

