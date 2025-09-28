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
      
      console.log('Attempting login with:', credentials.email);
      
      // Check hardcoded admin account first
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
        console.log('Admin login successful');
        return true;
      }
      
      // Check hardcoded user account
      if (credentials.email === 'user@test.com' && credentials.password === 'user123') {
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
        console.log('User login successful');
        return true;
      }
      
      // Check registered users
      const registeredUsers = this.getStoredUsers();
      console.log('Registered users:', registeredUsers);
      
      const user = registeredUsers.find(u => u.email === credentials.email);
      if (user) {
        // For demo purposes, we'll accept any password for registered users
        // In a real app, you'd verify the password hash
        const updatedUser = {
          ...user,
          token: this.generateToken(),
          lastLogin: new Date()
        };
        this._currentUser.set(updatedUser);
        console.log('Registered user login successful:', updatedUser);
        return true;
      }
      
      console.log('No user found with email:', credentials.email);
      this._error.set('Invalid credentials');
      return false;
    } catch (error) {
      console.error('Login error:', error);
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
      
      console.log('Attempting registration with:', userData.email);
      
      // Check if email already exists
      const existingUsers = this.getStoredUsers();
      console.log('Existing users:', existingUsers);
      
      if (existingUsers.some(u => u.email === userData.email)) {
        console.log('Email already exists:', userData.email);
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
      
      console.log('Creating new user:', user);
      
      // Store user in localStorage
      this.storeUser(user);
      this._currentUser.set(user);
      
      console.log('Registration successful, user stored and logged in');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
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

  updateUserProfile(profileData: { firstName: string; lastName: string }): void {
    const currentUser = this._currentUser();
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        firstName: profileData.firstName,
        lastName: profileData.lastName
      };
      
      this._currentUser.set(updatedUser);
      
      // Update in localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update in registered users list
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
      }
    }
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
    const users = stored ? JSON.parse(stored) : [];
    console.log('Retrieved stored users:', users);
    return users;
  }

  private storeUser(user: User): void {
    const users = this.getStoredUsers();
    users.push(user);
    console.log('Storing users:', users);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    console.log('Users stored successfully in localStorage');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateToken(): string {
    // Generate a simple mock token
    return 'mock-token-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }
}
