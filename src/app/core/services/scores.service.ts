import { Injectable, signal, computed } from '@angular/core';
import { ExamAttempt } from '../models/exam.model';

export interface UserScore {
  userId: string;
  userName: string;
  userEmail: string;
  examId: string;
  examTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt: Date;
  attempts: number;
}

export interface ExamStats {
  examId: string;
  examTitle: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  bestScore: number;
  worstScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScoresService {
  private _scores = signal<UserScore[]>([]);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Computed signals
  public readonly scores = this._scores.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();

  // Computed statistics
  public readonly totalScores = computed(() => this._scores().length);
  public readonly averageScore = computed(() => {
    const scores = this._scores();
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length;
  });
  public readonly passRate = computed(() => {
    const scores = this._scores();
    if (scores.length === 0) return 0;
    const passed = scores.filter(score => score.passed).length;
    return (passed / scores.length) * 100;
  });

  constructor() {
    this.loadFromStorage();
    // Only load mock data if no data exists in storage
    if (this._scores().length === 0) {
      this.loadMockScores();
    }
  }

  // Get scores for a specific user
  getUserScores(userId: string): UserScore[] {
    return this._scores().filter(score => score.userId === userId);
  }

  // Get scores for a specific exam
  getExamScores(examId: string): UserScore[] {
    return this._scores().filter(score => score.examId === examId);
  }

  // Get user's best score for an exam
  getUserBestScore(userId: string, examId: string): UserScore | null {
    const allScores = this._scores();
    console.log('All scores:', allScores);
    console.log('Looking for userId:', userId, 'examId:', examId);
    
    const userExamScores = allScores.filter(
      score => score.userId === userId && score.examId === examId
    );
    console.log('User exam scores:', userExamScores);
    
    if (userExamScores.length === 0) return null;
    const bestScore = userExamScores.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
    console.log('Best score found:', bestScore);
    return bestScore;
  }

  // Get exam statistics
  getExamStats(examId: string): ExamStats {
    const examScores = this.getExamScores(examId);
    
    if (examScores.length === 0) {
      return {
        examId,
        examTitle: 'Unknown Exam',
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        bestScore: 0,
        worstScore: 0
      };
    }

    const percentages = examScores.map(score => score.percentage);
    const passed = examScores.filter(score => score.passed).length;

    return {
      examId,
      examTitle: examScores[0]?.examTitle || 'Unknown Exam',
      totalAttempts: examScores.length,
      averageScore: percentages.reduce((sum, score) => sum + score, 0) / percentages.length,
      passRate: (passed / examScores.length) * 100,
      bestScore: Math.max(...percentages),
      worstScore: Math.min(...percentages)
    };
  }

  // Add a new score
  addScore(attempt: ExamAttempt, examTitle: string, userName: string, userEmail: string, passingScore: number = 70): void {
    const userScore: UserScore = {
      userId: attempt.userId,
      userName,
      userEmail,
      examId: attempt.examId,
      examTitle,
      score: attempt.score || 0,
      maxScore: 100,
      percentage: attempt.score || 0,
      passed: (attempt.score || 0) >= passingScore,
      completedAt: attempt.completedAt || new Date(),
      attempts: 1 // This would be calculated based on previous attempts
    };

    console.log('Adding score to ScoresService:', userScore);

    this._scores.update(scores => {
      // Check if this score already exists (same userId, examId, and completedAt)
      const existingScore = scores.find(s => 
        s.userId === userScore.userId && 
        s.examId === userScore.examId && 
        s.completedAt.getTime() === userScore.completedAt.getTime()
      );
      
      if (existingScore) {
        console.log('Score already exists, updating instead of adding:', existingScore);
        // Update existing score
        return scores.map(s => 
          s.userId === userScore.userId && 
          s.examId === userScore.examId && 
          s.completedAt.getTime() === userScore.completedAt.getTime()
            ? userScore 
            : s
        );
      } else {
        console.log('Adding new score');
        return [...scores, userScore];
      }
    });

    // Save to storage after updating the signal
    this.saveToStorage();
  }

  // Get leaderboard for an exam
  getExamLeaderboard(examId: string, limit = 10): UserScore[] {
    return this.getExamScores(examId)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, limit);
  }

