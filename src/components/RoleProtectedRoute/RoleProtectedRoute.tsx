import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../models/User';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Map 'Usuario' role to check for both 'Usuario' and old role names
  const userRole = user.rol;
  const isAllowed = allowedRoles.includes(userRole) || 
    (userRole === 'Usuario' && allowedRoles.includes('Visualizador' as any)) ||
    (userRole === 'Usuario' && allowedRoles.includes('Editor' as any));
  
  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

