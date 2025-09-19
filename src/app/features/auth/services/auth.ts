import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest } from '../../../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signals
  private _currentUser = signal<User | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Computed signals
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isAuthenticated = computed(() => this._currentUser() !== null);
  public readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();

  private router = inject(Router);

  constructor() {
    // Effect to persist user data
    effect(() => {
      const user = this._currentUser();
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    });

    // Load user from localStorage on init
    this.loadUserFromStorage();
  }

  async login(credentials: LoginRequest): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.delay(1000);
      
      // Mock authentication
      if (credentials.email === 'admin@test.com' && credentials.password === 'admin123') {
        const user: User = {
          id: '1',
          email: credentials.email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          token: this.generateToken(),
          createdAt: new Date(),
          lastLogin: new Date()
        };
        this._currentUser.set(user);
        return true;
      } else if (credentials.email === 'user@test.com' && credentials.password === 'user123') {
        const user: User = {
          id: '2',
          email: credentials.email,
          firstName: 'Regular',
          lastName: 'User',
          role: 'user',
          token: this.generateToken(),
          createdAt: new Date(),
          lastLogin: new Date()
        };
        this._currentUser.set(user);
        return true;
      } else {
        this._error.set('Invalid credentials');
        return false;
      }
    } catch {
      this._error.set('Login failed. Please try again.');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  async register(userData: RegisterRequest): Promise<boolean> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.delay(1000);
      
      // Check if email already exists
      const existingUsers = this.getStoredUsers();
      if (existingUsers.some(u => u.email === userData.email)) {
        this._error.set('Email already exists. Please use a different email.');
        return false;
      }
      
      // Mock registration
      const user: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user',
        token: this.generateToken(),
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      // Store user in localStorage
      this.storeUser(user);
      this._currentUser.set(user);
      return true;
    } catch {
      this._error.set('Registration failed. Please try again.');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  logout(): void {
    this._currentUser.set(null);
    this._error.set(null);
    this.router.navigate(['/auth/login']);
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this._currentUser.set(user);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }

  private getStoredUsers(): User[] {
    const stored = localStorage.getItem('registeredUsers');
    return stored ? JSON.parse(stored) : [];
  }

  private storeUser(user: User): void {
    const users = this.getStoredUsers();
    users.push(user);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateToken(): string {
    // Generate a simple mock token
    return 'mock-token-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }
}
