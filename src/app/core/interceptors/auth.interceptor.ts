import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUser = this.authService.currentUser();
    
    if (currentUser) {
      // Add authorization header with user token (mock)
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer mock-token-${currentUser.id}`,
          'X-User-Role': currentUser.role
        }
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}