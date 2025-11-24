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

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));

    const success = authViewModel.login(username, password);
    
    this.isLoading = false;
    
    if (!success) {
      this.error = 'Invalid credentials. Use Admin / 123';
    }
    
    this.notify();
    return success;
  }

  getError(): string {
    return this.error;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }
}

