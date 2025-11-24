import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authViewModel } from '../../viewmodels/AuthViewModel';
import type { UserRole } from '../../models/User';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const authState = authViewModel.getAuthState();

  if (!authState.isAuthenticated || !authState.user) {
    return <Navigate to="/login" replace />;
  }

  // Map 'Usuario' role to check for both 'Usuario' and old role names
  const userRole = authState.user.rol;
  const isAllowed = allowedRoles.includes(userRole) || 
    (userRole === 'Usuario' && allowedRoles.includes('Visualizador' as any)) ||
    (userRole === 'Usuario' && allowedRoles.includes('Editor' as any));
  
  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