  // Get user's overall performance
  getUserPerformance(userId: string): {
    totalExams: number;
    averageScore: number;
    passedExams: number;
    failedExams: number;
    bestScore: number;
    recentScores: UserScore[];
  } {
    const userScores = this.getUserScores(userId);
    
    if (userScores.length === 0) {
      return {
        totalExams: 0,
        averageScore: 0,
        passedExams: 0,
        failedExams: 0,
        bestScore: 0,
        recentScores: []
      };
    }

    const passed = userScores.filter(score => score.passed).length;
    const bestScore = Math.max(...userScores.map(score => score.percentage));
    const averageScore = userScores.reduce((sum, score) => sum + score.percentage, 0) / userScores.length;

    return {
      totalExams: userScores.length,
      averageScore: Math.round(averageScore),
      passedExams: passed,
      failedExams: userScores.length - passed,
      bestScore: Math.round(bestScore),
      recentScores: userScores
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
        .slice(0, 5)
    };
  }

  private loadMockScores(): void {
    const mockScores: UserScore[] = [
      {
        userId: '1',
        userName: 'Admin User',
        userEmail: 'admin@test.com',
        examId: '1',
        examTitle: 'English Basics Test',
        score: 85,
        maxScore: 100,
        percentage: 85,
        passed: true,
        completedAt: new Date('2024-09-20T10:30:00'),
        attempts: 1
      },
      {
        userId: '1',
        userName: 'Admin User',
        userEmail: 'admin@test.com',
        examId: '2',
        examTitle: 'Intermediate Conversation Test',
        score: 78,
        maxScore: 100,
        percentage: 78,
        passed: true,
        completedAt: new Date('2024-09-20T14:15:00'),
        attempts: 1
      },
      {
        userId: '1',
        userName: 'Admin User',
        userEmail: 'admin@test.com',
        examId: '3',
        examTitle: 'Advanced Grammar Test',
        score: 92,
        maxScore: 100,
        percentage: 92,
        passed: true,
        completedAt: new Date('2024-09-21T09:30:00'),
        attempts: 1
      },
      {
        userId: '2',
        userName: 'Regular User',
        userEmail: 'user@test.com',
        examId: '1',
        examTitle: 'English Basics Test',
        score: 88,
        maxScore: 100,
        percentage: 88,
        passed: true,
        completedAt: new Date('2024-09-20T11:15:00'),
        attempts: 1
      },
      {
        userId: '2',
        userName: 'Regular User',
        userEmail: 'user@test.com',
        examId: '2',
        examTitle: 'Intermediate Conversation Test',
        score: 65,
        maxScore: 100,
        percentage: 65,
        passed: false,
        completedAt: new Date('2024-09-20T15:30:00'),
        attempts: 1
      },
    ];

    // Initialize with mock scores for demonstration
    this._scores.set(mockScores);
  }

  loadFromStorage(): void {
    try {
      const storedScores = localStorage.getItem('english-learning-scores');
      if (storedScores) {
        const parsedScores = JSON.parse(storedScores);
        // Convert date strings back to Date objects
        const scoresWithDates = parsedScores.map((score: any) => ({
          ...score,
          completedAt: new Date(score.completedAt)
        }));
        this._scores.set(scoresWithDates);
        console.log('Loaded scores from storage:', scoresWithDates);
      }
    } catch (error) {
      console.error('Error loading scores from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const scores = this._scores();
      console.log('Saving scores to storage:', scores);
      localStorage.setItem('english-learning-scores', JSON.stringify(scores));
      console.log('Scores saved successfully to localStorage');
    } catch (error) {
      console.error('Error saving scores to storage:', error);
    }
  }
}
