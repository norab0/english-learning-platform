import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';
import { CoursesService } from '../../../courses/services/courses';
import { ExamsService } from '../../../exams/services/exams';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent {
  private authService = inject(AuthService);
  private coursesService = inject(CoursesService);
  private examsService = inject(ExamsService);

  // Mock users data (in real app, this would come from a service)
  users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', coursesEnrolled: 3, lastLogin: new Date() },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', coursesEnrolled: 2, lastLogin: new Date() },
    { id: '3', name: 'Admin User', email: 'admin@test.com', role: 'admin', coursesEnrolled: 0, lastLogin: new Date() }
  ];

  // Computed statistics
  totalUsers = computed(() => this.users.length);
  totalCourses = computed(() => this.coursesService.courses().length);
  totalExams = computed(() => this.examsService.exams().length);
  averageScore = computed(() => this.examsService.averageScore());

  // Get recent exam attempts
  recentAttempts = computed(() => {
    return this.examsService.attempts().slice(-5).reverse();
  });

  // Get course statistics
  courseStats = computed(() => {
    return this.coursesService.courses().map(course => ({
      course,
      enrolledUsers: this.users.filter(user => user.coursesEnrolled > 0).length,
      completionRate: Math.floor(Math.random() * 100) // Mock data
    }));
  });

  // Helper method to get user initials
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }
}
