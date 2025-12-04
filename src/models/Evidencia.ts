export type EvidenciaTipo = 'archivo' | 'imagen';

export interface Evidencia {
  id?: string;
  _id?: string; // MongoDB format
  nombre: string;
  descripcion?: string;
  tipo: EvidenciaTipo;
  archivo: string; // filename on server
  nombreOriginal: string; // original filename
  mimeType: string;
  tamaño: number; // bytes
  actividadId: string;
  poaId: string | { _id?: string; tipo?: string; periodo?: number };
  uploadedBy?: {
    _id: string;
    username: string;
    nombre?: string;
    apellido?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

