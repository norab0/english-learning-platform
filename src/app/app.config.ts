import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthService } from './features/auth/services/auth';
import { CoursesService } from './features/courses/services/courses';
import { ExamsService } from './features/exams/services/exams';
import { ScoresService } from './core/services/scores.service';
import { ProgressService } from './features/courses/services/progress';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    AuthService,
    CoursesService,
    ExamsService,
    ScoresService,
    ProgressService
  ]
};
