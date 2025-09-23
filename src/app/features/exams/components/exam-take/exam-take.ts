import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamsService } from '../../../exams/services/exams';
import { AuthService } from '../../../auth/services/auth';
import { Exam, Question } from '../../../../core/models/exam.model';

@Component({
  selector: 'app-exam-take',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exam-take.html',
  styleUrl: './exam-take.scss'
})
export class ExamTakeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private examsService = inject(ExamsService);
  private authService = inject(AuthService);

  exam = signal<Exam | null>(null);
  currentQuestionIndex = signal(0);
  selectedAnswers = signal<{ [questionId: string]: string | number }>({});
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

  selectTrueFalse(questionId: string, value: boolean): void {
    this.selectedAnswers.update(answers => ({
      ...answers,
      [questionId]: value ? 0 : 1 // 0 for true, 1 for false
    }));
  }

  onTextInput(questionId: string, value: string): void {
    this.selectedAnswers.update(answers => ({
      ...answers,
      [questionId]: value
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
    if (!exam) return;

    const answers = this.selectedAnswers();
    let correctAnswers = 0;

    exam.questions.forEach((question: Question) => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      console.log(`Question ${question.id}:`, {
        type: question.type,
        userAnswer,
        correctAnswer: question.correctAnswer,
        question: question.text
      });

      if (question.type === 'multiple-choice') {
        // Pour les questions à choix multiples, comparer l'index
        if (typeof question.correctAnswer === 'number') {
          isCorrect = userAnswer === question.correctAnswer;
        } else {
          // Fallback pour l'ancien format string
          const correctIndex = question.options?.indexOf(question.correctAnswer as string);
          isCorrect = userAnswer === correctIndex;
        }
        console.log(`Multiple choice: userAnswer=${userAnswer}, correctAnswer=${question.correctAnswer}, isCorrect=${isCorrect}`);
      } else if (question.type === 'true-false') {
        // Pour les questions vrai/faux, 0 = true, 1 = false
        const correctIndex = question.correctAnswer === 'true' ? 0 : 1;
        isCorrect = userAnswer === correctIndex;
        console.log(`True/False: userAnswer=${userAnswer}, correctIndex=${correctIndex}, isCorrect=${isCorrect}`);
      } else if (question.type === 'fill-in-blank') {
        // Pour les questions à compléter
        const correctAnswers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer as string];
        isCorrect = correctAnswers.some((correct: string | number) => 
          String(correct).toLowerCase().trim() === String(userAnswer || '').toLowerCase().trim()
        );
        console.log(`Fill-in-blank: userAnswer="${userAnswer}", correctAnswers=${correctAnswers}, isCorrect=${isCorrect}`);
      }

      if (isCorrect) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / exam.questions.length) * 100);
    
    console.log('Exam scoring results:', {
      totalQuestions: exam.questions.length,
      correctAnswers,
      score,
      answers
    });
    
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
