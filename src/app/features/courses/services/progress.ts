import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth';

interface CourseProgressState {
  [courseId: string]: {
    completed: string[];
    lastLessonId?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private auth = inject(AuthService);

  private _progress = signal<CourseProgressState>({});

  public readonly progress = this._progress.asReadonly();

  constructor() {
    this.loadFromStorage();
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
    return Math.round((completed / totalLessons) * 100);
  }

  private storageKey(): string {
    const userId = this.auth.currentUser()?.id || 'guest';
    return `course-progress:${userId}`;
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (raw) this._progress.set(JSON.parse(raw));
    } catch {}
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this._progress()));
    } catch {}
  }
}
