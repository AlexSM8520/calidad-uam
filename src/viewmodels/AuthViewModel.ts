import type { AuthState } from '../models/User';
import { authService } from '../services/authService';
import { apiClient } from '../services/api';

export class AuthViewModel {
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    // Check if user is already logged in (from token)
    if (authService.isAuthenticated()) {
      this.loadCurrentUser();
    }
  }

  private async loadCurrentUser() {
    try {
      const user = await authService.getCurrentUser();
      this.authState = {
        isAuthenticated: true,
        user: user,
      };
      this.notify();
    } catch (error) {
      this.authState = { isAuthenticated: false, user: null };
      authService.logout();
    }
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    listener(this.authState); // Notify immediately with current state

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await authService.login(username, password);
      this.authState = {
        isAuthenticated: true,
        user: response.user,
      };
      this.notify();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  logout(): void {
    authService.logout();
    this.authState = {
      isAuthenticated: false,
      user: null,
    };
    this.notify();
  }

  getAuthState(): AuthState {
    return this.authState;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }
}

// Singleton instance
export const authViewModel = new AuthViewModel();

