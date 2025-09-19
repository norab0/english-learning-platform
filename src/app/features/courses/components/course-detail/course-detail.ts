import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CoursesService } from '../../../courses/services/courses';
import { ProgressService } from '../../../courses/services/progress';
import { Course, Lesson } from '../../../../core/models/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss'
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  coursesService = inject(CoursesService);
  progressService = inject(ProgressService);

  course = signal<Course | undefined>(undefined);
  currentIndex = signal<number>(0);

  currentLesson = computed<Lesson | undefined>(() => {
    const c = this.course();
    return c ? c.lessons[this.currentIndex()] : undefined;
  });

  get progressPercent(): number {
    const c = this.course();
    return c ? this.progressService.getCourseProgressPercent(c.id, c.lessons.length) : 0;
  }

  isCompleted(lessonId: string): boolean {
    const c = this.course();
    return c ? this.progressService.isLessonCompleted(c.id, lessonId) : false;
  }

  toggle(lessonId: string): void {
    const c = this.course();
    if (!c) return;
    this.progressService.toggleLesson(c.id, lessonId);
  }

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/courses']);
      return;
    }
    if (this.coursesService.courses().length === 0) {
      await this.coursesService.loadCourses();
    }
    const found = this.coursesService.getCourseById(id);
    if (!found) {
      this.router.navigate(['/courses']);
      return;
    }
    this.course.set(found);

    // Auto-resume if query param lesson is provided or lastLessonId exists
    const qLesson = this.route.snapshot.queryParamMap.get('lesson');
    const last = this.progressService.getLastLesson(found.id);
    const targetId = qLesson || last;
    if (targetId) {
      const idx = found.lessons.findIndex(l => l.id === targetId);
      if (idx >= 0) this.currentIndex.set(idx);
    }
  }

  prev(): void {
    const idx = this.currentIndex();
    if (idx > 0) this.currentIndex.set(idx - 1);
  }

  next(): void {
    const c = this.course();
    if (!c) return;
    const lesson = this.currentLesson();
    if (lesson) {
      this.progressService.toggleLesson(c.id, lesson.id);
      this.progressService.setLastLesson(c.id, lesson.id);
    }
    const idx = this.currentIndex();
    if (idx < c.lessons.length - 1) {
      this.currentIndex.set(idx + 1);
    } else {
      this.router.navigate(['/courses']);
    }
  }
}
