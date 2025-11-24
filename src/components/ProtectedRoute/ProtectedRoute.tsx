import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authViewModel } from '../../viewmodels/AuthViewModel';
import type { AuthState } from '../../models/User';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [authState, setAuthState] = useState<AuthState>(authViewModel.getAuthState());

  useEffect(() => {
    const unsubscribe = authViewModel.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

