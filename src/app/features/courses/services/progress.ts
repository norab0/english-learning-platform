import { Injectable, signal, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth';

type CourseProgressState = Record<string, {
    completed: string[];
    lastLessonId?: string;
  }>;

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private auth = inject(AuthService);

  private _progress = signal<CourseProgressState>({});

  public readonly progress = this._progress.asReadonly();

  constructor() {
    this.loadFromStorage();
    this.validateAndCleanData();
  }

  isLessonCompleted(courseId: string, lessonId: string): boolean {
    const course = this._progress()[courseId];
    const completed = course?.completed || [];
    return completed.includes(lessonId);
  }

  toggleLesson(courseId: string, lessonId: string): void {
    const current = this._progress()[courseId] || { completed: [], lastLessonId: undefined };
    const set = new Set(current.completed);
    if (set.has(lessonId)) set.delete(lessonId); else set.add(lessonId);
    this._progress.update(prev => ({ ...prev, [courseId]: { ...current, completed: Array.from(set), lastLessonId: lessonId } }));
    this.saveToStorage();
  }

  setLastLesson(courseId: string, lessonId: string): void {
    const current = this._progress()[courseId] || { completed: [], lastLessonId: undefined };
    this._progress.update(prev => ({ ...prev, [courseId]: { ...current, lastLessonId: lessonId } }));
    this.saveToStorage();
  }

  getLastLesson(courseId: string): string | undefined {
    return this._progress()[courseId]?.lastLessonId;
  }

  getCourseProgressPercent(courseId: string, totalLessons: number): number {
    if (totalLessons === 0) return 0;
    const completed = this._progress()[courseId]?.completed?.length || 0;
    const percentage = Math.round((completed / totalLessons) * 100);
    console.log('Course progress calculation:', { courseId, completed, totalLessons, percentage });
    return percentage;
  }

  private storageKey(): string {
    const userId = this.auth.currentUser()?.id || 'guest';
    return `course-progress:${userId}`;
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (raw) this._progress.set(JSON.parse(raw));
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this._progress()));
    } catch {
      // Ignore storage errors
    }
  }

  private validateAndCleanData(): void {
    const currentProgress = this._progress();
    const cleanedProgress: CourseProgressState = {};
    
    // Clean up any invalid data
    Object.entries(currentProgress).forEach(([courseId, courseData]) => {
      if (courseData && Array.isArray(courseData.completed)) {
        // Ensure completed is an array of strings
        const validCompleted = courseData.completed.filter(id => typeof id === 'string');
        cleanedProgress[courseId] = {
          completed: validCompleted,
          lastLessonId: typeof courseData.lastLessonId === 'string' ? courseData.lastLessonId : undefined
        };
      }
    });
    
    // Only update if there were changes
    if (JSON.stringify(cleanedProgress) !== JSON.stringify(currentProgress)) {
      console.log('Cleaned course progress data:', cleanedProgress);
      this._progress.set(cleanedProgress);
      this.saveToStorage();
    }
  }

  // Public method to reset progress data (for debugging)
  resetProgressData(): void {
    console.log('Resetting course progress data');
    this._progress.set({});
    this.saveToStorage();
  }

  // Method to initialize test data (for debugging)
  initializeTestData(): void {
    console.log('Initializing test course progress data');
    const testData: CourseProgressState = {
      '1': { completed: ['1-1', '1-2'], lastLessonId: '1-2' }, // 2/3 lessons = 67%
      '2': { completed: ['2-1'], lastLessonId: '2-1' }, // 1/3 lessons = 33%
      '3': { completed: [], lastLessonId: undefined }, // 0/3 lessons = 0%
    };
    this._progress.set(testData);
    this.saveToStorage();
  }
}
