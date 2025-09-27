import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private _users = signal<User[]>([]);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Computed signals
  public readonly users = this._users.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly totalUsers = computed(() => this._users().length);
  public readonly adminUsers = computed(() => this._users().filter(user => user.role === 'admin'));
  public readonly regularUsers = computed(() => this._users().filter(user => user.role === 'user'));

  constructor() {
    this.loadMockUsers();
  }

  async loadUsers(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.delay(500);
    } catch {
      this._error.set('Failed to load users');
    } finally {
      this._isLoading.set(false);
    }
  }

  getUserById(id: string): User | undefined {
    return this._users().find(user => user.id === id);
  }

  async createUser(userData: Omit<User, 'id' | 'token' | 'createdAt' | 'lastLogin'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      token: this.generateToken(),
      createdAt: new Date(),
      lastLogin: undefined
    };

    this._users.update(users => [...users, newUser]);
    return newUser;
  }

  async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'token' | 'createdAt'>>): Promise<User | null> {
    const userIndex = this._users().findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    const updatedUser = { ...this._users()[userIndex], ...userData };
    this._users.update(users => 
      users.map(user => user.id === id ? updatedUser : user)
    );
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const userExists = this._users().some(user => user.id === id);
    if (!userExists) return false;

    this._users.update(users => users.filter(user => user.id !== id));
    return true;
  }

  async updateUserRole(id: string, role: 'user' | 'admin'): Promise<User | null> {
    return this.updateUser(id, { role });
  }

  getUsersByRole(role: 'user' | 'admin'): User[] {
    return this._users().filter(user => user.role === role);
  }

  getRecentUsers(limit = 5): User[] {
    return [...this._users()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getUserStatistics(): {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
    newUsersThisMonth: number;
  } {
    const users = this._users();
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalUsers: users.length,
      adminUsers: users.filter(user => user.role === 'admin').length,
      regularUsers: users.filter(user => user.role === 'user').length,
      newUsersThisMonth: users.filter(user => user.createdAt >= thisMonth).length
    };
  }

  private loadMockUsers(): void {
    // Seulement les utilisateurs qui existent vraiment dans l'app
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        token: 'admin-token-123',
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date('2024-09-25')
      },
      {
        id: '2',
        email: 'user@test.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'user',
        token: 'user-token-456',
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date('2024-09-24')
      }
    ];

    this._users.set(mockUsers);
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
