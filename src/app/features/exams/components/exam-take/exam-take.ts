import { Component, computed, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamsService } from '../../services/exams';
import { AuthService } from '../../../auth/services/auth';
import { Exam, ExamAttempt } from '../../../../core/models/exam.model';

@Component({
  selector: 'app-exam-take',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './exam-take.html',
  styleUrl: './exam-take.scss'
})
export class ExamTakeComponent implements OnInit, OnDestroy {
  private examsService = inject(ExamsService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private fb = inject(FormBuilder);

  // Signals
  private _exam = signal<Exam | null>(null);
  private _attempt = signal<ExamAttempt | null>(null);
  private _isLoading = signal(false);
  private _isSubmitting = signal(false);
  private _timeRemaining = signal(0);
  private _currentQuestionIndex = signal(0);

  // Computed signals
  exam = this._exam.asReadonly();
  attempt = this._attempt.asReadonly();
  isLoading = this._isLoading.asReadonly();
  isSubmitting = this._isSubmitting.asReadonly();
  timeRemaining = this._timeRemaining.asReadonly();
  currentQuestionIndex = this._currentQuestionIndex.asReadonly();

  // Form
  examForm: FormGroup;
  private timer: number | null = null;

  // Public properties for template
  Math = Math;

  // Computed
  currentQuestion = computed(() => {
    const exam = this._exam();
    const index = this._currentQuestionIndex();
    return exam?.questions[index] || null;
  });

  totalQuestions = computed(() => this._exam()?.questions.length || 0);
  progress = computed(() => {
    const total = this.totalQuestions();
    const current = this._currentQuestionIndex();
    return total > 0 ? ((current + 1) / total) * 100 : 0;
  });

  isLastQuestion = computed(() => {
    const total = this.totalQuestions();
    const current = this._currentQuestionIndex();
    return current >= total - 1;
  });

  constructor() {
    this.examForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadExam();
  }

  async loadExam(): Promise<void> {
    this._isLoading.set(true);
    try {
      const examId = this.route.snapshot.paramMap.get('id');
      if (examId) {
        const exam = this.examsService.getExamById(examId);
        if (exam) {
          this._exam.set(exam);
          this.initializeForm();
          this.startTimer();
        } else {
          this.router.navigate(['/exams']);
        }
      }
    } catch {
      this.router.navigate(['/exams']);
    } finally {
      this._isLoading.set(false);
    }
  }

  private initializeForm(): void {
    const exam = this._exam();
    if (!exam) return;

    // Create form controls for each question
    const formControls: Record<string, [string, unknown]> = {};
    exam.questions.forEach((question, index) => {
      formControls[`question_${index}`] = ['', Validators.required];
    });

    this.examForm = this.fb.group(formControls);

    // Start new attempt
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.examsService.startExam(exam.id, currentUser.id).then(attempt => {
        this._attempt.set(attempt);
        
        // Load existing answers if any
        this.loadExistingAnswers(attempt);
      });
    }
  }

  private loadExistingAnswers(attempt: ExamAttempt): void {
    if (attempt && attempt.answers && attempt.answers.length > 0) {
      attempt.answers.forEach((answer) => {
        const questionIndex = this.exam()?.questions.findIndex(q => q.id === answer.questionId);
        if (questionIndex !== undefined && questionIndex >= 0) {
          const formControl = this.examForm.get(`question_${questionIndex}`);
          if (formControl) {
            formControl.setValue(answer.answer);
          }
        }
      });
    }
  }

  private startTimer(): void {
    const exam = this._exam();
    if (!exam) return;

    this._timeRemaining.set(exam.duration * 60); // Convert minutes to seconds

    this.timer = setInterval(() => {
      const remaining = this._timeRemaining();
      if (remaining <= 0) {
        this.submitExam();
      } else {
        this._timeRemaining.set(remaining - 1);
      }
    }, 1000);
  }

  nextQuestion(): void {
    const current = this._currentQuestionIndex();
    const total = this.totalQuestions();
    if (current < total - 1) {
      this._currentQuestionIndex.set(current + 1);
    }
  }

  previousQuestion(): void {
    const current = this._currentQuestionIndex();
    if (current > 0) {
      this._currentQuestionIndex.set(current - 1);
    }
  }

  goToQuestion(index: number): void {
    this._currentQuestionIndex.set(index);
  }

  saveAnswer(): void {
    const attempt = this._attempt();
    const currentQuestion = this.currentQuestion();
    if (!attempt || !currentQuestion) return;

    const answer = this.examForm.get(`question_${this._currentQuestionIndex()}`)?.value;
    if (answer !== null && answer !== undefined) {
      // Convert string numbers to actual numbers for multiple choice questions
      let processedAnswer = answer;
      if (currentQuestion.type === 'multiple-choice' && typeof answer === 'string') {
        processedAnswer = parseInt(answer, 10);
      }
      
      this.examsService.submitAnswer(attempt.id, currentQuestion.id, processedAnswer);
    }
  }

  async submitExam(): Promise<void> {
    if (this._isSubmitting()) return;

    this._isSubmitting.set(true);
    try {
      const attempt = this._attempt();
      if (attempt) {
        // Save all answers before submitting
        await this.saveAllAnswers();
        
        await this.examsService.submitExam(attempt.id);
        
        // Navigate to results page
        this.router.navigate(['/exams/results', attempt.id]);
      }
    } catch {
      alert('Error submitting exam. Please try again.');
    } finally {
      this._isSubmitting.set(false);
    }
  }

  private async saveAllAnswers(): Promise<void> {
    const attempt = this._attempt();
    const exam = this.exam();
    if (!attempt || !exam) return;

    console.log('Saving all answers for attempt:', attempt.id);

    // Save all answers directly to the attempt
    exam.questions.forEach((question, index) => {
      const answer = this.examForm.get(`question_${index}`)?.value;
      
      if (answer !== null && answer !== undefined && answer !== '') {
        // Convert string numbers to actual numbers for multiple choice questions
        let processedAnswer = answer;
        if (question.type === 'multiple-choice' && typeof answer === 'string') {
          processedAnswer = parseInt(answer, 10);
        }
        
        console.log('Saving answer for question:', question.id, 'Answer:', processedAnswer);
        
        // Update or add answer to attempt
        const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === question.id);
        const newAnswer = { questionId: question.id, answer: processedAnswer };
        
        if (existingAnswerIndex >= 0) {
          attempt.answers[existingAnswerIndex] = newAnswer;
        } else {
          attempt.answers.push(newAnswer);
        }
      }
    });

    console.log('Final answers before submission:', attempt.answers);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getProgressPercentage(): number {
    return Math.round(this.progress());
  }

  goToExams(): void {
    this.router.navigate(['/exams']);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}