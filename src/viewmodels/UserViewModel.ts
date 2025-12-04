import type { User, UserRole } from '../models/User';
import { userService } from '../services/userService';
import { useAuthStore } from '../stores/authStore';
import { normalizeArray, normalizeId, extractId } from '../utils/modelHelpers';

export class UserViewModel {
  private users: User[] = [];
  private listeners: Array<() => void> = [];
  private dataLoaded: boolean = false;

  constructor() {
    // Subscribe to auth changes and load data when authenticated
    useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (isAuthenticated) => {
        if (isAuthenticated && !this.dataLoaded) {
          this.loadUsers();
        } else if (!isAuthenticated) {
          // Clear data when logged out
          this.users = [];
          this.dataLoaded = false;
          this.notify();
        }
      },
      { equalityFn: (a, b) => a === b }
    );

    // Load data if already authenticated
    if (useAuthStore.getState().isAuthenticated) {
      this.loadUsers();
    }
  }

  private async loadUsers() {
    try {
      console.log('UserViewModel: Loading users...');
      const users = await userService.getAll();
      console.log('UserViewModel: Users loaded from service:', users);
      // Filter out invalid users (must have username)
      const validUsers = users.filter(u => u != null && u.username);
      console.log('UserViewModel: Valid users after filtering:', validUsers);
      // Normalize users and handle carreraId/areaId if they come as objects
      const normalizedUsers = normalizeArray(validUsers).map(user => {
        // Normalize carreraId if it comes as an object
        if (user.carreraId && typeof user.carreraId === 'object') {
          user.carreraId = extractId(user.carreraId);
        }
        // Normalize areaId if it comes as an object
        if (user.areaId && typeof user.areaId === 'object') {
          user.areaId = extractId(user.areaId);
        }
        return user;
      });
      console.log('UserViewModel: Normalized users:', normalizedUsers);
      this.users = normalizedUsers;
      this.dataLoaded = true;
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
      if (!newUser) {
        throw new Error('Failed to create user: No data returned');
      }
      const normalized = normalizeId(newUser);
      // Validate that normalized user has required fields
      if (!normalized.username) {
        console.error('Invalid user returned from server:', normalized);
        throw new Error('Invalid user data returned from server');
      }
      this.users.push(normalized);
      this.notify();
      return normalized;
    } catch (error) {
      console.error('Error creating user:', error);
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

