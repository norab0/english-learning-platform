import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoresService, UserScore, ExamStats } from '../../../../core/services/scores.service';
import { ExamsService } from '../../../exams/services/exams';

@Component({
  selector: 'app-scores-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scores-dashboard.html',
  styleUrl: './scores-dashboard.scss'
})
export class ScoresDashboardComponent implements OnInit {
  private scoresService = inject(ScoresService);
  private examsService = inject(ExamsService);

  // Computed signals
  scores = computed(() => this.scoresService.scores());
  exams = computed(() => this.examsService.exams());
  isLoading = computed(() => this.scoresService.isLoading());
  error = computed(() => this.scoresService.error());

  // Statistics
  totalScores = computed(() => this.scoresService.totalScores());
  averageScore = computed(() => this.scoresService.averageScore());
  passRate = computed(() => this.scoresService.passRate());

  // Exam statistics
  examStats = computed(() => {
    return this.exams().map(exam => this.scoresService.getExamStats(exam.id));
  });

  // Recent scores
  recentScores = computed(() => {
    return this.scores().slice(-10).reverse();
  });

  // Top performers
  topPerformers = computed(() => {
    const userScores = new Map<string, { name: string; totalScore: number; count: number }>();
    
    this.scores().forEach(score => {
      const existing = userScores.get(score.userId);
      if (existing) {
        existing.totalScore += score.percentage;
        existing.count += 1;
      } else {
        userScores.set(score.userId, {
          name: score.userName,
          totalScore: score.percentage,
          count: 1
        });
      }
    });

    return Array.from(userScores.values())
      .map(user => ({
        name: user.name,
        averageScore: Math.round(user.totalScore / user.count)
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);
  });

  ngOnInit(): void {
    this.examsService.loadExams();
  }

  getScoreColor(percentage: number): string {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  getScoreBadgeClass(percentage: number): string {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  getPassRateColor(rate: number): string {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
