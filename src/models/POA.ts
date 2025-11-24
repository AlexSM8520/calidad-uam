export type POAType = 'carrera' | 'area';
export type FrecuenciaReporte = 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual';

export interface Actividad {
  id?: string;
  _id?: string; // MongoDB format
  nombre: string;
  descripcion: string;
  fechaInicio: string; // Usa las fechas del POA
  fechaFin: string; // Usa las fechas del POA
  responsable: string;
  estado: 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada';
  frecuencia: FrecuenciaReporte;
  lineaId: string | { _id: string; nombre: string }; // Línea estratégica relacionada (puede venir como objeto)
  objetivoId: string | { _id: string; nombre: string }; // Objetivo relacionado (puede venir como objeto)
  indicadorId: string | { _id: string; nombre: string }; // Indicador con el que se medirá (puede venir como objeto)
  createdAt?: string;
  updatedAt?: string;
}

export interface POA {
  id?: string;
  _id?: string; // MongoDB format
  tipo: POAType;
  areaId?: string | null;
  carreraId?: string | null;
  periodo: number; // year
  fechaInicio: string;
  fechaFin: string;
  actividades: Actividad[];
  createdBy?: {
    _id: string;
    username: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

