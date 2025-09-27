import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';
import { ProgressService } from '../../../courses/services/progress';
import { CoursesService } from '../../../courses/services/courses';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private progressService = inject(ProgressService);
  private coursesService = inject(CoursesService);

  // Signals
  private _isEditMode = signal(false);
  private _isSaving = signal(false);

  // Edit form
  editForm = {
    firstName: '',
    lastName: ''
  };

  // Computed signals
  currentUser = computed(() => this.authService.currentUser());
  isAdmin = computed(() => this.authService.isAdmin());
  isEditMode = this._isEditMode.asReadonly();
  isSaving = this._isSaving.asReadonly();

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

  // Form validation
  isFormValid = computed(() => {
    return this.editForm.firstName.trim().length >= 2 && 
           this.editForm.lastName.trim().length >= 2;
  });

  constructor() {
    this.initializeEditForm();
  }

  private initializeEditForm(): void {
    const user = this.currentUser();
    if (user) {
      this.editForm = {
        firstName: user.firstName,
        lastName: user.lastName
      };
    }
  }

  toggleEditMode(): void {
    if (this._isEditMode()) {
      this.cancelEdit();
    } else {
      this.initializeEditForm();
      this._isEditMode.set(true);
    }
  }

  cancelEdit(): void {
    this.initializeEditForm();
    this._isEditMode.set(false);
  }

  async saveProfile(): Promise<void> {
    if (!this.isFormValid()) return;

    this._isSaving.set(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour l'utilisateur dans le service d'authentification
      const currentUser = this.currentUser();
      if (currentUser) {
        this.authService.updateUserProfile({
          firstName: this.editForm.firstName.trim(),
          lastName: this.editForm.lastName.trim()
        });
      }
      
      this._isEditMode.set(false);
    } catch {
      // Error saving profile - ignore
    } finally {
      this._isSaving.set(false);
    }
  }
}
