import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';
import { ProgressService } from '../../../courses/services/progress';
import { CoursesService } from '../../../courses/services/courses';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private progressService = inject(ProgressService);
  private coursesService = inject(CoursesService);

  currentUser = computed(() => this.authService.currentUser());
  isAdmin = computed(() => this.authService.isAdmin());

  // Get user's course progress
  userProgress = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    return this.coursesService.courses().map(course => ({
      course,
      progress: this.progressService.getCourseProgressPercent(course.id, course.lessons.length),
      completedLessons: this.progressService.progress()[course.id]?.completed?.length || 0,
      totalLessons: course.lessons.length
    }));
  });

  // Calculate total courses completed
  totalCoursesCompleted = computed(() => {
    return this.userProgress().filter(p => p.progress === 100).length;
  });

  // Calculate average progress
  averageProgress = computed(() => {
    const progress = this.userProgress();
    if (progress.length === 0) return 0;
    
    const totalProgress = progress.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(totalProgress / progress.length);
  });
}
