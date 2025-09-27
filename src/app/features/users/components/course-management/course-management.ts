import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CoursesService } from '../../../courses/services/courses';
import { Course } from '../../../../core/models/course.model';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './course-management.html',
  styleUrl: './course-management.scss'
})
export class CourseManagementComponent {
  private coursesService = inject(CoursesService);
  private fb = inject(FormBuilder);

  // Signals
  private _showAddForm = signal(false);
  private _editingCourse = signal<Course | null>(null);
  private _isSubmitting = signal(false);

  // Computed signals
  courses = computed(() => this.coursesService.courses());
  showAddForm = this._showAddForm.asReadonly();
  editingCourse = this._editingCourse.asReadonly();
  isSubmitting = this._isSubmitting.asReadonly();

  // Form
  courseForm: FormGroup;
  lessonsForm: FormGroup;

  constructor() {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      level: ['beginner', [Validators.required]],
      duration: [60, [Validators.required, Validators.min(1)]]
    });

    this.lessonsForm = this.fb.group({
      lessons: this.fb.array([])
    });

    this.coursesService.loadCourses();
    this.addLesson(); // Add one lesson by default
  }

  get lessonsArray(): FormArray {
    return this.lessonsForm.get('lessons') as FormArray;
  }

  createLessonForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      duration: [30, [Validators.required, Validators.min(1)]]
    });
  }

  // Validation helper
  isFormValid(): boolean {
    return this.courseForm.valid && this.lessonsArray.length > 0 && this.lessonsArray.valid;
  }

  addLesson(): void {
    this.lessonsArray.push(this.createLessonForm());
  }

  removeLesson(index: number): void {
    if (this.lessonsArray.length > 1) {
      this.lessonsArray.removeAt(index);
    }
  }

  toggleAddForm(): void {
    this._showAddForm.set(!this._showAddForm());
    if (!this._showAddForm()) {
      this.resetForm();
    }
  }

  editCourse(course: Course): void {
    this._editingCourse.set(course);
    this._showAddForm.set(true);
    
    // Clear existing lessons
    while (this.lessonsArray.length !== 0) {
      this.lessonsArray.removeAt(0);
    }
    
    // Add course lessons
    course.lessons.forEach(lesson => {
      const lessonForm = this.createLessonForm();
      lessonForm.patchValue({
        title: lesson.title,
        content: lesson.content,
        duration: lesson.duration
      });
      this.lessonsArray.push(lessonForm);
    });
    
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      level: course.level,
      duration: course.duration
    });
  }

  async saveCourse(): Promise<void> {
    
    // Mark all forms as touched to show validation errors
    this.courseForm.markAllAsTouched();
    this.lessonsForm.markAllAsTouched();
    
    if (this.courseForm.valid && this.lessonsForm.valid && this.lessonsArray.length > 0) {
      this._isSubmitting.set(true);
      
      try {
        const courseData = this.courseForm.value;
        const lessonsData = this.lessonsForm.value.lessons.map((lesson: { title: string; content: string; duration: number }, index: number) => ({
          id: `${Date.now()}-${index}`,
          title: lesson.title,
          content: lesson.content,
          order: index + 1,
          duration: lesson.duration
        }));

        const courseWithLessons = {
          ...courseData,
          lessons: lessonsData
        };
        
        
        if (this._editingCourse()) {
          // Update existing course
          const updatedCourse: Course = {
            ...this._editingCourse() as Course,
            ...courseWithLessons,
            updatedAt: new Date()
          };
          await this.coursesService.updateCourse(updatedCourse);
        } else {
          // Add new course
          await this.coursesService.addCourse(courseWithLessons);
        }
        
        this.resetForm();
      } catch {
        alert('Error saving course. Please try again.');
      } finally {
        this._isSubmitting.set(false);
      }
    } else {
      if (this.lessonsArray.length === 0) {
        alert('Please add at least one lesson to the course.');
      }
    }
  }

  async deleteCourse(courseId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await this.coursesService.deleteCourse(courseId);
      } catch {
        // Error deleting course - ignore
      }
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.courseForm.reset();
    this.courseForm.patchValue({
      level: 'beginner',
      duration: 60
    });
    
    // Clear lessons and add one default
    while (this.lessonsArray.length !== 0) {
      this.lessonsArray.removeAt(0);
    }
    this.addLesson();
    
    this._showAddForm.set(false);
    this._editingCourse.set(null);
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
