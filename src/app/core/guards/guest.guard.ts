import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      // Redirect to appropriate dashboard based on user role
      if (this.authService.isAdmin()) {
        this.router.navigate(['/users/admin-dashboard']);
      } else {
        this.router.navigate(['/courses']);
      }
      return false;
    }
    return true;
  }
}