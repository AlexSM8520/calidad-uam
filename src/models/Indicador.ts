export type Frecuencia = 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual';
export type EstadoIndicador = 'Activo' | 'Inactivo' | 'En Revisión' | 'Completado';

export interface Indicador {
  id?: string;
  _id?: string; // MongoDB format
  lineaId: string | { _id: string; nombre: string }; // Reference to Linea (puede venir como objeto)
  objetivoId: string | { _id: string; nombre: string }; // Reference to Objetivo (puede venir como objeto)
  nombre: string;
  descripcion: string;
  calculo: string; // Cálculo o métrica
  codigo: string;
  frecuencia: Frecuencia;
  unidad: string;
  meta: number;
  estado: EstadoIndicador;
  createdAt?: string;
  updatedAt?: string;
}

