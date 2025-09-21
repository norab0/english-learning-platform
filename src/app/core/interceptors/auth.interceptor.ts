import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../../features/auth/services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const currentUser = authService.currentUser();
  
  if (currentUser) {
    // Add authorization header with user token (mock)
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer mock-token-${currentUser.id}`,
        'X-User-Role': currentUser.role
      }
    });
    return next(authReq);
  }
  
  return next(req);
};