export type POAType = 'carrera' | 'area';
export type FrecuenciaReporte = 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual';

export interface Actividad {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string; // Usa las fechas del POA
  fechaFin: string; // Usa las fechas del POA
  responsable: string;
  estado: 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada';
  frecuencia: FrecuenciaReporte;
  lineaId: string; // Línea estratégica relacionada
  objetivoId: string; // Objetivo relacionado
  indicadorId: string; // Indicador con el que se medirá
}

export interface POA {
  id: string;
  tipo: POAType;
  areaId?: string;
  carreraId?: string;
  periodo: number; // year
  fechaInicio: string;
  fechaFin: string;
  actividades: Actividad[];
}

