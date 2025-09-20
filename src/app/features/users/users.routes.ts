import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/admin.guard';

export const usersRoutes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/courses',
    loadComponent: () => import('./components/course-management/course-management').then(m => m.CourseManagementComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/exams',
    loadComponent: () => import('./components/exam-management/exam-management').then(m => m.ExamManagementComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  }
];
