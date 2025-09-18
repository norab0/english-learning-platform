import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const coursesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/course-list/course-list').then(m => m.CourseListComponent),
    canActivate: [authGuard]
  }
];
