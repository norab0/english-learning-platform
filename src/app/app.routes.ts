import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'courses',
    loadChildren: () => import('./features/courses/courses.routes').then(m => m.coursesRoutes)
  },
  {
    path: 'exams',
    loadChildren: () => import('./features/exams/exams.routes').then(m => m.examsRoutes)
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes').then(m => m.usersRoutes)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
