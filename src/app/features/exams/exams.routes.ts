import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const examsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/exam-list/exam-list').then(m => m.ExamListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'take/:id',
    loadComponent: () => import('./components/exam-take/exam-take').then(m => m.ExamTakeComponent),
    canActivate: [authGuard]
  }
];
