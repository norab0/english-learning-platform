import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully with valid credentials', async () => {
    const result = await service.login({ email: 'admin@test.com', password: 'admin123' });
    
    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.role).toBe('admin');
  });

  it('should fail login with invalid credentials', async () => {
    const result = await service.login({ email: 'invalid@test.com', password: 'wrong' });
    
    expect(result).toBe(false);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.error()).toBe('Invalid credentials');
  });

  it('should register new user successfully', async () => {
    const userData = {
      email: 'new@test.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User'
    };

    const result = await service.register(userData);
    
    expect(result).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('new@test.com');
    expect(service.currentUser()?.role).toBe('user');
  });

  it('should logout and clear user data', () => {
    // First login
    service.login({ email: 'admin@test.com', password: 'admin123' });
    
    // Then logout
    service.logout();
    
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
