export interface Carrera {
  id?: string;
  _id?: string; // MongoDB format
  nombre: string;
  descripcion?: string;
  facultad: string;
  facultadId?: string;
  createdAt?: string;
  updatedAt?: string;
}

