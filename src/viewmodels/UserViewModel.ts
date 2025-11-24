import type { User, UserRole } from '../models/User';
import { userService } from '../services/userService';
import { normalizeArray, normalizeId, extractId } from '../utils/modelHelpers';

export class UserViewModel {
  private users: User[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    // Load users from API
    this.loadUsers();
  }

  private async loadUsers() {
    try {
      const users = await userService.getAll();
      this.users = normalizeArray(users);
      this.notify();
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    listener();
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getUsers(): User[] {
    return [...this.users];
  }

  getUser(userId: string): User | undefined {
    return this.users.find(u => extractId(u) === userId);
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  async createUser(userData: Omit<User, 'id' | '_id'>): Promise<User> {
    try {
      const newUser = await userService.create(userData);
      const normalized = normalizeId(newUser);
      this.users.push(normalized);
      this.notify();
      return normalized;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<Omit<User, 'id' | '_id'>>): Promise<void> {
    try {
      const updatedUser = await userService.update(userId, userData);
      const normalized = normalizeId(updatedUser);
      const index = this.users.findIndex(u => extractId(u) === userId);
      if (index !== -1) {
        this.users[index] = normalized;
        this.notify();
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await userService.delete(userId);
      this.users = this.users.filter(u => extractId(u) !== userId);
      this.notify();
    } catch (error) {
      throw error;
    }
  }

  getRoles(): UserRole[] {
    return ['Administrador', 'Usuario'];
  }
}

export const userViewModel = new UserViewModel();

