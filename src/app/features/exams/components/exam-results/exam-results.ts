import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamsService } from '../../services/exams';
import { AuthService } from '../../../auth/services/auth';
import { Exam, ExamAttempt } from '../../../../core/models/exam.model';

@Component({
  selector: 'app-exam-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exam-results.html',
  styleUrl: './exam-results.scss'
})
export class ExamResultsComponent {
  private examsService = inject(ExamsService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals
  private _exam = signal<Exam | null>(null);
  private _attempt = signal<ExamAttempt | null>(null);
  private _isLoading = signal(false);

  // Computed signals
  exam = this._exam.asReadonly();
  attempt = this._attempt.asReadonly();
  isLoading = this._isLoading.asReadonly();

  // Public properties for template
  Math = Math;

  // Computed
  score = computed(() => this._attempt()?.score || 0);
  passed = computed(() => {
    const exam = this._exam();
    const score = this.score();
    return exam ? score >= exam.passingScore : false;
  });

  scoreColor = computed(() => {
    const score = this.score();
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  });

  scoreBadgeClass = computed(() => {
    const score = this.score();
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  });

  constructor() {
    this.loadResults();
  }

  async loadResults(): Promise<void> {
    this._isLoading.set(true);
    try {
      const attemptId = this.route.snapshot.paramMap.get('id');
      if (attemptId) {
        const attempt = this.examsService.getAttemptById(attemptId);
        if (attempt) {
          this._attempt.set(attempt);
          const exam = this.examsService.getExamById(attempt.examId);
          if (exam) {
            this._exam.set(exam);
          } else {
            this.router.navigate(['/exams']);
          }
        } else {
          this.router.navigate(['/exams']);
        }
      } else {
        this.router.navigate(['/exams']);
      }
    } catch (error) {
      console.error('Error loading exam results:', error);
      this.router.navigate(['/exams']);
    } finally {
      this._isLoading.set(false);
    }
  }

  retakeExam(): void {
    const exam = this._exam();
    if (exam) {
      this.router.navigate(['/exams/take', exam.id]);
    }
  }

  goToExams(): void {
    this.router.navigate(['/exams']);
  }

  getTimeTaken(): string {
    const attempt = this._attempt();
    if (!attempt?.startedAt || !attempt?.completedAt) {
      return 'N/A';
    }
    
    const startTime = new Date(attempt.startedAt).getTime();
    const endTime = new Date(attempt.completedAt).getTime();
    const timeInMinutes = Math.round((endTime - startTime) / 60000);
    
    return `${timeInMinutes} minutes`;
  }
}
