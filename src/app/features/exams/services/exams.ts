import { Injectable, signal, computed, inject } from '@angular/core';
import { Exam, Question, ExamAttempt, Answer } from '../../../core/models/exam.model';
import { ScoresService } from '../../../core/services/scores.service';
import { AuthService } from '../../auth/services/auth';

@Injectable({
  providedIn: 'root'
})
export class ExamsService {
    private scoresService = inject(ScoresService);
    private authService = inject(AuthService);

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
    this.loadFromStorage();
  }

  async loadExams(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      // Simulate API call
      await this.delay(500);
      // Data is already loaded in constructor
    } catch {
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

  getAttemptById(attemptId: string): ExamAttempt | undefined {
    return this._attempts().find(attempt => attempt.id === attemptId);
  }

  async submitAnswer(attemptId: string, questionId: string, answer: string | string[] | number): Promise<void> {
    
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
    const totalQuestions = exam.questions.length;

    attempt.answers.forEach((answer) => {
      const question = exam.questions.find(q => q.id === answer.questionId);
      
      if (question) {
        const isCorrect = this.isAnswerCorrect(question, answer.answer);
        
        if (isCorrect) {
          correctAnswers++;
          answer.isCorrect = true;
        } else {
          answer.isCorrect = false;
        }
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

    // New method for direct exam submission with answers
    submitExamAttempt(examId: string, answers: Record<string, string | number>, score: number): void {
      const currentUser = this.authService.currentUser();
      if (!currentUser) return;

      const attempt: ExamAttempt = {
        id: Date.now().toString(),
        examId,
        userId: currentUser.id,
        answers: Object.entries(answers).map(([questionId, answerValue]) => ({
          questionId,
          answer: answerValue.toString(),
          isCorrect: false // Will be calculated later
        })),
        score,
        startedAt: new Date(),
        completedAt: new Date()
      };

      this._attempts.update(attempts => [...attempts, attempt]);

      // Add score to scores service
      const exam = this.getExamById(examId);
      if (exam) {
        this.scoresService.addScore(
          attempt,
          exam.title,
          `${currentUser.firstName} ${currentUser.lastName}`,
          currentUser.email
        );
      }
    }

  // Get user's exam attempts
  getUserAttempts(userId: string): ExamAttempt[] {
    return this._attempts().filter(attempt => attempt.userId === userId);
  }

  // Get exam statistics
  getExamStatistics(examId: string): { totalAttempts: number; averageScore: number; passRate: number } {
    const examAttempts = this._attempts().filter(attempt => attempt.examId === examId);
    const totalAttempts = examAttempts.length;
    
    if (totalAttempts === 0) {
      return { totalAttempts: 0, averageScore: 0, passRate: 0 };
    }

    const totalScore = examAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const averageScore = Math.round(totalScore / totalAttempts);
    
    const exam = this.getExamById(examId);
    const passingScore = exam?.passingScore || 70;
    const passedAttempts = examAttempts.filter(attempt => (attempt.score || 0) >= passingScore).length;
    const passRate = Math.round((passedAttempts / totalAttempts) * 100);

    return { totalAttempts, averageScore, passRate };
  }

  private isAnswerCorrect(question: Question, answer: string | string[] | number): boolean {

    if (question.type === 'multiple-choice') {
      // For multiple choice, correctAnswer is the index (number)
      const userAnswerIndex = typeof answer === 'number' ? answer : parseInt(String(answer));
      const correctIndex = typeof question.correctAnswer === 'number' ? question.correctAnswer : parseInt(String(question.correctAnswer));
      const isCorrect = userAnswerIndex === correctIndex;
      return isCorrect;
    } else if (question.type === 'true-false') {
      const isCorrect = String(answer).toLowerCase() === String(question.correctAnswer).toLowerCase();
      return isCorrect;
    } else if (question.type === 'fill-in-blank') {
      const correctAnswers = Array.isArray(question.correctAnswer) 
        ? question.correctAnswer 
        : [question.correctAnswer as string];
      const isCorrect = correctAnswers.some((correct: string | number) => 
        String(correct).toLowerCase().trim() === String(answer).toLowerCase().trim()
      );
      return isCorrect;
    }
    return false;
  }

  private loadFromStorage(): void {
    try {
      const storedExams = localStorage.getItem('english-learning-exams');
      if (storedExams) {
        const parsedExams = JSON.parse(storedExams);
        // Merge with existing mock data, avoiding duplicates
        const existingIds = this._exams().map(exam => exam.id);
        const newExams = parsedExams.filter((exam: Exam) => !existingIds.includes(exam.id));
        if (newExams.length > 0) {
          this._exams.update(exams => [...exams, ...newExams]);
        }
      }
    } catch {
      // Error loading from storage - ignore
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('english-learning-exams', JSON.stringify(this._exams()));
    } catch {
      // Error loading from storage - ignore
    }
  }

  private loadMockData(): void {
    const mockExams: Exam[] = [
      {
        id: '1',
        title: 'English Basics Test',
        description: 'Test your knowledge of basic English grammar and vocabulary',
        courseId: '1',
        level: 'beginner',
        duration: 30,
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            text: 'What is the correct form of "to be" for "I"?',
            type: 'multiple-choice',
            options: ['am', 'is', 'are', 'be'],
            correctAnswer: 0, // Index de 'am' dans le tableau
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
          },
          {
            id: 'q4',
            text: 'Which is the correct plural of "child"?',
            type: 'multiple-choice',
            options: ['childs', 'children', 'childes', 'childrens'],
            correctAnswer: 1, // Index de 'children' dans le tableau
            points: 10
          },
          {
            id: 'q5',
            text: 'What is the past tense of "go"?',
            type: 'multiple-choice',
            options: ['goed', 'went', 'gone', 'goes'],
            correctAnswer: 1, // Index de 'went' dans le tableau
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
        level: 'intermediate',
        duration: 45,
        passingScore: 75,
        questions: [
          {
            id: 'q6',
            text: 'Which phrase is more polite?',
            type: 'multiple-choice',
            options: ['Give me that', 'Could you please give me that?', 'I want that', 'That, now'],
            correctAnswer: 1, // Index de 'Could you please give me that?' dans le tableau
            points: 15
          },
          {
            id: 'q7',
            text: 'In business English, it\'s appropriate to use slang.',
            type: 'true-false',
            correctAnswer: 'false',
            points: 15
          },
          {
            id: 'q8',
            text: 'What does "I\'m running late" mean?',
            type: 'multiple-choice',
            options: ['I am jogging', 'I am behind schedule', 'I am running fast', 'I am tired'],
            correctAnswer: 1, // Index de 'I am behind schedule' dans le tableau
            points: 15
          },
          {
            id: 'q9',
            text: 'Complete: "I would like to ___ a reservation for tonight."',
            type: 'fill-in-blank',
            correctAnswer: 'make',
            points: 15
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '3',
        title: 'Advanced Grammar Test',
        description: 'Test your advanced English grammar knowledge',
        courseId: '3',
        level: 'advanced',
        duration: 60,
        passingScore: 80,
        questions: [
          {
            id: 'q10',
            text: 'Which sentence is correct?',
            type: 'multiple-choice',
            options: [
              'If I would have known, I would have come',
              'If I had known, I would have come',
              'If I would know, I would come',
              'If I know, I would come'
            ],
            correctAnswer: 'If I had known, I would have come',
            points: 20
          },
          {
            id: 'q11',
            text: 'What is the correct form: "The book ___ I read yesterday was interesting."',
            type: 'multiple-choice',
            options: ['which', 'who', 'whom', 'whose'],
            correctAnswer: 'which',
            points: 20
          },
          {
            id: 'q12',
            text: 'Complete: "By the time we arrived, the meeting ___ already started."',
            type: 'fill-in-blank',
            correctAnswer: 'had',
            points: 20
          },
          {
            id: 'q13',
            text: 'Which is the correct passive voice?',
            type: 'multiple-choice',
            options: [
              'The letter was written by John',
              'The letter was wrote by John',
              'The letter was writing by John',
              'The letter written by John'
            ],
            correctAnswer: 'The letter was written by John',
            points: 20
          }
        ],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: '4',
        title: 'Business English Test',
        description: 'Test your business English vocabulary and expressions',
        courseId: '4',
        level: 'intermediate',
        duration: 40,
        passingScore: 75,
        questions: [
          {
            id: 'q14',
            text: 'What does "deadline" mean in business context?',
            type: 'multiple-choice',
            options: [
              'A line that is not alive',
              'The final date for completing something',
              'A type of meeting',
              'A business strategy'
            ],
            correctAnswer: 'The final date for completing something',
            points: 20
          },
          {
            id: 'q15',
            text: 'Which phrase is appropriate for a business email?',
            type: 'multiple-choice',
            options: [
              'Hey, what\'s up?',
              'Dear Sir/Madam',
              'Yo, check this out',
              'Sup dude'
            ],
            correctAnswer: 'Dear Sir/Madam',
            points: 20
          },
          {
            id: 'q16',
            text: 'What does "to follow up" mean?',
            type: 'multiple-choice',
            options: [
              'To walk behind someone',
              'To continue or check on something later',
              'To copy someone',
              'To finish something'
            ],
            correctAnswer: 'To continue or check on something later',
            points: 20
          },
          {
            id: 'q17',
            text: 'Complete: "I would like to ___ a meeting to discuss the project."',
            type: 'fill-in-blank',
            correctAnswer: 'schedule',
            points: 20
          }
        ],
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15')
      },
      {
        id: '5',
        title: 'Vocabulary Test',
        description: 'Test your English vocabulary knowledge',
        courseId: '5',
        level: 'beginner',
        duration: 35,
        passingScore: 70,
        questions: [
          {
            id: 'q18',
            text: 'What is the opposite of "ancient"?',
            type: 'multiple-choice',
            options: ['old', 'modern', 'historic', 'traditional'],
            correctAnswer: 'modern',
            points: 15
          },
          {
            id: 'q19',
            text: 'What does "enormous" mean?',
            type: 'multiple-choice',
            options: ['very small', 'very large', 'very fast', 'very slow'],
            correctAnswer: 'very large',
            points: 15
          },
          {
            id: 'q20',
            text: 'Which word means "to make something better"?',
            type: 'multiple-choice',
            options: ['improve', 'worsen', 'destroy', 'ignore'],
            correctAnswer: 'improve',
            points: 15
          },
          {
            id: 'q21',
            text: 'What is a synonym for "beautiful"?',
            type: 'multiple-choice',
            options: ['ugly', 'pretty', 'strange', 'boring'],
            correctAnswer: 'pretty',
            points: 15
          },
          {
            id: 'q22',
            text: 'Complete: "The weather is ___ today, perfect for a picnic."',
            type: 'fill-in-blank',
            correctAnswer: 'sunny',
            points: 15
          }
        ],
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
      }
    ];

    this._exams.set(mockExams);
  }

  // Admin CRUD operations
  async addExam(exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      await this.delay(500);
      const newExam: Exam = {
        ...exam,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this._exams.update(exams => {
        const updated = [...exams, newExam];
        return updated;
      });
      this.saveToStorage();
    } catch {
      this._error.set('Failed to add exam');
    } finally {
      this._isLoading.set(false);
    }
  }

  async updateExam(updatedExam: Exam): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      await this.delay(500);
        this._exams.update(exams =>
          exams.map(exam => (exam.id === updatedExam.id ? { ...updatedExam, updatedAt: new Date() } : exam))
        );
        this.saveToStorage();
    } catch {
      this._error.set('Failed to update exam');
    } finally {
      this._isLoading.set(false);
    }
  }

  async deleteExam(examId: string): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      await this.delay(500);
        this._exams.update(exams => exams.filter(exam => exam.id !== examId));
        this.saveToStorage();
    } catch {
      this._error.set('Failed to delete exam');
    } finally {
      this._isLoading.set(false);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
