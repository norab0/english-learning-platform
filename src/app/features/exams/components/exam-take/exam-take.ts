import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamsService } from '../../../exams/services/exams';
import { AuthService } from '../../../auth/services/auth';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

@Component({
  selector: 'app-exam-take',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exam-take.html',
  styleUrl: './exam-take.scss'
})
export class ExamTakeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examsService = inject(ExamsService);
  private authService = inject(AuthService);

  exam = signal<any>(null);
  currentQuestionIndex = signal(0);
  selectedAnswers = signal<{ [questionId: string]: number }>({});
  timeRemaining = signal(0);
  isSubmitted = signal(false);
  score = signal(0);

  private timer: any;

  currentQuestion = computed(() => {
    const exam = this.exam();
    const index = this.currentQuestionIndex();
    return exam?.questions?.[index] || null;
  });

  totalQuestions = computed(() => this.exam()?.questions?.length || 0);
  progress = computed(() => {
    const total = this.totalQuestions();
    return total > 0 ? Math.round(((this.currentQuestionIndex() + 1) / total) * 100) : 0;
  });

  timeFormatted = computed(() => {
    const minutes = Math.floor(this.timeRemaining() / 60);
    const seconds = this.timeRemaining() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  async ngOnInit(): Promise<void> {
    const examId = this.route.snapshot.paramMap.get('id');
    if (!examId) {
      this.router.navigate(['/exams']);
      return;
    }

    const exam = this.examsService.getExamById(examId);
    if (!exam) {
      this.router.navigate(['/exams']);
      return;
    }

    this.exam.set(exam);
    this.timeRemaining.set(exam.duration * 60); // Convert minutes to seconds
    this.startTimer();
  }

  selectAnswer(questionId: string, answerIndex: number): void {
    this.selectedAnswers.update(answers => ({
      ...answers,
      [questionId]: answerIndex
    }));
  }

  nextQuestion(): void {
    const currentIndex = this.currentQuestionIndex();
    if (currentIndex < this.totalQuestions() - 1) {
      this.currentQuestionIndex.set(currentIndex + 1);
    }
  }

  previousQuestion(): void {
    const currentIndex = this.currentQuestionIndex();
    if (currentIndex > 0) {
      this.currentQuestionIndex.set(currentIndex - 1);
    }
  }

  submitExam(): void {
    if (this.isSubmitted()) return;

    const exam = this.exam();
    const answers = this.selectedAnswers();
    let correctAnswers = 0;

    exam.questions.forEach((question: Question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / exam.questions.length) * 100);
    this.score.set(score);
    this.isSubmitted.set(true);
    this.stopTimer();

    // Save exam attempt
    this.examsService.submitExamAttempt(exam.id, answers, score);
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      const remaining = this.timeRemaining();
      if (remaining <= 0) {
        this.submitExam();
        return;
      }
      this.timeRemaining.set(remaining - 1);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
