export type PlanType = 'Plan institucional' | 'Plan nacional';

export interface Linea {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number; // in months
  fechaInicio: string;
  fechaFin: string;
  color: string;
  plan: PlanType;
}

