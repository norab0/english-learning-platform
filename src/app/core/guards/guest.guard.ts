import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const user = authService.currentUser();
    if (user?.role === 'admin') {
      router.navigate(['/users/admin-dashboard']);
    } else {
      router.navigate(['/courses']);
    }
    return false;
  }
  return true;
};
