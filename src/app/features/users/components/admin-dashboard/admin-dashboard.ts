import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoursesService } from '../../../courses/services/courses';
import { ExamsService } from '../../../exams/services/exams';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent {
  private coursesService = inject(CoursesService);
  private examsService = inject(ExamsService);
  private authService = inject(AuthService);

  // Computed signals
  totalCourses = computed(() => this.coursesService.totalCourses());
  totalExams = computed(() => this.examsService.totalExams());
  currentUser = computed(() => this.authService.currentUser());

  constructor() {
    // Load data when component initializes
    this.coursesService.loadCourses();
    this.examsService.loadExams();
  }
}