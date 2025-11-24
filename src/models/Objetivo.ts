export interface Objetivo {
  id?: string;
  _id?: string; // MongoDB format
  nombre: string;
  descripcion: string;
  codigoReferencia: string;
  lineaId: string | { _id: string; nombre: string }; // Reference to Linea (puede venir como objeto)
  createdAt?: string;
  updatedAt?: string;
}

