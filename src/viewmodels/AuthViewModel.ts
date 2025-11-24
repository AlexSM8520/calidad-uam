import type { AuthState } from '../models/User';

export class AuthViewModel {
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    // Check if user is already logged in (from localStorage)
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        this.authState = JSON.parse(storedAuth);
      } catch (e) {
        this.authState = { isAuthenticated: false, user: null };
      }
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
    localStorage.setItem('auth', JSON.stringify(this.authState));
  }

  login(username: string, password: string): boolean {
    // Default credentials: Admin / 123
    if (username === 'Admin' && password === '123') {
      this.authState = {
        isAuthenticated: true,
        user: { username, password },
      };
      this.notify();
      return true;
    }
    return false;
  }

  logout(): void {
    this.authState = {
      isAuthenticated: false,
      user: null,
    };
    localStorage.removeItem('auth');
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

