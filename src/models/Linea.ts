export type PlanType = 'Plan institucional' | 'Plan nacional';

export interface Linea {
  id?: string;
  _id?: string; // MongoDB format
  nombre: string;
  descripcion: string;
  duracion: number; // in months
  fechaInicio: string;
  fechaFin: string;
  color: string;
  plan: PlanType;
  createdAt?: string;
  updatedAt?: string;
}

