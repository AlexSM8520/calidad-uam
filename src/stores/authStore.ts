import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { User, AuthState } from '../models/User';

interface AuthStore extends AuthState {
  isInitializing: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    password: string;
    email?: string;
    nombre?: string;
    apellido?: string;
    carreraId?: string;
    areaId?: string;
  }) => Promise<boolean>;
  logout: () => void;
  initialize: () => Promise<void>;
  loadCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      isInitializing: true,

      initialize: async () => {
        // Check if user is already logged in (from token)
        const hasToken = authService.isAuthenticated();
        const currentState = get();
        
        if (hasToken) {
          // If we already have user data from rehydration, keep it
          // Only fetch from API if we don't have user data
          if (currentState.user && currentState.isAuthenticated) {
            // User already restored from localStorage and authenticated
            // Just mark as initialized, no need to verify with API
            set({ isInitializing: false });
          } else if (currentState.user) {
            // User exists but not authenticated, restore authenticated state
            set({ isAuthenticated: true, isInitializing: false });
          } else {
            // No user in state, try to restore from API
            try {
              await get().loadCurrentUser();
            } catch (error) {
              // If loadCurrentUser fails, don't clear if we have a token
              // Just mark as initialized
              console.error('Failed to load current user, but keeping session:', error);
              set({ isInitializing: false });
            }
          }
        } else {
          // No token, clear everything
          set({ user: null, isAuthenticated: false, isInitializing: false });
        }
      },

      loadCurrentUser: async () => {
        try {
          const user = await authService.getCurrentUser();
          set({
            isAuthenticated: true,
            user: user,
            isInitializing: false,
          });
        } catch (error) {
          console.error('Failed to restore session:', error);
          // Only clear if token is actually invalid (401)
          // Don't clear on network errors
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
            set({ isAuthenticated: false, user: null, isInitializing: false });
            authService.logout();
          } else {
            // Network error or other issue, keep current state but mark as not initializing
            set({ isInitializing: false });
          }
        }
      },

      login: async (username: string, password: string) => {
        try {
          const response = await authService.login(username, password);
          set({
            isAuthenticated: true,
            user: response.user,
          });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      register: async (userData) => {
        try {
          const response = await authService.register(userData);
          set({
            isAuthenticated: true,
            user: response.user,
          });
          return true;
        } catch (error) {
          console.error('Register error:', error);
          return false;
        }
      },

      logout: () => {
        authService.logout();
        set({
          isAuthenticated: false,
          user: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Persist user data
        user: state.user,
        // Also persist isAuthenticated to restore UI state quickly
        isAuthenticated: state.isAuthenticated,
      }),
      // After rehydration, verify token and restore session
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating auth store:', error);
          return;
        }
        
        if (state) {
          // Check if token exists in localStorage
          const hasToken = authService.isAuthenticated();
          
          console.log('Rehydrating auth store:', { hasToken, hasUser: !!state.user, isAuthenticated: state.isAuthenticated });
          
          if (hasToken && state.user) {
            // Token exists and user is persisted, restore authenticated state immediately
            // This prevents the flash of "not authenticated" on page refresh
            state.isAuthenticated = true;
            console.log('Restored authenticated state from localStorage');
          } else if (!hasToken) {
            // No token, clear everything (token expired or was removed)
            console.log('No token found, clearing state');
            state.isAuthenticated = false;
            state.user = null;
          } else if (hasToken && !state.user) {
            // Token exists but no user in storage, will be loaded in initialize()
            console.log('Token exists but no user, will load in initialize()');
            state.isAuthenticated = false;
          }
          
          // Always set isInitializing to true so initialize() runs
          state.isInitializing = true;
        }
      },
    }
  )
);

