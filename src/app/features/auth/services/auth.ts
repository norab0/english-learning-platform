import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../../core/models/user.model';

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

  constructor(private router: Router) {
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
          createdAt: new Date(),
          lastLogin: new Date()
        };
        this._currentUser.set(user);
        return true;
      } else {
        this._error.set('Invalid credentials');
        return false;
      }
    } catch (error) {
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
      
      // Mock registration
      const user: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user',
        createdAt: new Date()
      };
      
      this._currentUser.set(user);
      return true;
    } catch (error) {
      this._error.set('Registration failed. Please try again.');
      return false;
    } finally {
      this._isLoading.set(false);
    }
  }

  logout(): void {
    this._currentUser.set(null);
    this._error.set(null);
    this.router.navigate(['/login']);
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this._currentUser.set(user);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
