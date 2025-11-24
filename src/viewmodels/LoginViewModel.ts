import { authViewModel } from './AuthViewModel';

export class LoginViewModel {
  private error: string = '';
  private isLoading: boolean = false;
  private listeners: Array<() => void> = [];

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    listener();

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  async handleLogin(username: string, password: string): Promise<boolean> {
    this.isLoading = true;
    this.error = '';
    this.notify();

    try {
      const success = await authViewModel.login(username, password);
      this.isLoading = false;
      
      if (!success) {
        this.error = 'Credenciales inválidas';
      }
      
      this.notify();
      return success;
    } catch (error) {
      this.isLoading = false;
      this.error = error instanceof Error ? error.message : 'Error al iniciar sesión';
      this.notify();
      return false;
    }
  }

  getError(): string {
    return this.error;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }
}

