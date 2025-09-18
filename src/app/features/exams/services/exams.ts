import { Injectable, signal, computed } from '@angular/core';
import { Exam, Question, ExamAttempt, Answer } from '../../../core/models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamsService {
  // Signals
  private _exams = signal<Exam[]>([]);
  private _attempts = signal<ExamAttempt[]>([]);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Computed signals
  public readonly exams = this._exams.asReadonly();
  public readonly attempts = this._attempts.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();

  // Computed statistics
  public readonly totalExams = computed(() => this._exams().length);
  public readonly completedAttempts = computed(() => 
    this._attempts().filter(attempt => attempt.completedAt !== undefined)
  );
  public readonly averageScore = computed(() => {
    const completed = this.completedAttempts();
    if (completed.length === 0) return 0;
    const totalScore = completed.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    return totalScore / completed.length;
  });

  constructor() {
    this.loadMockData();
  }

  async loadExams(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.delay(500);
      // Data is already loaded in constructor
    } catch (error) {
      this._error.set('Failed to load exams');
    } finally {
      this._isLoading.set(false);
    }
  }

  getExamById(id: string): Exam | undefined {
    return this._exams().find(exam => exam.id === id);
  }

  async startExam(examId: string, userId: string): Promise<ExamAttempt> {
    const exam = this.getExamById(examId);
    if (!exam) {
      throw new Error('Exam not found');
    }

    const attempt: ExamAttempt = {
      id: Date.now().toString(),
      examId,
      userId,
      answers: [],
      startedAt: new Date()
    };

    this._attempts.update(attempts => [...attempts, attempt]);
    return attempt;
  }

  async submitAnswer(attemptId: string, questionId: string, answer: string | string[]): Promise<void> {
    this._attempts.update(attempts => 
      attempts.map(attempt => {
        if (attempt.id === attemptId) {
          const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
          const newAnswer: Answer = { questionId, answer };
          
          if (existingAnswerIndex >= 0) {
            attempt.answers[existingAnswerIndex] = newAnswer;
          } else {
            attempt.answers.push(newAnswer);
          }
        }
        return attempt;
      })
    );
  }

  async submitExam(attemptId: string): Promise<number> {
    const attempt = this._attempts().find(a => a.id === attemptId);
    if (!attempt) {
      throw new Error('Attempt not found');
    }

    const exam = this.getExamById(attempt.examId);
    if (!exam) {
      throw new Error('Exam not found');
    }

    // Calculate score
    let correctAnswers = 0;
    let totalQuestions = exam.questions.length;

    attempt.answers.forEach(answer => {
      const question = exam.questions.find(q => q.id === answer.questionId);
      if (question && this.isAnswerCorrect(question, answer.answer)) {
        correctAnswers++;
        answer.isCorrect = true;
      } else {
        answer.isCorrect = false;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Update attempt with score and completion
    this._attempts.update(attempts => 
      attempts.map(a => 
        a.id === attemptId 
          ? { ...a, score, completedAt: new Date() }
          : a
      )
    );

    return score;
  }

  private isAnswerCorrect(question: Question, answer: string | string[]): boolean {
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
      return answer === question.correctAnswer;
    } else if (question.type === 'fill-in-blank') {
      const correctAnswers = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer 
        : [question.correctAnswer];
      return correctAnswers.some(correct => 
        correct.toLowerCase().trim() === (answer as string).toLowerCase().trim()
      );
    }
    return false;
  }

  private loadMockData(): void {
    const mockExams: Exam[] = [
      {
        id: '1',
        title: 'English Basics Test',
        description: 'Test your knowledge of basic English grammar and vocabulary',
        courseId: '1',
        duration: 30,
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            text: 'What is the correct form of "to be" for "I"?',
            type: 'multiple-choice',
            options: ['am', 'is', 'are', 'be'],
            correctAnswer: 'am',
            points: 10
          },
          {
            id: 'q2',
            text: 'The word "cat" is a noun.',
            type: 'true-false',
            correctAnswer: 'true',
            points: 10
          },
          {
            id: 'q3',
            text: 'Complete: "I ___ to school every day."',
            type: 'fill-in-blank',
            correctAnswer: 'go',
            points: 10
          }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        title: 'Intermediate Conversation Test',
        description: 'Test your intermediate conversation skills',
        courseId: '2',
        duration: 45,
        passingScore: 75,
        questions: [
          {
            id: 'q4',
            text: 'Which phrase is more polite?',
            type: 'multiple-choice',
            options: ['Give me that', 'Could you please give me that?', 'I want that', 'That, now'],
            correctAnswer: 'Could you please give me that?',
            points: 15
          },
          {
            id: 'q5',
            text: 'In business English, it\'s appropriate to use slang.',
            type: 'true-false',
            correctAnswer: 'false',
            points: 15
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];

    this._exams.set(mockExams);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
