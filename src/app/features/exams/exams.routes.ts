import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const examsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/exam-list/exam-list').then(m => m.ExamListComponent),
    canActivate: [authGuard]
  }
];
