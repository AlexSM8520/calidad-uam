export type UserRole = 'Administrador' | 'Usuario';

export interface User {
  id?: string;
  _id?: string; // MongoDB format
  username: string;
  password?: string; // Not returned from API
  email?: string;
  nombre?: string;
  apellido?: string;
  rol: UserRole;
  activo: boolean;
  carreraId?: string | null;
  areaId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

